import type { Request, Response } from "express";
import ChemicalRepository from "../../../infrastructure/database/repositories/chemical/ChemicalRepository";
import logger from "@/infrastructure/logger/logger";
import ERROR_MESSAGES from "@/utils/errorsMessages";
export default async function readChemicalById(
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
    const chemical = await ChemicalRepository.readById(+id);
    response.status(200).json({ data: chemical });
  } catch (error) {
    logger.error(request, error as string);
    // TODO: respond with error
  }
}
