import type { Request, Response, NextFunction } from "express";
import type { NewChemical } from "../../../domain/entities/Chemical";
import ChemicalRepository from "../../../infrastructure/database/repositories/chemical/ChemicalRepository";

export default async function createChemical(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const { name, description, UN_number, status, risk_class_id }: NewChemical =
    request.body;

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
