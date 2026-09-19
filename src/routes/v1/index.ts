import express from "express";
import { chemicalRouter } from "./chemicals/index";

export const v1Router = express.Router();

v1Router.get("/", (_, response) => {
    response.json({message: "V1 Router Working"})
})

v1Router.use("/chemical", chemicalRouter)

export default v1Router;
