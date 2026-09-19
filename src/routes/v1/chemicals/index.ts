import express from "express";
import { prisma } from "../../../../infrastructure/database/orm/prisma/generated/prisma/prismaClient.ts";
import createChemical from "../../../handlers/chemicals/createChemical.ts";

export const chemicalRouter = express.Router();

chemicalRouter.post("/", createChemical);

chemicalRouter.get("/", async (_, response) => {
  const chemicals = await prisma.chemical.findMany();
  response.json({ data: chemicals });
});
