import type { Request, Response } from "express";
import ChemicalRepository from "../../../infrastructure/database/repositories/chemical/ChemicalRepository";
import logger from "@/infrastructure/logger/logger";
import ERROR_MESSAGES from "@/utils/errorsMessages";
export default async function deactivateChemical(
  request: Request,
  response: Response,
) {
  const { id } = request.params;

  if (!id || Array.isArray(id) || isNaN(+id) || !Number.isInteger(+id)) {
    logger.error(request, ERROR_MESSAGES.BAD_REQUEST);
    response.status(500).json({ error: "Invalid ID" });

    return;
  }

  try {
    // TODO: Check if target chemical exists before attempting to update it
    // TODO: add logger after deactivating chemical
    const deactivatedChemical = await ChemicalRepository.update(+id, {
      status: false,
      update_date: new Date(),
    });
    response.status(200).json({ data: deactivatedChemical });
  } catch (error) {
    logger.error(request, error as string);
  }
}
