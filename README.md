# Quimi-Port API

### Nome do Projeto

**Quimi-Port API**

---

### Descrição da Solução

Camada de backend da aplicação Quimi-Port, desenvolvida em Node.js com TypeScript e arquitetura limpa, concebida para concentrar as regras de negócio e a gestão de cargas de produtos químicos movimentadas em terminais portuários.

---

### Problema que Resolve (Contexto do Problema)

Inspirado nas operações e desafios reais do porto de **Porto de Santos**, o projeto resolve o problema da falta de padronização, rastreabilidade e segurança regulatória na movimentação e armazenagem de compostos químicos. A plataforma impede o despacho de substâncias inativas, valida classes de risco antes da alocação de cargas e mitiga riscos operacionais e ambientais no ambiente portuário.

---

### Requisitos

- Docker
- Docker Compose
- Node.js 24

---

### Tech Stack

- **Runtime:** Node.js 24
- **Linguagem:** TypeScript
- **Framework Web:** Express
- **ORM:** Prisma
- **Bundler:** `tsdown` (com rolldown/esbuild)
- **Banco de Dados:** PostgreSQL 17
- **Containerização:** Docker & Docker Compose
- **Testes:** Jest com `@swc/jest`

---

### Como Rodar o Projeto Localmente

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/BugHunt3rs/API.git
   cd API

   ```

2. **Instale as dependências:**

   ```bash
   npm clean-install
   ```

3. **Configure as variáveis de ambiente:**
   Copie o modelo local para o arquivo `.env`:

   ```bash
   cp .env.local .env
   ```

4. **Inicie apenas a base de dados via Docker:**

   ```bash
   docker compose up -d database
   ```

5. **Execute as migrações do Prisma:**

   ```bash
   npx prisma migrate dev
   ```

6. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```

---

### Configuração de Variáveis de Ambiente (`.env`)

Crie o arquivo `.env` na raiz como referência para execuções fora de containers:

```env
# Porta da API
PORT=3000
NODE_ENV=development

# Credenciais do Banco de Dados
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=quimiport_db
DATABASE_HOST=localhost
DATABASE_PORT=5432

# URL de Conexão com o Banco de Dados (Ambiente Local)
DATABASE_URL="postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}?schema=public"
```

> **Atenção (Docker vs Local):** Quando a API roda dentro de um container Docker, o host na URL de conexão deve apontar para o nome do serviço definido no Compose (`database`):  
> `DATABASE_URL="postgresql://postgres:postgres@database:5432/quimiport_db?schema=public"`

---

### Iniciando com Docker

Crie um arquivo `.env` na raiz do projeto seguindo o modelo `.env.example`.

Após preencher as variáveis de ambiente necessárias, execute na raiz do projeto:

```bash
docker compose up --build
```

Tanto o banco de dados quanto a API estarão em execução.  
Para acessar a API, utilize o link: `http://127.0.0.1:3000`  
_(A porta pode ser alterada utilizando a variável de ambiente `PORT`)_.

---

### Executando os Testes

Os testes são unitários, desenvolvidos com [Jest](https://jestjs.io/) e compilados via `@swc/jest`.  
Os repositórios são mockados (simulados), portanto **não é necessário ter banco de dados, Docker ou arquivo `.env` configurado para rodá-los**.

#### Executar todos os testes

```bash
npm test
```

#### Executar um arquivo de teste específico

```bash
npx jest tests/application/handlers/chemicals/createChemical.test.ts
```

#### Cobertura dos testes

Os testes ficam no diretório `tests/` e reproduzem a mesma estrutura de pastas de `src/`.

- `createChemical`: cadastra um produto; retorna erro `400` quando o nome está ausente ou em branco; retorna erro `400` quando `risk_class_id` está ausente.
- `createChemicalCargo`: cadastra uma carga vinculada a um produto ativo; retorna erro `400` quando o produto está inativo; retorna erro `400` quando `quantity` é `0` ou negativo.

---

### Documentação da API

A especificação interativa da API está disponível via Swagger UI quando o servidor está em execução:

- **Swagger UI:** `http://localhost:3000/api-docs`
- **Especificação OpenAPI JSON:** `http://localhost:3000/api-docs.json`

---

### Principais Endpoints

| Método | Endpoint                | Descrição                                                        |
| :----- | :---------------------- | :--------------------------------------------------------------- |
| `POST` | `/api/v1/chemicals`     | Cadastra um novo produto químico associado a uma classe de risco |
| `GET`  | `/api/v1/chemicals`     | Lista o catálogo de químicos e suas situações cadastrais         |
| `GET`  | `/api/v1/chemicals/:id` | Consulta os detalhes de um produto químico específico            |
| `POST` | `/api/v1/cargos`        | Registra uma nova remessa/carga de produto químico               |
| `GET`  | `/api/v1/cargos`        | Lista as cargas movimentadas nas docas                           |
| `GET`  | `/health`               | Verificação de integridade e disponibilidade da API              |

---

### Descrição do Banco de Dados

Base relacional estruturada em **PostgreSQL 17** com isolamento e integridade referencial:

- **Tabela `chemicals`:** Cadastro base de produtos químicos, contendo identificação, nome técnico, flag de atividade (`active`) e chave estrangeira para `risk_classes`.
- **Tabela `chemical_cargos`:** Registros de carregamentos e lotes em trânsito portuário, contendo quantidade volumétrica/peso, status de armazenagem e vínculo direto com o produto químico correspondente.
- **Tabela `risk_classes`:** Classificação regulatória internacional de periculosidade (padrão ONU/IMO).
- **Persistência Docker:** Os dados do banco são mantidos através do volume nomeado `postgres_data`, garantindo que os registros não sejam perdidos entre reinicializações dos containers.

---

### Decisões Arquiteturais

- **Empacotador `tsdown`:** Compilação ultra-rápida baseada em `rolldown`, gerando um único artefato consolidado em formato ESM (`dist/index.mjs`), eliminando problemas de resolução de extensões `.js` no Node.js moderno.
- **Clean Architecture & Handlers Desacoplados:** Separação estrita entre camada HTTP, casos de uso/handlers e repositórios. Essa abordagem possibilita rodar testes unitários rápidos e totalmente isolados, sem dependências de rede ou infraestrutura externa.
- **Desacoplamento de Containers no Compose:** O serviço `database` possui provisionamento isolado com scripts de migração automática via `/docker-entrypoint-initdb.d`, permitindo rodar apenas o banco em container enquanto desenvolve a API localmente na máquina com `npm run dev`.

---

### Integrantes do Grupo

- Bruno Andrade Ribeiro - RM374834
- João Luiz Martins Neto - RM376860
- Vinicius Ribas Quadros - RM374920
