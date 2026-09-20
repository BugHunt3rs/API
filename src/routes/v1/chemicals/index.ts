import express from "express";

export const chemicalRouter = express.Router();

chemicalRouter.post("/");
chemicalRouter.get("/");
chemicalRouter.patch("/:id");
