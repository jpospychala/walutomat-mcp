import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as crypto from 'crypto';
import * as fs from 'fs';
import { z } from "zod";


const baseUrl = 'https://api.walutomat.pl';
const apiKey = `${process.env.WT_API_KEY}`;

console.log(apiKey);

// Create an MCP server
const server = new McpServer({
  name: "Walutomat",
  version: "1.0.0"
});

async function wtApi(endpoint: string, query?: {}, shouldSign: boolean = false) {
  console.log(query, query ? 't' : 'n');
  const params = query ? '?' + new URLSearchParams(query).toString() : ''
  const _url = `${baseUrl}${endpoint}${params}`;

  const signHeaders = shouldSign ? sign(endpoint, params) : {}

  const response = await fetch(_url, {
    headers: {
      'X-API-Key': apiKey,
      ...signHeaders,
    },
  });
  return await response.json();
}

function sign(endpoint: string, params: string) {
  const timestamp = new Date().toISOString();
  const toSign = timestamp + endpoint + params;
  const privateKey = fs.readFileSync('./private.key', 'utf8');
  const sign = crypto.createSign('SHA256');
  sign.update(toSign);
  const signature = sign.sign(privateKey, 'base64');
  return {
    'X-API-Timestamp': timestamp,
    'X-API-Signature': signature,
  };
}

server.tool("account-balance", { }, async ({ }) => {
    const response = await wtApi('/api/v2.0.0/account/balances')
    return {
      content: [{ type: "text", text: JSON.stringify(response.result) }]
    }
  }
);

server.tool("account-history", {}, async ({}) => {
    const params = {
      itemLimit: 10,
      dateFrom: '2025-05-20T00:00:00Z'
    }
    const response = await wtApi('/api/v2.0.0/account/history', params, true)
    return {
      content: [{ type: "text", text: JSON.stringify(response.result) }]
    }
  }
);

/*server.tool("exchange currency", {  }, async ({ currencyPair }) => {
  const response = await wtApi('/market_fx/best_offers', { currencyPair })
  return {
    content: [{ type: "text", text: JSON.stringify(response) }]
  }
}
);*/

server.tool("best-offers", { currencyPair: z.string() }, async ({ currencyPair }) => {
  const response = await wtApi('/api/v2.0.0//market_fx/best_offers', { currencyPair })
  return {
    content: [{ type: "text", text: JSON.stringify(response.result) }]
  }
}
);

server.tool("active-orders", {}, async ({ }) => {
  const response = await wtApi('/api/v2.0.0//market_fx/best_offers')
  return {
    content: [{ type: "text", text: JSON.stringify(response) }]
  }
}
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
server.connect(transport);