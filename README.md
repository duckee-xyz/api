# 💻 Duckee API

This is API server implementation of Duckee, an generative art exchange platform on [Flow](https://flow.com/).

* Testnet API Endpoint: [**api.duckee.xyz**](https://api.duckee.xyz)
* [Swagger API Documentation](https://api.duckee.xyz/swagger)

## Getting Started

### Prerequisites

* Node.JS >= 16 or higher
* [`pnpm`](https://pnpm.io) Package Manager
* Flow Emulator with [duckee-xyz/contract](https://github.com/duckee-xyz/contract) deployed

### Setting Up Dependencies

Duckee API uses [pnpm](https://pnpm.io) as dependency manager. Before installing use corepack to activate it:

```
 $ corepack enable  # this installs pnpm
 $ pnpm install
```

### Configuring API

You need to prepare the configuration as environment variables. For details, please refer
to [`src/config.ts`](./src/config.ts). We recommend setting up `.env` file
with [autoenv](https://github.com/hyperupcall/autoenv):

```
 $ cat .env.local
 DB_HOST=localhost:3306
 DB_USER=duckee
 PRIVATE_KEY=...
```

## Deploying API

AWS Lambda
