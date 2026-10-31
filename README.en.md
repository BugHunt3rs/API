# Quimi-Port API

[🇧🇷 Português](README.md) · 🇺🇸 English

REST API to register chemical products and control the life cycle of the chemical cargos moved through port terminals.

## Table of contents

- [Solution description](#solution-description)
- [Problem it solves](#problem-it-solves)
- [Tech stack](#tech-stack)
- [Running locally](#running-locally)
- [Running with Docker](#running-with-docker)
- [Environment variables](#environment-variables)
- [Tests](#tests)
- [API documentation](#api-documentation)
- [Main endpoints](#main-endpoints)
- [Business rules](#business-rules)
- [Database](#database)
- [Logs](#logs)
- [Continuous integration](#continuous-integration)
- [Architectural decisions](#architectural-decisions)
- [Known limitations](#known-limitations)
- [Group members](#group-members)

---

## Solution description

Quimi-Port API is the backend of the Quimi-Port application. It holds the business rules for registering **chemical products** and **chemical cargos**, and controls the path each cargo follows (from registered to done or canceled) through a state machine.

What the API does:

- Creates, lists, reads, updates and deactivates chemical products.
- Registers cargos linked to an **active** product, with quantity, origin, destination, technical manager and required documentation.
- Moves a cargo between statuses (`Registered`, `Under Analyses`, `Under inspection`, `Released`, `Blocked`, `Moving`, `Done` and `Canceled`), refusing any transition outside the allowed flow.
- Requires the documentation to be delivered before a cargo goes to inspection and before it is released.
- Logs creations, updates and errors, and shows incoming requests in the console.

## Problem it solves

Inspired by the operations of the Port of Santos, the project addresses the lack of standardization, traceability and regulatory safety in the handling of chemical compounds. The API prevents an inactive product from receiving new cargos, a cargo from being released without the required documentation, a blocked cargo from being moved and a canceled cargo from coming back into the flow, reducing operational and environmental risks.

---

## Tech stack

| Item | Technology |
| :-- | :-- |
| Runtime | Node.js 24 |
| Language | TypeScript |
| Web framework | Express 5 |
| ORM | Prisma 7 (with `@prisma/adapter-pg`) |
| Database | PostgreSQL 17 |
| API documentation | OpenAPI 3 + Swagger UI (`swagger-ui-express`) |
| Tests | Jest with `@swc/jest` |
| Build | `tsdown` (outputs `dist/index.mjs`) |
| Containers | Docker and Docker Compose |
| CI | GitHub Actions |

### Why PostgreSQL

The data is strongly relational: a cargo references the product, the status, the unit of measure, the technical manager and the documentation, and a product references the risk class and the compatibility group. PostgreSQL enforces this integrity with foreign keys and strong types (`TIMESTAMPTZ`, `BOOLEAN`, `JSON`), plus transactions and joins. A document database (such as MongoDB) would require this integrity to be reimplemented in the application.

### Why Express

It is the best-known framework in the Node.js ecosystem, with a small API that does not impose a structure. That let us organize the code in our own layers (domain, application and infrastructure) instead of following the structure of an opinionated framework such as NestJS. Version 5 handles errors from async handlers natively.

### Why there is no services layer

Business rules live in **pure domain functions** (for example, `canMoveChemicalCargo`), called directly by the handlers. A handler orchestrates one use case (validate the input, read from the repository, apply the rule, persist and respond). Since each use case has its own file and the rule depends on neither HTTP nor the database, a services layer would only add a level of indirection with no gain in testability.

---

## Running locally

Requirements: Node.js 24, Docker and Docker Compose.

1. **Clone the repository and install the dependencies:**

   ```bash
   git clone https://github.com/BugHunt3rs/API.git
   cd API
   npm clean-install
   ```

2. **Create the `.env` file** from the template and adjust the values:

   ```bash
   cp .env.example .env
   ```

   To run the API outside Docker, keep `DATABASE_URL` pointing to `localhost` (see [Environment variables](#environment-variables)).

3. **Start only the database:**

   ```bash
   docker compose up -d database
   ```

   The first time the volume is created, PostgreSQL runs `src/infrastructure/database/migrations/migration.sql`, which creates the tables and inserts the initial data. There is no migration command to run.

4. **Generate the Prisma client:**

   ```bash
   npx prisma generate
   ```

5. **Start the development server:**

   ```bash
   npm run dev
   ```

   The API listens on the port set in `PORT` (if the variable is missing, it uses `5173`).

To **recreate the database from scratch** (deletes all data and runs `migration.sql` again):

```bash
docker compose down -v
docker compose up -d database
```

## Running with Docker

With the `.env` created (see above), start the database and the API together:

```bash
docker compose up --build
```

- The API is available at `http://localhost:3000` and the documentation at `http://localhost:3000/docs`.
- The database listens on port `5432`, and its data persists in the named volume `postgres_data`.
- The API image is built from the `dockerfile`, which installs the dependencies and runs `npm run build`.
- Inside Compose, the API reaches the database through the service name (`database`), not `localhost`. Use the Docker `DATABASE_URL` shown in `.env.example`.
- Compose publishes the API's port `3000`. Keep `PORT=3000` in `.env` when running with Docker.

## Environment variables

They all live in the `.env` file (which is not committed). `.env.example` is the template.

| Variable | Description | Example |
| :-- | :-- | :-- |
| `DATABASE_NAME` | Name of the database created by the container | `quimiport` |
| `DATABASE_USER` | Database user | `quimiport` |
| `DATABASE_PASSWORD` | Database password | `quimiport` |
| `DATABASE_URL` | Connection URL used by the API | see below |
| `PORT` | Port the API listens on | `3000` |

`DATABASE_URL` changes depending on where the API runs:

```env
# API outside Docker (npm run dev)
DATABASE_URL="postgresql://quimiport:quimiport@localhost:5432/quimiport?schema=public"

# API inside Docker Compose (the host is the service name)
DATABASE_URL="postgresql://quimiport:quimiport@database:5432/quimiport?schema=public"
```

The user, password and database name must be the same in the first three variables and in the URL.

---

## Tests

The tests are unit tests written with [Jest](https://jestjs.io/) and compiled with `@swc/jest`. Repositories are mocked, so they **need no database, no Docker and no `.env`**.

```bash
# all tests
npm test

# a single file
npx jest tests/domain/rules/chemical_cargo/cargoStatusRules.test.ts
```

Tests live in `tests/`, mirroring the structure of `src/`. The suite has 95 tests covering:

| Area | What is checked |
| :-- | :-- |
| `createChemical` | Creates the product; rejects a missing or blank name, a missing risk class, a missing compatibility group and a non-boolean `status` |
| `createChemicalCargo` | Registers the cargo; rejects an inactive product and a `0` or negative quantity |
| `cargoStatusRules` | Allowed and forbidden transitions, final states and refusal reasons |
| `updateChemicalCargoStatus` | Valid status update, forbidden transition (409), unknown status, invalid id and unknown cargo |
| `releaseChemicalCargo` | Release with documentation; refusal without documentation and of a blocked cargo (409); 404 and 400 |
| `blockChemicalCargo` | Blocking only from `Under inspection` |
| `cancelChemicalCargo` | Cancellation from the allowed statuses; refusal from `Canceled`, `Moving` and `Done` |
| `deliverChemicalCargoDocumentation` | Recording the delivered documentation; 400 and 404 |
| `getCargoStatusKey` | Converting the database status name into the key used by the rule |

There are no integration tests against a real database. The complete flows were verified manually against the PostgreSQL running in Docker.

---

## API documentation

The documentation is an **OpenAPI 3** specification (`openapi.yaml`, at the project root), served by Swagger UI while the API is running:

- **Swagger UI:** `http://localhost:3000/docs` (or the port set in `PORT`)
- **Specification file:** [`openapi.yaml`](openapi.yaml)

It lists every endpoint, parameter, request and response body with examples, the error codes and the status transition table. You can try each route with the **Try it out** button.

The specification is handwritten and does not validate requests: when you change a handler, update `openapi.yaml` too.

---

## Main endpoints

All routes are under `/v1`. Success responses have the shape `{ "data": ... }` and error responses `{ "error": "message" }`.

### Chemical products (`/v1/chemical`)

| Method | Route | Description |
| :-- | :-- | :-- |
| `POST` | `/v1/chemical` | Creates a product |
| `GET` | `/v1/chemical` | Lists the products |
| `GET` | `/v1/chemical/:id` | Gets a product by id |
| `PATCH` | `/v1/chemical/:id` | Updates fields of the product |
| `PATCH` | `/v1/chemical/deactivate/:id` | Deactivates the product (logical deactivation) |
| `DELETE` | `/v1/chemical/:id` | Removes the product |

### Chemical cargos (`/v1/chemicalCargo`)

| Method | Route | Description |
| :-- | :-- | :-- |
| `POST` | `/v1/chemicalCargo` | Registers a cargo |
| `GET` | `/v1/chemicalCargo` | Lists the cargos |
| `GET` | `/v1/chemicalCargo/:id` | Gets a cargo by id |
| `PATCH` | `/v1/chemicalCargo/:id` | Changes the status (`{ "status_id": 2 }`) |
| `PATCH` | `/v1/chemicalCargo/documentation/:id` | Records the delivered documentation (`{ "documentation_id": 1 }`) |
| `PATCH` | `/v1/chemicalCargo/release/:id` | Releases the cargo |
| `PATCH` | `/v1/chemicalCargo/block/:id` | Blocks the cargo |
| `PATCH` | `/v1/chemicalCargo/cancel/:id` | Cancels the cargo |

### Cargo statuses (`/v1/chemicalCargoStatus`)

| Method | Route | Description |
| :-- | :-- | :-- |
| `POST` | `/v1/chemicalCargoStatus` | Creates a status |
| `GET` | `/v1/chemicalCargoStatus` | Lists the statuses |
| `GET` | `/v1/chemicalCargoStatus/:id` | Gets a status by id |
| `DELETE` | `/v1/chemicalCargoStatus/:id` | Removes a status |

### Response codes

| Code | When |
| :-- | :-- |
| `200` / `201` | Success (`201` on creation) |
| `400` | Invalid body, missing required field, invalid route id, unknown or inactive product when registering a cargo, unknown `status_id` |
| `404` | Product, cargo or documentation not found |
| `409` | Status transition refused by the flow rules |
| `500` | Unexpected error |

### Complete flow example

```bash
# 1. Create a product (risk_class_id 8 = Corrosives, compatibility_group_id 2 = Acids)
curl -X POST http://localhost:3000/v1/chemical -H "Content-Type: application/json" \
  -d '{"name":"Nitric Acid","description":"Strong oxidizing acid","UN_number":"2031","risk_class_id":8,"compatibility_group_id":2,"status":true}'

# 2. Register a cargo of that product (status_id 1 = Registered)
curl -X POST http://localhost:3000/v1/chemicalCargo -H "Content-Type: application/json" \
  -d '{"cargo_code":"CARGO-100","chemical_id":1,"quantity":300,"measure_unity_id":2,"origin":"Santos","destination":"Cubatao","technical_manager_id":1,"required_documentation_id":1,"status_id":1,"delivery_date":"2026-12-10"}'

# 3. Send it to analysis (status_id 2 = Under Analyses)
curl -X PATCH http://localhost:3000/v1/chemicalCargo/1 -H "Content-Type: application/json" -d '{"status_id":2}'

# 4. Go to inspection without documentation: refused with 409
curl -X PATCH http://localhost:3000/v1/chemicalCargo/1 -H "Content-Type: application/json" -d '{"status_id":3}'
# {"error":"Invalid status transition - [\"Documentation not delivered\"]"}

# 5. Record the delivered documentation and try again (status_id 3 = Under inspection)
curl -X PATCH http://localhost:3000/v1/chemicalCargo/documentation/1 -H "Content-Type: application/json" -d '{"documentation_id":1}'
curl -X PATCH http://localhost:3000/v1/chemicalCargo/1 -H "Content-Type: application/json" -d '{"status_id":3}'

# 6. Release, move and finish (status_id 6 = Moving, 7 = Done)
curl -X PATCH http://localhost:3000/v1/chemicalCargo/release/1
curl -X PATCH http://localhost:3000/v1/chemicalCargo/1 -H "Content-Type: application/json" -d '{"status_id":6}'
curl -X PATCH http://localhost:3000/v1/chemicalCargo/1 -H "Content-Type: application/json" -d '{"status_id":7}'
```

For an empty body use `-d '{}'` (or omit the body): the `block`, `release` and `cancel` `PATCH` routes do not read the body.

---

## Business rules

### Chemical product

- Name is required and cannot be blank.
- Risk class (`risk_class_id`) and compatibility group (`compatibility_group_id`) are required.
- `status` must be a boolean (`true` = active, `false` = inactive).
- An **inactive product cannot receive new cargos**.
- Deactivation is logical: the record stays in the database.

### Chemical cargo

- Requires an existing, **active** chemical product.
- `quantity` must be greater than zero.
- Technical manager is required.
- The cargo **inherits the product's risk class**: there is no risk column on the cargo, and a product always has a risk class.
- **Documentation:** `required_documentation_id` says which documentation the cargo requires. Delivery is recorded by `PATCH /v1/chemicalCargo/documentation/:id`, which sets `delivered_documentation_id` to the id of an existing documentation (`404` if the cargo or the documentation does not exist). A cargo counts as having its documentation delivered when that field is not null.

### Status and transitions

Main flow: `Registered → Under Analyses → Under inspection → Released → Moving → Done`.

```mermaid
stateDiagram-v2
    [*] --> Registered
    Registered --> UnderAnalyses
    UnderAnalyses --> UnderInspection: requires documentation
    UnderInspection --> Released: requires documentation
    UnderInspection --> Blocked
    Released --> Moving
    Moving --> Done
    Registered --> Canceled
    UnderAnalyses --> Canceled
    UnderInspection --> Canceled
    Released --> Canceled
    Blocked --> Canceled
    Done --> [*]
    Canceled --> [*]
```

| From | To (allowed) |
| :-- | :-- |
| `Registered` | `Under Analyses`, `Canceled` |
| `Under Analyses` | `Under inspection` (requires documentation), `Canceled` |
| `Under inspection` | `Released` (requires documentation), `Blocked`, `Canceled` |
| `Released` | `Moving`, `Canceled` |
| `Blocked` | `Canceled` |
| `Moving` | `Done` |
| `Done` | none (final state) |
| `Canceled` | none (final state) |

Any other transition is **forbidden**. Some refused examples: `Canceled → Released`, `Done → Moving`, `Blocked → Moving`, `Registered → Done`, `Under inspection → Done`, `Released → Registered`.

When a transition is refused, the API responds **`409`** with the reason:

```json
{ "error": "Invalid status transition - [\"Documentation not delivered\"]" }
```

| Reason | When |
| :-- | :-- |
| `Cargo status is blocked` | The cargo is blocked and the requested transition is not the cancellation |
| `Cargo status is canceled` | The cargo is canceled (final state) |
| `Status transition not allowed` | The target is not in the allowed flow for the current status |
| `Documentation not delivered` | The transition requires documentation and it was not delivered |

The `block`, `release` and `cancel` endpoints are shortcuts to the `Blocked`, `Released` and `Canceled` statuses and go through the same rule. The rule lives in `src/domain/rules/chemical_cargo/cargoStatusRules.ts`.

---

## Database

PostgreSQL 17, with the schema created by [`src/infrastructure/database/migrations/migration.sql`](src/infrastructure/database/migrations/migration.sql) (run when the volume is first created) and mapped in Prisma at [`prisma/schema.prisma`](prisma/schema.prisma). The server time zone is `America/Sao_Paulo`, and dates use `TIMESTAMPTZ`.

```mermaid
erDiagram
    risk_class ||--o{ chemical : classifies
    compatibility_group ||--o{ chemical : groups
    chemical ||--o{ chemical_cargo : "is carried in"
    cargo_status ||--o{ chemical_cargo : "state of"
    measure_unity ||--o{ chemical_cargo : measures
    technical_manager ||--o{ chemical_cargo : "is responsible for"
    required_documentation ||--o{ chemical_cargo : "required by"
    required_documentation |o--o{ chemical_cargo : "delivered in"

    chemical {
        int id PK
        varchar name
        varchar description
        varchar UN_number
        int risk_class_id FK
        int compatibility_group_id FK
        boolean status
        timestamptz create_date
        timestamptz update_date
    }
    chemical_cargo {
        int id PK
        varchar cargo_code
        int chemical_id FK
        int quantity
        int measure_unity_id FK
        varchar origin
        varchar destination
        int technical_manager_id FK
        int required_documentation_id FK
        int delivered_documentation_id FK "null until delivered"
        int status_id FK
        date delivery_date
        timestamptz create_date
        timestamptz update_date
    }
```

### Tables

| Table | Purpose |
| :-- | :-- |
| `chemical` | Chemical products: name, description, UN number (`UN_number`, up to 4 characters), risk class, compatibility group and `status` (active/inactive) |
| `chemical_cargo` | Cargos: code, product, quantity, unit, origin, destination, technical manager, required and delivered documentation, status and delivery date |
| `cargo_status` | The 8 possible cargo statuses |
| `risk_class` | The 9 UN risk classes (Explosives, Gases, Flammable liquids, Flammable solids, Oxidizing substances and organic peroxides, Toxic and infectious substances, Radioactive material, Corrosives, Miscellaneous dangerous substances) |
| `compatibility_group` | Product compatibility groups: Flammables, Acids, Bases, Oxidizers, Toxics and Non-reactive |
| `measure_unity` | Units of measure: Kilogram, Liter, Ton and Cubic meter |
| `technical_manager` | Technical managers |
| `required_documentation` | Documentation types: Safety data sheet (FISPQ), Transport license and Product analysis certificate |
| `logs` | Table reserved for logs; today logs are written to files (see [Logs](#logs)) |

The lookup tables (`cargo_status`, `risk_class`, `compatibility_group`, `measure_unity`, `technical_manager` and `required_documentation`) are created with initial data by `migration.sql`. The compatibility groups, units, technical managers and documentation types are simulated values for demonstration.

### How the data relates

- **Product and cargo:** every cargo has a required foreign key to its product (`chemical_cargo.chemical_id`). A product can have many cargos.
- **Status control:** the cargo's current state is the foreign key `status_id`, pointing to `cargo_status`. The API only changes this value after the transition rule approves the change.
- **Documentation:** `required_documentation_id` (required) says which documentation the cargo requires; `delivered_documentation_id` (null until delivery) points to the delivered documentation. Both reference `required_documentation`.
- **Logical deactivation and cancellation:** a product is deactivated through the `status` field and a cargo is canceled through the `Canceled` status. No record is deleted.
- **Evolution:** the lookup tables allow adding new groups, units or documentation types without changing the schema. If several documents per cargo need to be tracked, `delivered_documentation_id` can be replaced by a cargo documents table (type, state and attachment date).

---

## Logs

Logs are written to the console and to daily files in `logs/YYYY-MM-DD.txt` (the folder is created automatically and is in `.gitignore`).

- Every incoming request is shown in the console with its method and route.
- Creations and updates write the new and the previous value to the file.
- Validation errors (400, 404, 409) and internal errors (500) write the message to the file.

Example line: `ERROR (PATCH /v1/chemicalCargo/1) - new_value: null | old_value: null | error: Bad Request | ...`

---

## Continuous integration

The workflow [`.github/workflows/build_database_and_api.yml`](.github/workflows/build_database_and_api.yml) runs on every `push` and `pull request` to `main`: it installs the dependencies, runs the tests (`npm run test`) and builds the images with `docker compose up -d --build` (the API image runs `npm run build`, which type-checks with `tsc` and bundles with `tsdown`). There is no deploy step. The credentials used by the workflow come from the repository secrets.

---

## Architectural decisions

- **Layers:** `domain` (entities, repository interfaces and rules), `application` (handlers, one per use case), `infrastructure` (Prisma, repositories and logger) and `routes` (routers and middlewares). Handlers depend on the domain interfaces, not on Prisma, which makes them testable with mocked repositories.

  ```
  src/
    domain/            entities, repositories (interfaces), status and rules
    application/
      handlers/        one file per use case (chemicals, chemical_cargo, chemical_cargo_status)
    infrastructure/    Prisma, migration.sql, repositories and logger
    routes/            /v1 routers and the route logging middleware
    utils/             createHandler, error messages, property validation
  tests/               mirrors the structure of src/
  ```

- **Transition rule as a pure function:** `canMoveChemicalCargo(from, to, documentationDelivered)` touches neither HTTP nor the database. It returns `{ canMove, cannotMoveReasons }`, and the `update`, `block`, `release` and `cancel` handlers use the same function. The movement table is typed: if a new status is added to the enum without updating the table, the compiler complains.
- **Statuses in a table:** statuses live in the `cargo_status` table (not in a database enum), and the code identifies them by name, without depending on ids.
- **JSON errors:** handlers use `createHandler` and always respond with `{ "error": ... }`, with a specific HTTP code for each situation (400, 404, 409 and 500).
- **Schema in SQL:** the database is created by `migration.sql`, mounted in the container (`/docker-entrypoint-initdb.d`), which allows starting only the database in Docker and running the API on the host with `npm run dev`.
- **Bundling with `tsdown`:** produces a single ESM file (`dist/index.mjs`), avoiding `.js` extension problems in imports.
- **Versioned documentation:** the OpenAPI specification is a repository file, reviewed in pull requests like the rest of the code.

## Known limitations

- Unknown risk class, compatibility group or technical manager ids return `500` (instead of `400`).
- A malformed JSON request returns Express's default error page instead of JSON.
- Logs are written to files; the `logs` table is not used yet.
- Automated tests are unit tests; there are no integration tests against a real database.
- Docker publishes port `3000`; when running with `npm run dev`, the port comes from `PORT`.

---

## Group members

- Bruno Andrade Ribeiro - RM374834
- João Luiz Martins Neto - RM376860
- Vinicius Ribas Quadros - RM374920
