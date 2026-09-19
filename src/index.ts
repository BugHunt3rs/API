import "dotenv/config";
import express from "express";
import v1Router from "./routes/v1/index";

const app = express();
const port = process?.env?.["PORT"] || 5173;

app.get("/", (_, response) => {
  response.json({ message: "ok" });
});

app.use(express.json());
app.use("/v1", v1Router);

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
