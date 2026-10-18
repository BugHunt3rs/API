import type { NextFunction, Request, Response } from "express";
import type { NewChemical } from "../../../domain/entities/Chemical";
import ChemicalRepository from "../../../infrastructure/database/repositories/chemical/ChemicalRepository";
import createLog from "@/infrastructure/logger/logger";
import logger from "@/infrastructure/logger/logger";
import ERROR_MESSAGES from "@/utils/errorsMessages";

export default async function updateChemical(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { id } = request.params;

    if (!id || isNaN(+id)) {
      logger.error(request, ERROR_MESSAGES.BAD_REQUEST);
      response.status(500).json({ error: "Invalid ID" });
      return;
    }
    // TODO: Check if target chemical exists before attempting to update it
    // TODO: add logger after deactivating chemical
    const {
      name,
      description,
      UN_number,
      risk_class_id,
      status,
    }: Partial<NewChemical> = request.body;

    const updatedChemical = await ChemicalRepository.update(+id, {
      name,
      description,
      UN_number,
      risk_class_id,
      status,
    });

    response.status(200).json({ data: updatedChemical });
  } catch (error) {
    logger.error(request, error as string);
    next(error);
  }
}
