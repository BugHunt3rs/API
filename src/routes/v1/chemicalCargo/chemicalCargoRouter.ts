import express from "express";
import createChemicalCargo from "../../../application/handlers/chemical_cargo/createChemicalCargo";

export const chemicalCargoRouter = express.Router();

chemicalCargoRouter.post("/", createChemicalCargo);


export default chemicalCargoRouter;
