import express from "express";
import createChemicalCargo from "../../../application/handlers/chemical_cargo/createChemicalCargo";
import readChemicalCargos from "../../../application/handlers/chemical_cargo/readChemicalCargos";

export const chemicalCargoRouter = express.Router();

chemicalCargoRouter.post("/", createChemicalCargo);
chemicalCargoRouter.get("/", readChemicalCargos)


export default chemicalCargoRouter;
