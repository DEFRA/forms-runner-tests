# forms-runner-tests

End-to-end (E2E) tests for the DEFRA Forms Runner, using Playwright.

## Prerequisites

- Node.js (LTS recommended)
- npm (ships with Node)
- A running Forms Runner instance (see **Running Forms Runner** below)

## Install

1. Install Node dependencies:

```sh
npm ci
```

2. Install Playwright browsers

This project currently runs tests against **Chromium** (see `projects` in `playwright.config.js`).

```sh
npx playwright install chromium
```

Notes:

- On Linux CI images you may need OS dependencies:

```sh
npx playwright install --with-deps chromium
```

- To install all supported browsers (larger download):

```sh
npx playwright install
```

## Running Forms Runner

The Playwright config uses a base URL for the environment under test.

- For `local`, the base URL is `http://localhost:3009`.
- Start Forms Runner separately (for example using forms test harness).

If your runner is on a different URL/port, update `baseURLs` in `playwright.config.js`.

## Configuration

This repo loads environment variables via `dotenv` (see `src/config.js`).

- The current schema expects these keys:
  - `testEnvironment` (defaults to `local`)
  - `timeout` (defaults to `30000`)

Important: the provided `.env` file currently uses uppercase keys (`TEST_ENVIRONMENT`, `TIMEOUT`), which are not read by `src/config.js` as-written.

To configure via `.env`, either:

- Change the keys in `.env` to match the schema:

```dotenv
testEnvironment=local
timeout=30000
```

- Or export env vars when running commands:

```sh
testEnvironment=local timeout=30000 npm test
```

## Run tests

Run all tests (headless by default):

```sh
npm test
```

Run with the browser visible:

```sh
npm run test:headed
```

Debug interactively (Playwright inspector):

```sh
npm run test:debug
```

Run a single test file:

```sh
npx playwright test -- form.spec.js
```

### Reports

The test run produces an HTML report.

```sh
npm run report
```

## Lint

```sh
npm run lint
```

## Scripts (package.json)

- `npm test`: run all Playwright tests
- `npm run test:headed`: run tests in headed mode
- `npm run test:debug`: run tests with the Playwright inspector
- `npm run report`: open the last HTML report
- `npm run lint`: run ESLint

The following scripts exist but may currently be placeholders (no matching files in `src/` at the time of writing):

- `npm run test:parser`
- `npm run inspect`
