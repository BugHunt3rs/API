import "dotenv/config";
import express from "express";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import swaggerUi from "swagger-ui-express";
import { parse } from "yaml";
import v1Router from "./routes/v1/v1Router";

// chemical_cargo.quantity is a BigInt, which JSON.stringify cannot serialize
(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function (
  this: bigint,
) {
  return Number(this);
};

const app = express();
const port = process?.env?.["PORT"] || 5173;

app.get("/", (_, response) => {
  response.json({ message: "ok" });
});

const docsCss = `
  .swagger-ui .info .description {
    --tbl-border: #d8dde6; --tbl-head: #eef1f6; --tbl-row: #fafbfd;
    --tbl-line: #eceff4; --code-bg: #eef1f6; --code-fg: #1f3a5f;
  }
  html.dark-mode .swagger-ui .info .description {
    --tbl-border: #3a4350; --tbl-head: #2a313b; --tbl-row: #20262e;
    --tbl-line: #323a46; --code-bg: #2a313b; --code-fg: #9fc4f0;
  }
  .swagger-ui .info .description h2 { font-size: 18px; margin: 28px 0 10px; }
  .swagger-ui .info .description table {
    width: auto; min-width: 460px; border-collapse: collapse; background: transparent;
    border: 1px solid var(--tbl-border); border-radius: 6px; overflow: hidden; margin: 8px 0 14px;
  }
  .swagger-ui .info .description th {
    background: var(--tbl-head); color: inherit; text-align: left; font-size: 13px;
    padding: 8px 16px; border-bottom: 1px solid var(--tbl-border);
  }
  .swagger-ui .info .description td {
    color: inherit; padding: 7px 16px; font-size: 14px; border-bottom: 1px solid var(--tbl-line);
  }
  .swagger-ui .info .description tr:last-child td { border-bottom: 0; }
  .swagger-ui .info .description tbody tr:nth-child(even) { background: var(--tbl-row); }
  .swagger-ui .info .description code {
    background: var(--code-bg); color: var(--code-fg); padding: 1px 6px; border-radius: 4px; font-size: 12.5px;
  }
`;

// openapi.yaml is read from the project root (also copied into the Docker image)
const openApiDocument = parse(
  readFileSync(resolve(process.cwd(), "openapi.yaml"), "utf-8"),
);
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, { customCss: docsCss }),
);

app.use(express.json());
app.use("/v1", v1Router);

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
