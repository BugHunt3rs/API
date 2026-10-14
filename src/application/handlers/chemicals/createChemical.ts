import type { Request, Response, NextFunction } from "express";
import type { NewChemical } from "../../../domain/entities/Chemical";
import ChemicalRepository from "../../../infrastructure/database/repositories/chemical/ChemicalRepository";
import ERROR_MESSAGES from "../../../utils/errorsMessages";

export default async function createChemical(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const { name, description, UN_number, status, risk_class_id }: NewChemical =
    request.body;

  if (typeof name !== "string" || !name.trim() || !risk_class_id) {
    response.status(400).json({ error: ERROR_MESSAGES.BAD_REQUEST });
    return;
  }

  try {
    const newChemical = await ChemicalRepository.create({
      name,
      description,
      UN_number,
      status,
      risk_class_id,
    });

    response.status(201).json({ data: newChemical });
  } catch (error) {
    console.error(error);
    next(error);
  }
}
