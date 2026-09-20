import express from "express";
import createChemical from "../../../application/handlers/chemicals/createChemical";
import readChemicals from "../../../application/handlers/chemicals/readChemicals";
import updateChemical from "../../../application/handlers/chemicals/updateChemicals";

export const chemicalRouter = express.Router();

chemicalRouter.post("/", createChemical);
chemicalRouter.get("/", readChemicals);
chemicalRouter.patch("/:id", updateChemical);
