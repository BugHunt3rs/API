import express from "express";
import chemicalCargoRouter from "./chemicalCargo/chemicalCargoRouter";

export const v1Router = express.Router();

v1Router.get("/", (_, response) => {
  response.json({ message: "V1 Router Working" });
});

v1Router.use("/chemicalCargo", chemicalCargoRouter);

export default v1Router;
