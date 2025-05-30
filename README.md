# Walutomat MCP Server (Beta!)

This package provides following tools

- `account-balance` - Returns wallet balance
- `account-history` - Returns wallet history - operations recorded on the wallet
- `transfer-status` - Learn transfer status and details
- `transfer-to-wallet` - Requests new internal transfer from own wallet to another wallet operated by Currency One.
- `transfer-to-iban` - Requests new transfer from wallet where destination account number is provided in IBAN format
- `transfer-to-sepa` - Requests new SEPA transfer from wallet where destination account number is provided in IBAN format
- `transfer-to-noniban` - Requests new transfer from wallet to non-IBAN destinations
- `direct-fx-rates` - Returns current exchange rate (buy and sell) offered by Currency One for specified currency pair
- `direct-fx-order` - Requests currency exchange at rate provided by Currency One
- `market-fx-order` - Platform allows to submit buy or sell order with price limit. Orders shall concern one of currency pairs listed on Walutomat market
- `market-best-offers` - Returns 10 best bids and asks on currency pair in question
- `market-active-orders` - Returns active orders, ordered by most recently submitted.

## Enable on Claude Desktop

```
{
    "mcpServers": {
      "walutomat": {
        "command": "node",
        "args": ["dist/index.js"],
        "env": {
          "WT_API_KEY": "walutomat api key"
        }
      }
    }
  }
```

![caption](demo.webm)