import express from "express";
import createChemical from "../../../handlers/chemicals/createChemical";
import readChemicals from "../../../handlers/chemicals/readChemicals";
import updateChemical from "../../../handlers/chemicals/updateChemical";

export const chemicalRouter = express.Router();

chemicalRouter.post("/", createChemical);
chemicalRouter.get("/", readChemicals);
chemicalRouter.patch("/:id", updateChemical);
