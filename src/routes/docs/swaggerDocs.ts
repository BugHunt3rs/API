import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";

// Extra styles for the Swagger UI page (tables and code in light and dark mode)
const docsCss = readFileSync(
  resolve(process.cwd(), "src/routes/docs/swagger.css"),
  "utf-8",
);

// openapi.yaml is read from the project root (also copied into the Docker image)
export const openApiDocument = parse(
  readFileSync(resolve(process.cwd(), "openapi.yaml"), "utf-8"),
);

export const swaggerOptions = { customCss: docsCss };
