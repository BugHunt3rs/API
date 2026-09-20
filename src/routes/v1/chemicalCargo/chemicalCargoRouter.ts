import express from "express";
import createChemicalCargo from "../../../application/handlers/chemical_cargo/createChemicalCargo";
import readChemicalCargos from "../../../application/handlers/chemical_cargo/readChemicalCargos";
import readChemicalCargoById from "../../../application/handlers/chemical_cargo/readChemicalCargoById";
import updateChemicalCargoStatus from "../../../application/handlers/chemical_cargo/updateChemicalCargoStatus";
import blockChemicalCargo from "../../../application/handlers/chemical_cargo/blockChemicalCargo";
import releaseChemicalCargo from "../../../application/handlers/chemical_cargo/ReleaseChemicalCargo";
import canceledChemicalCargo from "../../../application/handlers/chemical_cargo/cancelChemicalCargo";

export const chemicalCargoRouter = express.Router();

chemicalCargoRouter.post("/", createChemicalCargo);
chemicalCargoRouter.get("/", readChemicalCargos);
chemicalCargoRouter.get("/:id", readChemicalCargoById);
chemicalCargoRouter.patch("/:id", updateChemicalCargoStatus);
chemicalCargoRouter.patch("/:id", blockChemicalCargo);
chemicalCargoRouter.patch("/:id", releaseChemicalCargo);
chemicalCargoRouter.patch("/:id", canceledChemicalCargo);

export default chemicalCargoRouter;
