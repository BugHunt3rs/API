import express from "express";
import createChemical from "../../../application/handlers/chemicals/createChemical";
import readChemicals from "../../../application/handlers/chemicals/readChemicals";
import updateChemical from "../../../application/handlers/chemicals/updateChemicals";
import readChemicalById from "../../../application/handlers/chemicals/readChemicalById";

export const chemicalRouter = express.Router();

chemicalRouter.post("/", createChemical);
chemicalRouter.get("/", readChemicals);
chemicalRouter.get("/:id", readChemicalById);
chemicalRouter.patch("/:id", updateChemical);
