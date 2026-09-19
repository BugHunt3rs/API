import express from "express";
import { prisma } from "../../../../infrastructure/database/orm/prisma/generated/prisma/prismaClient.ts";
import { type chemicalModel } from "../../../../infrastructure/database/orm/prisma/generated/prisma/models.ts";

export const chemicalRouter = express.Router();

type NewChemical = Omit<chemicalModel, "id">;

chemicalRouter.post("/", async (request, response) => {
  const {
    name,
    Description,
    UN_number,
    status,
    risk_class_id,
    create_date,
    update_date,
  }: NewChemical = request.body;

  const newChemical = await prisma.chemical.create({
    data: {
      name,
      Description,
      UN_number,
      status,
      risk_class_id,
      create_date,
      update_date,
    },
  });

  response.json({ data: newChemical });
});

chemicalRouter.get("/", async (_, response) => {
  const chemicals = await prisma.chemical.findMany();
  response.json({ data: chemicals });
});
