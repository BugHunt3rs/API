# Quimi-Port API

🇧🇷 Português · [🇺🇸 English](README.en.md)

API REST para o cadastro de produtos químicos e o controle do ciclo de vida das cargas químicas movimentadas em terminais portuários.

## Sumário

- [Descrição da solução](#descrição-da-solução)
- [Problema que resolve](#problema-que-resolve)
- [Tecnologias](#tecnologias)
- [Como rodar localmente](#como-rodar-localmente)
- [Como rodar com Docker](#como-rodar-com-docker)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Testes](#testes)
- [Documentação da API](#documentação-da-api)
- [Principais endpoints](#principais-endpoints)
- [Regras de negócio](#regras-de-negócio)
- [Banco de dados](#banco-de-dados)
- [Logs](#logs)
- [Integração contínua](#integração-contínua)
- [Decisões arquiteturais](#decisões-arquiteturais)
- [Limitações conhecidas](#limitações-conhecidas)
- [Integrantes do grupo](#integrantes-do-grupo)

---

## Descrição da solução

O Quimi-Port API é o backend da aplicação Quimi-Port. Ele concentra as regras de negócio do cadastro de **produtos químicos** e do registro de **cargas químicas**, e controla o caminho que cada carga percorre (de registrada até finalizada ou cancelada) por meio de uma máquina de estados.

O que a API faz:

- Cadastra, lista, consulta, atualiza e inativa produtos químicos.
- Registra cargas vinculadas a um produto **ativo**, com quantidade, origem, destino, responsável técnico e documentação exigida.
- Move a carga entre os status (`Registered`, `Under Analyses`, `Under inspection`, `Released`, `Blocked`, `Moving`, `Done` e `Canceled`), recusando qualquer transição fora do fluxo permitido.
- Exige a entrega da documentação antes de a carga seguir para inspeção e antes de ser liberada.
- Registra logs das criações, das alterações e dos erros, e exibe as requisições recebidas no console.

## Problema que resolve

Inspirado nas operações do Porto de Santos, o projeto trata a falta de padronização, de rastreabilidade e de segurança regulatória na movimentação de compostos químicos. A API impede que um produto inativo receba novas cargas, que uma carga seja liberada sem a documentação obrigatória, que uma carga bloqueada entre em movimentação e que uma carga cancelada volte ao fluxo, reduzindo riscos operacionais e ambientais.

---

## Tecnologias

| Item | Tecnologia |
| :-- | :-- |
| Runtime | Node.js 24 |
| Linguagem | TypeScript |
| Framework web | Express 5 |
| ORM | Prisma 7 (com `@prisma/adapter-pg`) |
| Banco de dados | PostgreSQL 17 |
| Documentação da API | OpenAPI 3 + Swagger UI (`swagger-ui-express`) |
| Testes | Jest com `@swc/jest` |
| Build | `tsdown` (gera `dist/index.mjs`) |
| Contêineres | Docker e Docker Compose |
| CI | GitHub Actions |

### Por que PostgreSQL

Os dados são fortemente relacionais: a carga referencia o produto, o status, a unidade de medida, o responsável técnico e as documentações, e o produto referencia a classe de risco e o grupo de compatibilidade. O PostgreSQL garante essa integridade com chaves estrangeiras e tipos fortes (`TIMESTAMPTZ`, `BOOLEAN`, `JSON`), além de transações e consultas com junção. Um banco de documentos (como o MongoDB) pediria que essa integridade fosse reimplementada na aplicação.

### Por que Express

É o framework mais conhecido do ecossistema Node.js, com API pequena e sem imposição de estrutura. Isso nos deixou organizar o código em camadas próprias (domínio, aplicação e infraestrutura) em vez de seguir a estrutura de um framework opinativo como o NestJS. A versão 5 trata erros de handlers assíncronos de forma nativa.

### Por que não há uma camada de services

As regras de negócio ficam em **funções puras de domínio** (por exemplo, `canMoveChemicalCargo`), chamadas diretamente pelos handlers. Os handlers orquestram o caso de uso (validar a entrada, buscar no repositório, aplicar a regra, persistir e responder). Como cada caso de uso tem seu próprio arquivo e a regra não depende de HTTP nem de banco, uma camada de services só adicionaria um nível de indireção sem ganho de testabilidade.

---

## Como rodar localmente

Requisitos: Node.js 24, Docker e Docker Compose.

1. **Clone o repositório e instale as dependências:**

   ```bash
   git clone https://github.com/BugHunt3rs/API.git
   cd API
   npm clean-install
   ```

2. **Crie o arquivo `.env`** a partir do modelo e ajuste os valores:

   ```bash
   cp .env.example .env
   ```

   Para rodar a API fora do Docker, mantenha a `DATABASE_URL` apontando para `localhost` (veja [Variáveis de ambiente](#variáveis-de-ambiente)).

3. **Suba só o banco de dados:**

   ```bash
   docker compose up -d database
   ```

   Na primeira vez que o volume é criado, o PostgreSQL executa o arquivo `src/infrastructure/database/migrations/migration.sql`, que cria as tabelas e insere os dados iniciais. Não há comando de migração a rodar.

4. **Gere o cliente do Prisma:**

   ```bash
   npx prisma generate
   ```

5. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```

   A API sobe na porta definida em `PORT` (se a variável não existir, usa a `5173`).

Para **recriar o banco do zero** (apaga todos os dados e roda o `migration.sql` de novo):

```bash
docker compose down -v
docker compose up -d database
```

## Como rodar com Docker

Com o `.env` criado (veja acima), suba o banco e a API juntos:

```bash
docker compose up --build
```

- A API fica em `http://localhost:3000`, e a documentação, em `http://localhost:3000/docs`.
- O banco fica na porta `5432`, e os dados persistem no volume nomeado `postgres_data`.
- A imagem da API é construída pelo `dockerfile`, que instala as dependências e roda `npm run build`.
- Dentro do Compose, a API acessa o banco pelo nome do serviço (`database`), e não por `localhost`. Use a `DATABASE_URL` indicada para Docker no `.env.example`.
- O Compose publica a porta `3000` da API. Mantenha `PORT=3000` no `.env` ao rodar com Docker.

## Variáveis de ambiente

Todas ficam no arquivo `.env` (que não vai para o Git). O `.env.example` é o modelo.

| Variável | Descrição | Exemplo |
| :-- | :-- | :-- |
| `DATABASE_NAME` | Nome do banco criado pelo contêiner | `quimiport` |
| `DATABASE_USER` | Usuário do banco | `quimiport` |
| `DATABASE_PASSWORD` | Senha do banco | `quimiport` |
| `DATABASE_URL` | URL de conexão usada pela API | veja abaixo |
| `PORT` | Porta em que a API escuta | `3000` |

`DATABASE_URL` muda conforme onde a API roda:

```env
# API fora do Docker (npm run dev)
DATABASE_URL="postgresql://quimiport:quimiport@localhost:5432/quimiport?schema=public"

# API dentro do Docker Compose (o host é o nome do serviço)
DATABASE_URL="postgresql://quimiport:quimiport@database:5432/quimiport?schema=public"
```

Os valores de usuário, senha e nome do banco precisam ser os mesmos nas três primeiras variáveis e na URL.

---

## Testes

Os testes são unitários, escritos com [Jest](https://jestjs.io/) e compilados com `@swc/jest`. Os repositórios são simulados (mocks), portanto **não precisam de banco, de Docker nem do `.env`**.

```bash
# todos os testes
npm test

# um arquivo específico
npx jest tests/domain/rules/chemical_cargo/cargoStatusRules.test.ts
```

Os testes ficam em `tests/`, espelhando a estrutura de `src/`. A suíte tem 95 testes, que cobrem:

| Área | O que é verificado |
| :-- | :-- |
| `createChemical` | Cadastra o produto; recusa nome ausente ou em branco, classe de risco ausente, grupo de compatibilidade ausente e `status` que não seja booleano |
| `createChemicalCargo` | Registra a carga; recusa produto inativo e quantidade `0` ou negativa |
| `cargoStatusRules` | Transições permitidas, proibidas, estados finais e motivos da recusa |
| `updateChemicalCargoStatus` | Atualização de status válida, transição proibida (409), status inexistente, id inválido e carga inexistente |
| `releaseChemicalCargo` | Liberação com documentação; recusa sem documentação e carga bloqueada (409); 404 e 400 |
| `blockChemicalCargo` | Bloqueio só a partir de `Under inspection` |
| `cancelChemicalCargo` | Cancelamento nos status permitidos; recusa em `Canceled`, `Moving` e `Done` |
| `deliverChemicalCargoDocumentation` | Registro da documentação entregue; 400 e 404 |
| `getCargoStatusKey` | Conversão do nome do status do banco na chave usada pela regra |

Não há testes de integração com banco real. Os fluxos completos foram verificados manualmente contra o PostgreSQL do Docker.

---

## Documentação da API

A documentação é uma especificação **OpenAPI 3** (`openapi.yaml`, na raiz do projeto), servida pelo Swagger UI quando a API está no ar:

- **Swagger UI:** `http://localhost:3000/docs` (ou a porta definida em `PORT`)
- **Arquivo da especificação:** [`openapi.yaml`](openapi.yaml)

Nela estão todos os endpoints, os parâmetros, os corpos de requisição e resposta com exemplos, os códigos de erro e a tabela de transições de status. É possível testar cada rota pelo botão **Try it out**.

A especificação é escrita à mão e não valida as requisições: ao alterar um handler, atualize também o `openapi.yaml`.

---

## Principais endpoints

Todas as rotas ficam sob `/v1`. As respostas de sucesso têm o formato `{ "data": ... }`, e as de erro, `{ "error": "mensagem" }`.

### Produtos químicos (`/v1/chemical`)

| Método | Rota | Descrição |
| :-- | :-- | :-- |
| `POST` | `/v1/chemical` | Cadastra um produto |
| `GET` | `/v1/chemical` | Lista os produtos |
| `GET` | `/v1/chemical/:id` | Busca um produto pelo id |
| `PATCH` | `/v1/chemical/:id` | Atualiza campos do produto |
| `PATCH` | `/v1/chemical/deactivate/:id` | Inativa o produto (inativação lógica) |
| `DELETE` | `/v1/chemical/:id` | Remove o produto |

### Cargas químicas (`/v1/chemicalCargo`)

| Método | Rota | Descrição |
| :-- | :-- | :-- |
| `POST` | `/v1/chemicalCargo` | Registra uma carga |
| `GET` | `/v1/chemicalCargo` | Lista as cargas |
| `GET` | `/v1/chemicalCargo/:id` | Busca uma carga pelo id |
| `PATCH` | `/v1/chemicalCargo/:id` | Altera o status (`{ "status_id": 2 }`) |
| `PATCH` | `/v1/chemicalCargo/documentation/:id` | Registra a documentação entregue (`{ "documentation_id": 1 }`) |
| `PATCH` | `/v1/chemicalCargo/release/:id` | Libera a carga |
| `PATCH` | `/v1/chemicalCargo/block/:id` | Bloqueia a carga |
| `PATCH` | `/v1/chemicalCargo/cancel/:id` | Cancela a carga |

### Status de carga (`/v1/chemicalCargoStatus`)

| Método | Rota | Descrição |
| :-- | :-- | :-- |
| `POST` | `/v1/chemicalCargoStatus` | Cria um status |
| `GET` | `/v1/chemicalCargoStatus` | Lista os status |
| `GET` | `/v1/chemicalCargoStatus/:id` | Busca um status pelo id |
| `DELETE` | `/v1/chemicalCargoStatus/:id` | Remove um status |

### Códigos de resposta

| Código | Quando |
| :-- | :-- |
| `200` / `201` | Sucesso (`201` na criação) |
| `400` | Corpo inválido, campo obrigatório ausente, id da rota inválido, produto inexistente ou inativo ao registrar carga, `status_id` inexistente |
| `404` | Produto, carga ou documentação não encontrados |
| `409` | Transição de status recusada pelas regras do fluxo |
| `500` | Erro inesperado |

### Exemplo de fluxo completo

```bash
# 1. Cadastrar um produto (risk_class_id 8 = Corrosives, compatibility_group_id 2 = Acids)
curl -X POST http://localhost:3000/v1/chemical -H "Content-Type: application/json" \
  -d '{"name":"Nitric Acid","description":"Strong oxidizing acid","UN_number":"2031","risk_class_id":8,"compatibility_group_id":2,"status":true}'

# 2. Registrar uma carga desse produto (status_id 1 = Registered)
curl -X POST http://localhost:3000/v1/chemicalCargo -H "Content-Type: application/json" \
  -d '{"cargo_code":"CARGO-100","chemical_id":1,"quantity":300,"measure_unity_id":2,"origin":"Santos","destination":"Cubatao","technical_manager_id":1,"required_documentation_id":1,"status_id":1,"delivery_date":"2026-12-10"}'

# 3. Enviar para análise (status_id 2 = Under Analyses)
curl -X PATCH http://localhost:3000/v1/chemicalCargo/1 -H "Content-Type: application/json" -d '{"status_id":2}'

# 4. Ir para inspeção sem documentação: recusado com 409
curl -X PATCH http://localhost:3000/v1/chemicalCargo/1 -H "Content-Type: application/json" -d '{"status_id":3}'
# {"error":"Invalid status transition - [\"Documentation not delivered\"]"}

# 5. Registrar a documentação entregue e tentar de novo (status_id 3 = Under inspection)
curl -X PATCH http://localhost:3000/v1/chemicalCargo/documentation/1 -H "Content-Type: application/json" -d '{"documentation_id":1}'
curl -X PATCH http://localhost:3000/v1/chemicalCargo/1 -H "Content-Type: application/json" -d '{"status_id":3}'

# 6. Liberar, movimentar e finalizar (status_id 6 = Moving, 7 = Done)
curl -X PATCH http://localhost:3000/v1/chemicalCargo/release/1
curl -X PATCH http://localhost:3000/v1/chemicalCargo/1 -H "Content-Type: application/json" -d '{"status_id":6}'
curl -X PATCH http://localhost:3000/v1/chemicalCargo/1 -H "Content-Type: application/json" -d '{"status_id":7}'
```

Em um corpo vazio use `-d '{}'` (ou omita o corpo): as rotas `PATCH` de `block`, `release` e `cancel` não leem o corpo.

---

## Regras de negócio

### Produto químico

- Nome obrigatório e não vazio.
- Classe de risco (`risk_class_id`) e grupo de compatibilidade (`compatibility_group_id`) obrigatórios.
- `status` deve ser booleano (`true` = ativo, `false` = inativo).
- Um produto **inativo não pode receber novas cargas**.
- A inativação é lógica: o registro permanece no banco.

### Carga química

- Exige um produto químico existente e **ativo**.
- `quantity` deve ser maior que zero.
- Responsável técnico obrigatório.
- A carga **herda a classe de risco do produto**: não há coluna de risco na carga, e o produto sempre tem uma classe de risco.
- **Documentação:** `required_documentation_id` indica qual documentação a carga exige. A entrega é registrada por `PATCH /v1/chemicalCargo/documentation/:id`, que preenche `delivered_documentation_id` com o id de uma documentação existente (`404` se a carga ou a documentação não existir). A carga é considerada com documentação entregue quando esse campo não é nulo.

### Status e transições

Fluxo principal: `Registered → Under Analyses → Under inspection → Released → Moving → Done`.

```mermaid
stateDiagram-v2
    [*] --> Registered
    Registered --> UnderAnalyses
    UnderAnalyses --> UnderInspection: requer documentação
    UnderInspection --> Released: requer documentação
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

| De | Para (permitido) |
| :-- | :-- |
| `Registered` | `Under Analyses`, `Canceled` |
| `Under Analyses` | `Under inspection` (requer documentação), `Canceled` |
| `Under inspection` | `Released` (requer documentação), `Blocked`, `Canceled` |
| `Released` | `Moving`, `Canceled` |
| `Blocked` | `Canceled` |
| `Moving` | `Done` |
| `Done` | nenhuma (estado final) |
| `Canceled` | nenhuma (estado final) |

Qualquer outra transição é **proibida**. Alguns exemplos recusados: `Canceled → Released`, `Done → Moving`, `Blocked → Moving`, `Registered → Done`, `Under inspection → Done`, `Released → Registered`.

Quando uma transição é recusada, a API responde **`409`** com o motivo:

```json
{ "error": "Invalid status transition - [\"Documentation not delivered\"]" }
```

| Motivo | Quando |
| :-- | :-- |
| `Cargo status is blocked` | A carga está bloqueada e a transição pedida não é o cancelamento |
| `Cargo status is canceled` | A carga está cancelada (estado final) |
| `Status transition not allowed` | O destino não está no fluxo permitido para o status atual |
| `Documentation not delivered` | A transição exige documentação e ela não foi entregue |

Os endpoints `block`, `release` e `cancel` são atalhos para os status `Blocked`, `Released` e `Canceled` e passam pela mesma regra. A regra está em `src/domain/rules/chemical_cargo/cargoStatusRules.ts`.

---

## Banco de dados

PostgreSQL 17, com o esquema criado pelo arquivo [`src/infrastructure/database/migrations/migration.sql`](src/infrastructure/database/migrations/migration.sql) (executado na primeira criação do volume) e mapeado no Prisma em [`prisma/schema.prisma`](prisma/schema.prisma). O fuso do servidor é `America/Sao_Paulo`, e as datas usam `TIMESTAMPTZ`.

```mermaid
erDiagram
    risk_class ||--o{ chemical : classifica
    compatibility_group ||--o{ chemical : agrupa
    chemical ||--o{ chemical_cargo : "é carregado em"
    cargo_status ||--o{ chemical_cargo : "estado de"
    measure_unity ||--o{ chemical_cargo : "mede"
    technical_manager ||--o{ chemical_cargo : "responde por"
    required_documentation ||--o{ chemical_cargo : "exigida por"
    required_documentation |o--o{ chemical_cargo : "entregue em"

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
        int delivered_documentation_id FK "nulo até a entrega"
        int status_id FK
        date delivery_date
        timestamptz create_date
        timestamptz update_date
    }
```

### Tabelas

| Tabela | Função |
| :-- | :-- |
| `chemical` | Produtos químicos: nome, descrição, número ONU (`UN_number`, até 4 caracteres), classe de risco, grupo de compatibilidade e `status` (ativo/inativo) |
| `chemical_cargo` | Cargas: código, produto, quantidade, unidade, origem, destino, responsável técnico, documentação exigida e entregue, status e data de entrega |
| `cargo_status` | Os 8 status possíveis de uma carga |
| `risk_class` | As 9 classes de risco da ONU (Explosives, Gases, Flammable liquids, Flammable solids, Oxidizing substances and organic peroxides, Toxic and infectious substances, Radioactive material, Corrosives, Miscellaneous dangerous substances) |
| `compatibility_group` | Grupos de compatibilidade do produto: Flammables, Acids, Bases, Oxidizers, Toxics e Non-reactive |
| `measure_unity` | Unidades de medida: Kilogram, Liter, Ton e Cubic meter |
| `technical_manager` | Responsáveis técnicos |
| `required_documentation` | Tipos de documentação: Safety data sheet (FISPQ), Transport license e Product analysis certificate |
| `logs` | Tabela reservada para logs; hoje os logs são gravados em arquivo (veja [Logs](#logs)) |

As tabelas de apoio (`cargo_status`, `risk_class`, `compatibility_group`, `measure_unity`, `technical_manager` e `required_documentation`) são criadas já com dados iniciais pelo `migration.sql`. Os grupos de compatibilidade, as unidades, os responsáveis técnicos e as documentações são valores simulados para demonstração.

### Como os dados se relacionam

- **Produto e carga:** cada carga tem uma chave estrangeira obrigatória para o produto (`chemical_cargo.chemical_id`). Um produto pode ter várias cargas.
- **Controle do status:** o estado atual da carga é a chave estrangeira `status_id`, que aponta para `cargo_status`. A API só altera esse valor depois de a regra de transição aprovar a mudança.
- **Documentação:** `required_documentation_id` (obrigatório) diz qual documentação a carga exige; `delivered_documentation_id` (nulo até a entrega) aponta para a documentação entregue. Ambos referenciam `required_documentation`.
- **Inativação e cancelamento lógicos:** o produto é inativado pelo campo `status` e a carga é cancelada pelo status `Canceled`. Nenhum registro é apagado.
- **Evolução:** as tabelas de apoio permitem acrescentar novos grupos, unidades ou documentações sem alterar o esquema. Se for preciso controlar vários documentos por carga, `delivered_documentation_id` pode dar lugar a uma tabela de documentos da carga (tipo, situação e data de anexação).

---

## Logs

Os logs são gravados no console e em arquivos diários em `logs/AAAA-MM-DD.txt` (a pasta é criada automaticamente e está no `.gitignore`).

- Cada requisição recebida é exibida no console com o método e a rota.
- Criações e atualizações gravam no arquivo o valor novo e o anterior.
- Erros de validação (400, 404, 409) e erros internos (500) gravam a mensagem.

Exemplo de linha: `ERROR (PATCH /v1/chemicalCargo/1) - new_value: null | old_value: null | error: Bad Request | ...`

---

## Integração contínua

O workflow [`.github/workflows/build_database_and_api.yml`](.github/workflows/build_database_and_api.yml) roda em todo `push` e `pull request` para a `main`: instala as dependências, executa os testes (`npm run test`) e constrói as imagens com `docker compose up -d --build` (a imagem da API executa `npm run build`, que valida os tipos com `tsc` e gera o pacote com `tsdown`). Não há etapa de deploy. As credenciais usadas pelo workflow vêm dos *secrets* do repositório.

---

## Decisões arquiteturais

- **Camadas:** `domain` (entidades, interfaces de repositório e regras), `application` (handlers, um por caso de uso), `infrastructure` (Prisma, repositórios e logger) e `routes` (roteadores e middlewares). Os handlers dependem das interfaces do domínio, não do Prisma, o que permite testá-los com repositórios simulados.

  ```
  src/
    domain/            entidades, repositórios (interfaces), status e regras
    application/
      handlers/        um arquivo por caso de uso (chemicals, chemical_cargo, chemical_cargo_status)
    infrastructure/    Prisma, migration.sql, repositórios e logger
    routes/            roteadores /v1 e middleware de log de rotas
    utils/             createHandler, mensagens de erro, validação de propriedades
  tests/               espelha a estrutura de src/
  ```

- **Regra de transição como função pura:** `canMoveChemicalCargo(from, to, documentationDelivered)` não acessa HTTP nem banco. Ela devolve `{ canMove, cannotMoveReasons }`, e os handlers `update`, `block`, `release` e `cancel` usam a mesma função. A tabela de movimentos é tipada: se um status novo for adicionado ao enum sem atualizar a tabela, o compilador acusa.
- **Status em tabela:** os status ficam na tabela `cargo_status` (e não em um enum do banco), e o código os identifica pelo nome, sem depender dos ids.
- **Erros em JSON:** os handlers usam o `createHandler` e respondem sempre com `{ "error": ... }`, com um código HTTP específico para cada situação (400, 404, 409 e 500).
- **Esquema por SQL:** o banco é criado pelo `migration.sql` montado no contêiner (`/docker-entrypoint-initdb.d`), o que permite subir só o banco em Docker e rodar a API na máquina com `npm run dev`.
- **Empacotamento com `tsdown`:** gera um único arquivo ESM (`dist/index.mjs`), o que evita problemas de extensão `.js` nos imports.
- **Documentação versionada:** a especificação OpenAPI é um arquivo do repositório, revisado nos pull requests como o restante do código.

## Limitações conhecidas

- Ids inexistentes de classe de risco, grupo de compatibilidade ou responsável técnico retornam `500` (em vez de `400`).
- Um JSON malformado na requisição devolve a página de erro padrão do Express, e não JSON.
- Os logs ficam em arquivo; a tabela `logs` ainda não é usada.
- Os testes automatizados são unitários; não há testes de integração com banco real.
- O Docker publica a porta `3000`; ao rodar com `npm run dev`, a porta vem de `PORT`.

---

## Integrantes do grupo

- Bruno Andrade Ribeiro - RM374834
- João Luiz Martins Neto - RM376860
- Vinicius Ribas Quadros - RM374920
