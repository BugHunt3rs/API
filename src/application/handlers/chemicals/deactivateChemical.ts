import type { Request, Response } from "express";
import ChemicalRepository from "../../../infrastructure/database/repositories/chemical/ChemicalRepository";
export default async function deactivateChemical(
  request: Request,
  response: Response,
) {
  const { id } = request.params;

  if (!id || Array.isArray(id) || isNaN(+id) || !Number.isInteger(+id)) {
    response.status(500).json({ error: "Invalid ID" });
    return;
  }

  try {
    const deactivatedChemical = await ChemicalRepository.update(+id, {
      status: false,
      update_date: new Date(),
    });

    response.status(200).json({ data: deactivatedChemical });
  } catch (error) {
    console.error(error);
  }
}
