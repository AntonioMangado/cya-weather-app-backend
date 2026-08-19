# CyA Weather App — Backend

NestJS API serving current weather and a 3-day forecast for a given city, backed by [WeatherAPI](https://www.weatherapi.com/). Consumed by the [frontend](../frontend).

## Scripts

- `npm run start:dev` — start the dev server (watch mode)
- `npm run build` — compile to `dist/`
- `npm test` — run unit tests (Jest)
- `npm run test:e2e` — run e2e tests
- `npm run lint` — run ESLint
- `npm run format` — run Prettier

## Project conventions

- No authentication/authorization — all requests are treated as guest requests.
- All requests are logged as wide events (see `PLAN.md` at the repo root) to a file, partitioned by day — not to the console.
