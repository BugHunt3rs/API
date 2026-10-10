import createChemicalCargoStatus from "@/application/handlers/chemical_cargo_status/createChemicalCargoStatus";
import readChemicalCargoStatusById from "@/application/handlers/chemical_cargo_status/readChemicalCargoStatusById";
import express from "express";
export const chemicalCargoStatusRouter = express.Router();

chemicalCargoStatusRouter.post("/", createChemicalCargoStatus);
chemicalCargoStatusRouter.get("/:id", readChemicalCargoStatusById);
