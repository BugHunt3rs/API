import type { NextFunction, Request, Response } from "express";
import type { NewChemical } from "../../../domain/entities/Chemical";
import ChemicalRepository from "../../../infrastructure/database/repositories/chemical/ChemicalRepository";
import logger from "@/infrastructure/logger/logger";

export default async function updateChemical(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { id } = request.params;

    if (!id || isNaN(+id)) {
      response.status(500).json({ error: "Invalid ID" });
      return;
    }
    // TODO: Check if target chemical exists before attempting to update it
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

    logger({ logType: "UPDATE", newValue: updatedChemical, oldValue: null });
    response.status(200).json({ data: updatedChemical });
  } catch (error) {
    console.error(error);
    next(error);
  }
}
