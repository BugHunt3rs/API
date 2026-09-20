import express from "express";

export const chemicalCargoRouter = express.Router();

chemicalCargoRouter.get("/", async (_, response) =>response.send("ok") )

export default chemicalCargoRouter;
