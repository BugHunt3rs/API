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

// openapi.yaml is read from the project root (also copied into the Docker image)
const openApiDocument = parse(
  readFileSync(resolve(process.cwd(), "openapi.yaml"), "utf-8"),
);
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument),
);

app.use(express.json());
app.use("/v1", v1Router);

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
