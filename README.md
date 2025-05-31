# Walutomat MCP Server (Beta!)

A Model Context Protocol (MCP) server that provides AI applications with access to Walutomat's currency exchange services and real-time exchange rates.

## Overview
This MCP server enables AI assistants to interact with Walutomat, Poland's leading online currency exchange platform, allowing users to:

- Get real-time currency exchange rates
- Place currency exchange orders
- Initiate transfers internally, as well as within SEPA and SWIFT zones

## Usage Examples

### Basic Rate Query
```
User: What's the current EUR to PLN exchange rate?
Assistant: I'll check the current EUR to PLN exchange rate for you using Walutomat.
```

### Currency Conversion
```
User: How much is 500 USD in Polish Złoty?
Assistant: I'll convert 500 USD to PLN using current Walutomat rates.
```

### Market Information
```
User: What currencies can I exchange on Walutomat?
Assistant: Let me get the list of supported currencies from Walutomat.
```

## Available Tools

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

## Configuration

### Claude Desktop

Add the server to your Claude Desktop configuration file:
MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
Windows: `%APPDATA%/Claude/claude_desktop_config.json`

json

```json
{
    "mcpServers": {
      "walutomat": {
        "command": "node",
        "args": ["dist/index.js"],
        "env": {
          "WALUTOMAT_API_KEY": "Walutomat API key",
          "WALUTOMAT_KEY_PATH": "path to RSA private key required to sign requests to Walutomat API",
          "WALUTOMAT_API_URL": "https://api.walutomat.dev for Sandbox or https://api.walutomat.pl for Prod",
          "WALUTOMAT_DRY_RUN": "true or false- true to run in dryRun mode, no real transactions are made. False otherwise. Use with caution!"
        }
      }
    }
  }
```

### Environment Variables

Create a `.env` file in the project root:

```env
WT_API_KEY=your-api-key-if-required
```

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This is an unofficial integration with Walutomat. Please refer to Walutomat's terms of service and API documentation for official usage guidelines.

## Support

- **Issues**: [GitHub Issues](https://github.com/your-username/walutomat-mcp-server/issues)
- **Documentation**: [MCP Documentation](https://modelcontextprotocol.io)
- **Walutomat**: [Official Website](https://walutomat.pl)
