import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { parse } from "yaml";

// Extra styles for the Swagger UI page (tables and code in light and dark mode)
const docsCss = readFileSync(
  resolve(process.cwd(), "src/routes/docs/swagger.css"),
  "utf-8",
);

// openapi.yaml is read from the project root (also copied into the Docker image)
const openApiDocument = parse(
  readFileSync(resolve(process.cwd(), "openapi.yaml"), "utf-8"),
);

export const docsRouter = express.Router();

docsRouter.use(
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, { customCss: docsCss }),
);

export default docsRouter;
