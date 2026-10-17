import type { Request, Response } from "express";
import ChemicalRepository from "../../../infrastructure/database/repositories/chemical/ChemicalRepository";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import logger from "@/infrastructure/logger/logger";

export default async function deleteChemical(
  request: Request,
  response: Response,
) {
  const { id } = request.params;

  if (!id || Array.isArray(id) || isNaN(+id) || !Number.isInteger(+id)) {
    response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    return;
  }

  try {
    const chemicalToDelete = await ChemicalRepository.readById(+id);

    if (!chemicalToDelete) {
      response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      return;
    }

    const deletedChemical = await ChemicalRepository.delete(+id);

    logger({ logType: "DELETE", oldValue: deletedChemical, newValue: null });
    response.status(200).json({ data: deletedChemical });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
}
