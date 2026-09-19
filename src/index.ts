import "dotenv/config"
import express from "express";

const app = express();
const port = process.env.PORT || 5173

app.get("/", (_, response) => {
  response.json({ message: "ok" });
});

app.listen(port, () => {
    console.log(`Running on port ${port}`)
})
