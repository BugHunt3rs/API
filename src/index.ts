import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument, swaggerOptions } from "./routes/docs/swaggerDocs";
import v1Router from "./routes/v1/v1Router";

const app = express();
const port = process?.env?.["PORT"] || 5173;

app.get("/", (_, response) => {
  response.json({ message: "ok" });
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, swaggerOptions),
);

app.use(express.json());
app.use("/v1", v1Router);

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
