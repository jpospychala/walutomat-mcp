import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as crypto from 'crypto';
import { HistoryItemOperationTypeEnum, GetHistoryParamsSortOrderEnum, MarketPair, NewOrderBuySellEnum, NewOrderVolumeCurrencyEnum } from './Walutomat/Api';
import * as fs from 'fs';
import * as uuid from 'uuid';
import { z } from "zod";

const baseUrl = process.env.WALUTOMAT_API_URL!;
const apiKey = process.env.WALUTOMAT_API_KEY!;
const privateKey = fs.readFileSync(process.env.WALUTOMAT_KEY_PATH!, 'utf8');
const dryRun = process.env.WALUTOMAT_DRY_RUN || 'true'; 

if (!apiKey) {
  throw new Error("Walutomat API key is missing");
}

const server = new McpServer({
  name: "Walutomat",
  version: "1.0.0"
});


server.tool("account-balance", 
  "Returns wallet balance",
  { }, async ({ }) => {
    const response = await wtApi('GET', '/api/v2.0.0/account/balances')
    return {
      content: [{ type: "text", text: JSON.stringify(response.result) }]
    }
  }
);


server.tool("account-history", 
  "Returns wallet history - operations recorded on the wallet",
  { 
    dateFrom: z.string().default("2025-05-20T00:00:00Z").optional().describe("Date in format YYYY-MM-DDThh:mm:ssTZD, if provided just operations recorded in this date and newer are returned (inclusive)"), 
    dateTo: z.string().default("2025-05-30T00:00:00Z").optional().describe("Date in format YYYY-MM-DDThh:mm:ssTZD, if provided just operations older than this date are returned (exclusive)"), 
    operationType: z.nativeEnum(HistoryItemOperationTypeEnum).optional().describe("Can be used to limit results to selected operation type like payin, payout, currency exchange or commission, if not provided all operations of any kind on multicurrency wallet are returned"), 
    itemLimit: z.number().default(10).describe("Maximum number of account operations fetched in one response. If actual number of operations satisfying request criteria exceeds volume number, response is trimmed to this number and next request with appropriate continueFrom parameter shall be used to read next batch of operations."),
    sortOrder: z.nativeEnum(GetHistoryParamsSortOrderEnum).default(GetHistoryParamsSortOrderEnum.DESC).describe("Sort order of returned elements."),
  }, 
  async ({ dateFrom, dateTo, operationType, itemLimit, sortOrder }) => {
    const params: any = { itemLimit, dateFrom, dateTo, operationType, sortOrder };
    const response = await wtApi('GET', '/api/v2.0.0/account/history', params, true)
    return {
      content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
    }
  }
);


server.tool("direct-fx-rates", 
  "Returns current exchange rate (buy and sell) offered by Currency One for specified currency pair",
  { 
    currencyPair: z.nativeEnum(MarketPair).describe("Currency pair, i.e. base currency and counter currency with no separator, e.g. EURPLN")
  }, async ({ currencyPair }) => {
  const response = await wtApi('GET', '/api/v2.0.0/direct)fx/rates', { currencyPair })
  return {
    content: [{ type: "text", text: JSON.stringify(response.result) }]
  }
}
);


server.tool("direct-fx-order", 
  "Requests currency exchange at rate provided by Currency One",
  { 
    currencyPair: z.nativeEnum(MarketPair).describe("Currency pair, i.e. base currency and counter currency with no separator, e.g. EURPLN"),
    buySell: z.nativeEnum(NewOrderBuySellEnum).describe("BUY or SELL operation"),
    volume: z.number().describe("Exchange volume, example 9.99"),
    volumeCurrency: z.nativeEnum(NewOrderVolumeCurrencyEnum).describe("Currency of provided volume value. ISO currency code."),
    ts: z.string().describe("An identifier of the rate received from Exchange rates response (it is always in ISO 8601 format), example '2018-03-27T09:58:06.945Z'")
  }, async ({ currencyPair, buySell, volume, volumeCurrency, ts }) => {
    const params: any = {
      dryRun,
      ...(dryRun ? {} : { submitId: uuid.v4() }),
      currencyPair,
      buySell,
      volume: volume.toFixed(2),
      volumeCurrency,
      ts
    }
  const response = await wtApi('POST', '/api/v2.0.0/direct_fx/exchanges', params, true)
  return {
    content: [{ type: "text", text: JSON.stringify(response) }]
  }
}
);


