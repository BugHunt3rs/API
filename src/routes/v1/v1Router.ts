import express from "express";
import { chemicalRouter } from "./chemicals/chemicalRouter";
import chemicalCargoRouter from "./chemicalCargo/chemicalCargoRouter";
import { chemicalCargoStatusRouter } from "./chemicalCargoStatus/chemicalCargoStatusRouter";
import routeLogger from "../middlewares/logging/routeLogger";

export const v1Router = express.Router();

v1Router.use(routeLogger);

v1Router.get("/", (_, response) => {
    response.json({ message: "V1 Router Working" });
});

v1Router.use("/chemical", chemicalRouter);
v1Router.use("/chemicalCargo", chemicalCargoRouter);
v1Router.use("/chemicalCargoStatus", chemicalCargoStatusRouter);

export default v1Router;
