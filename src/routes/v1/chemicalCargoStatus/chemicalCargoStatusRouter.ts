import createChemicalCargoStatus from "@/application/handlers/chemical_cargo_status/createChemicalCargoStatus";
import deleteChemicalCargoStats from "@/application/handlers/chemical_cargo_status/deleteChemicalCargoStatus";
import readChemicalCargoStatus from "@/application/handlers/chemical_cargo_status/readChemicalCargoStatus";
import readChemicalCargoStatusById from "@/application/handlers/chemical_cargo_status/readChemicalCargoStatusById";
import express from "express";
export const chemicalCargoStatusRouter = express.Router();

chemicalCargoStatusRouter.post("/", createChemicalCargoStatus);
chemicalCargoStatusRouter.get("/", readChemicalCargoStatus);
chemicalCargoStatusRouter.get("/:id", readChemicalCargoStatusById);
chemicalCargoStatusRouter.delete("/:id", deleteChemicalCargoStats);
