<img src="https://cdn.edge.network/assets/img/edge-logo-green.svg" width="200">

# Lottery API

Service to calculate and pay XE lottery winnings

## Development

This project is bundled as a single Docker image for deployment to Edge networks. In local development, it is simpler to run the Node \(backend) and Vue projects separately.

> The Node application root is here, and the Vue application root is in [web](web/).

Before you do anything else, copy [.env.develop](./.env.develop) to .env and [web/.env.develop](web/.env.develop) to web/.env, then configure both as required for your testing. These include defaults for working locally, apart from the payer wallet.

> For complete lists of variables, refer to [index.ts](src/index.ts) for Node variables and [web/src/stores/build.ts](./web/src/stores/build.ts) for Vue variables.
>
> If running the Docker image, combine all env variables into a single list. Vue frontend variables are distinguished by their `VITE_` [prefix](https://vitejs.dev/guide/env-and-mode.html#env-files).

> A payer wallet (`FUNDS_PAYER_*`) is only required when actually processing payouts. By default, this behaviour is disabled to prevent accidental loss of funds!

To start the Node backend, execute `docker compose up -d` (to start an ArangoDB database) and then `npm run dev` in the project root. Then, to start the Vue frontend, run `npm run dev` in the [web](web/) directory. To close everything, simply C-c both npm processes and run `docker-compose down` to stop the database.

## Contributing

Interested in contributing to the project? Amazing! Before you do, please have a quick look at our [Contributor Guidelines](CONTRIBUTING.md) where we've got a few tips to help you get started.

## License

Edge is the infrastructure of Web3. A peer-to-peer network and blockchain providing high performance decentralised web services, powered by the spare capacity all around us.

Copyright notice
(C) 2023 Edge Network Technologies Limited <support@edge.network><br />
All rights reserved

This product is part of Edge.
Edge is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version ("the GPL").

**If you wish to use Edge outside the scope of the GPL, please contact us at licensing@edge.network for details of alternative license arrangements.**

**This product may be distributed alongside other components available under different licenses (which may not be GPL). See those components themselves, or the documentation accompanying them, to determine what licenses are applicable.**

Edge is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

The GNU General Public License (GPL) is available at: https://www.gnu.org/licenses/gpl-3.0.en.html<br />
A copy can be found in the file GPL.md distributed with
these files.

This copyright notice MUST APPEAR in all copies of the product!
