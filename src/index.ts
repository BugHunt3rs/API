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
  .swagger-ui .info .description h2 { font-size: 18px; margin: 28px 0 10px; }
  .swagger-ui .info .description table {
    width: auto; min-width: 460px; border-collapse: collapse;
    border: 1px solid #d8dde6; border-radius: 6px; overflow: hidden; margin: 8px 0 14px;
  }
  .swagger-ui .info .description th {
    background: #eef1f6; text-align: left; font-size: 13px; padding: 8px 16px; border-bottom: 1px solid #d8dde6;
  }
  .swagger-ui .info .description td { padding: 7px 16px; font-size: 14px; border-bottom: 1px solid #eceff4; }
  .swagger-ui .info .description tr:last-child td { border-bottom: 0; }
  .swagger-ui .info .description tbody tr:nth-child(even) { background: #fafbfd; }
  .swagger-ui .info .description code {
    background: #eef1f6; color: #1f3a5f; padding: 1px 6px; border-radius: 4px; font-size: 12.5px;
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
