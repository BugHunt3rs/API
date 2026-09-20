import type { Request, Response } from "express";
import type { NewChemicalCargo } from "../../../domain/entities/ChemicalCargo";
import ERROR_MESSAGES from "../../../utils/ErrorsMessages";
import ChemicalRepository from "../../../infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";

export default function createChemicalCargo(
  request: Request,
  response: Response,
) {
  const body: NewChemicalCargo = request.body;
  // Todo - VALIDADE REQUEST BODY

  try {
    const newChemicalCargo = ChemicalRepository.create(body);
    response.status(201).json({ data: newChemicalCargo });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
}
