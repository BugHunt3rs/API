import express from "express";
import createChemicalCargo from "../../../application/handlers/chemical_cargo/createChemicalCargo";
import readChemicalCargos from "../../../application/handlers/chemical_cargo/readChemicalCargos";
import readChemicalCargoById from "../../../application/handlers/chemical_cargo/readChemicalCargoById";

export const chemicalCargoRouter = express.Router();

chemicalCargoRouter.post("/", createChemicalCargo);
chemicalCargoRouter.get("/", readChemicalCargos)
chemicalCargoRouter.get("/:id", readChemicalCargoById)


export default chemicalCargoRouter;
