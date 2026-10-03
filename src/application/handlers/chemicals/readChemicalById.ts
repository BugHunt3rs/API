import type { Request, Response } from "express";
import ChemicalRepository from "../../../infrastructure/database/repositories/chemical/ChemicalRepository";
export default async function readChemicalById(
  request: Request,
  response: Response,
) {
  const { id } = request.params;

  if (!id || Array.isArray(id) || isNaN(+id) || !Number.isInteger(+id)) {
    response.status(500).json({ error: "Invalid ID" });
    return;
  }

  try {
    const chemical = await ChemicalRepository.readById(+id);

    response.status(200).json({ data: chemical });
  } catch (error) {
    console.error(error);
  }
}