server.tool("market-fx-order", 
  "Platform allows to submit buy or sell order with price limit. Orders shall concern one of currency pairs listed on Walutomat market.",
  { 
    currencyPair: z.nativeEnum(MarketPair).describe("Currency pair, i.e. base currency and counter currency with no separator, e.g. EURPLN"),
    buySell: z.nativeEnum(NewOrderBuySellEnum).describe("BUY or SELL operation"),
    volume: z.number().describe("Exchange volume, example 9.99"),
    volumeCurrency: z.nativeEnum(NewOrderVolumeCurrencyEnum).describe("Currency of provided volume value. ISO currency code."),
    limitPrice: z.string().regex(/^[0-9]{1,2}([.][0-9]{1,4})?$/).describe("Maximum rate to buy currency at in case of BUY order, minimum rate to sell currency at in case of SELL order")
  }, async ({ currencyPair, buySell, volume, volumeCurrency, limitPrice }) => {
    const params: any = {
      dryRun,
      ...(dryRun ? {} : { submitId: uuid.v4() }),
      currencyPair,
      buySell,
      volume: volume.toFixed(2),
      volumeCurrency,
      limitPrice
    }
  const response = await wtApi('POST', '/api/v2.0.0/market_fx/orders', params, true)
  return {
    content: [{ type: "text", text: JSON.stringify(response) }]
  }
}
);


server.tool("market-best-offers", 
  "Returns 10 best bids and asks on currency pair in question",
  { 
    currencyPair: z.nativeEnum(MarketPair).describe("Currency pair, i.e. base currency and counter currency with no separator, e.g. EURPLN")
  }, async ({ currencyPair }) => {
  const response = await wtApi('GET', '/api/v2.0.0/market_fx/best_offers', { currencyPair })
  return {
    content: [{ type: "text", text: JSON.stringify(response.result) }]
  }
}
);


server.tool("market-active-orders", 
  "Returns active orders, ordered by most recently submitted.", 
  {}, async ({ }) => {
  const response = await wtApi('GET', '/api/v2.0.0/market_fx/orders/active')
  return {
    content: [{ type: "text", text: JSON.stringify(response) }]
  }
}
);


async function wtApi(method: "POST" | "GET", endpoint: string, query?: any, shouldSign: boolean = false) {
  var params = '';
  if (query) {
    var nonEmptyParams: any = {};
    for (const k in query) {
      if (query[k]) {
        nonEmptyParams[k] = query[k]
      }
    }
    params = nonEmptyParams ? new URLSearchParams(nonEmptyParams).toString() : ''
  }
  const _url = `${baseUrl}${endpoint}${method == 'GET' ? `?${params}` : ''}`;

  const signHeaders = shouldSign ? sign(endpoint, params) : {}

  const response = await fetch(_url, {
    method,
    body: method == 'POST' ? params : undefined,
    headers: {
      'X-API-Key': apiKey,
      ...(method == 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...signHeaders,
    },
  });
  return await response.json();
}

function sign(endpoint: string, params: string) {
  const timestamp = new Date().toISOString();
  const toSign = timestamp + endpoint + params;
  const sign = crypto.createSign('SHA256');
  sign.update(toSign);
  const signature = sign.sign(privateKey, 'base64');
  return {
    'X-API-Timestamp': timestamp,
    'X-API-Signature': signature,
  };
}


// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
server.connect(transport);