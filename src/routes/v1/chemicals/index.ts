import express from "express";
import createChemical from "../../../handlers/chemicals/createChemical";

export const chemicalRouter = express.Router();

chemicalRouter.post("/", createChemical);

chemicalRouter.get("/", async (_, response) => {
  const chemicals = await prisma.chemical.findMany();
  response.json({ data: chemicals });
});
