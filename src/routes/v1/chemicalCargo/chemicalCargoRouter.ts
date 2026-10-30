import blockChemicalCargo from "@/application/handlers/chemical_cargo/blockChemicalCargo";
import cancelChemicalCargo from "@/application/handlers/chemical_cargo/cancelChemicalCargo";
import { createChemicalCargo } from "@/application/handlers/chemical_cargo/createChemicalCargo";
import deliverChemicalCargoDocumentation from "@/application/handlers/chemical_cargo/deliverChemicalCargoDocumentation";
import readChemicalCargoById from "@/application/handlers/chemical_cargo/readChemicalCargoById";
import readChemicalCargos from "@/application/handlers/chemical_cargo/readChemicalCargos";
import releaseChemicalCargo from "@/application/handlers/chemical_cargo/releaseChemicalCargo";
import updateChemicalCargoStatus from "@/application/handlers/chemical_cargo/updateChemicalCargoStatus";
import express from "express";

export const chemicalCargoRouter = express.Router();

chemicalCargoRouter.post("/", createChemicalCargo);
chemicalCargoRouter.get("/", readChemicalCargos);
chemicalCargoRouter.get("/:id", readChemicalCargoById);
chemicalCargoRouter.patch("/:id", updateChemicalCargoStatus);
chemicalCargoRouter.patch("/block/:id", blockChemicalCargo);
chemicalCargoRouter.patch("/release/:id", releaseChemicalCargo);
chemicalCargoRouter.patch("/cancel/:id", cancelChemicalCargo);
chemicalCargoRouter.patch(
  "/documentation/:id",
  deliverChemicalCargoDocumentation,
);

export default chemicalCargoRouter;
