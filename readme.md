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

Common keys:

- `TEST_ENVIRONMENT` (defaults to `local`)
- `TIMEOUT` (defaults to `30000`)
- `FORMS_MANAGER_URL` (optional, used for loading live and draft form definitions)
- `LIVE_FORM_DEFINITION_IDS` (optional, comma-separated live form IDs)
- `DRAFT_FORM_DEFINITION_IDS` (optional, comma-separated draft form IDs)
- `TEST_FORM_DEFINITION_IDS` (optional, comma-separated live form IDs to fully submit)

When `LIVE_FORM_DEFINITION_IDS` is set, the live-form manager spec will:

- fetch each form's metadata from `${FORMS_MANAGER_URL}/forms/{id}`
- fetch each live form definition from `${FORMS_MANAGER_URL}/forms/{id}/definition`
- run **fill tests only** against the live runner form URL
- stop at the summary page and **not submit** the form

When `DRAFT_FORM_DEFINITION_IDS` is set, the same spec will:

- fetch each form's metadata from `${FORMS_MANAGER_URL}/forms/{id}`
- fetch each draft form definition from `${FORMS_MANAGER_URL}/forms/{id}/definition/draft`
- run against the draft preview runner URL `${baseURL}/form/preview/draft/{slug}`
- submit the draft form from the summary page

When `TEST_FORM_DEFINITION_IDS` is set, the same spec will:

- fetch each form's metadata from `${FORMS_MANAGER_URL}/forms/{id}`
- fetch each live form definition from `${FORMS_MANAGER_URL}/forms/{id}/definition`
- run against the live runner URL `${baseURL}/form/{slug}`
- submit the form from the summary page

Example:

```dotenv
TEST_ENVIRONMENT=local
TIMEOUT=30000
FORMS_MANAGER_URL=http://localhost:3001
LIVE_FORM_DEFINITION_IDS=681b184463c68bf6b99e2c62,681b184463c68bf6b99e2c63
DRAFT_FORM_DEFINITION_IDS=681b184463c68bf6b99e2c64,681b184463c68bf6b99e2c65
TEST_FORM_DEFINITION_IDS=681b184463c68bf6b99e2c66,681b184463c68bf6b99e2c67
```

## Run tests

Run all tests (headless by default):

```sh
npm test
```

Run only the live forms-manager fill tests:

```sh
npx playwright test src/tests/live-form-manager.spec.js
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
