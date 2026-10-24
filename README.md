# Starting up with Docker!

### Requirements:

- Docker
- Docker compose

Create a `.env` file at the root of the project following the `.env.example`

After fulfilling the required environment variables, at the source of the project, run

```bash
docker compose up --build
```

Both database and API should be running. To access the API simply follow the link: http://127.0.0.1/3000 (The port can be changed using the `PORT` env variable)

# Running the tests

The tests are unit tests written with [Jest](https://jestjs.io/) (compiled with `@swc/jest`). Repositories are mocked, so **no database, Docker or `.env` file is needed**.

### Requirements:

- Node.js 24
- Dependencies installed (`npm install`)

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

- `createChemical`: creates a product; returns `400` when the name is missing or blank; returns `400` when `risk_class_id` is missing.
- `createChemicalCargo`: creates a cargo for an active product; returns `400` when the product is inactive; returns `400` when `quantity` is `0` or negative.

---

# Executando os testes

Os testes são unitários, escritos com [Jest](https://jestjs.io/) (compilados com `@swc/jest`). Os repositórios são mockados, então **não é necessário banco de dados, Docker ou arquivo `.env`**.

### Requisitos:

- Node.js 24
- Dependências instaladas (`npm install`)

### Rodar todos os testes

```bash
npm test
```

### Rodar um único arquivo de teste

```bash
npx jest tests/application/handlers/chemicals/createChemical.test.ts
```

### O que está coberto

Os testes ficam em `tests/` e espelham a estrutura de `src/`.

- `createChemical`: cria um produto; retorna `400` sem nome ou com nome em branco; retorna `400` sem `risk_class_id`.
- `createChemicalCargo`: cria uma carga para produto ativo; retorna `400` para produto inativo; retorna `400` para `quantity` igual a `0` ou negativa.
