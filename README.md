# Starting up with Docker

## Requirements

- Docker
- Docker compose
- Node.js 24

Create a `.env` file at the root of the project following the `.env.example`

After fulfilling the required environment variables,
at the source of the project, run:

```bash
docker compose up --build
```

Both database and API should be running.
To access the API simply follow the link: <http://127.0.0.1/3000>
(The port can be changed using the `PORT` env variable)

## Running the tests

The tests are unit tests written with [Jest](https://jestjs.io/)(compiled with `@swc/jest`).
Repositories are mocked, so **no database, Docker or `.env` file is needed**.

### Run all tests

```bash
npm test
```

### Run a single test file

```bash
npx jest tests/application/handlers/chemicals/createChemical.test.ts
```

### What is covered

Tests live in `tests/` and mirror the structure of `src/`.

- `createChemical`: creates a product; returns `400` when the name is missing or
  blank; returns `400` when `risk_class_id` is missing.
- `createChemicalCargo`: creates a cargo for an active product;
  returns `400` when the product is inactive; returns `400` when `quantity` is
  `0` or negative.
