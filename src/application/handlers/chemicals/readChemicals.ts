import type { NextFunction, Request, Response } from "express";
import ChemicalRepository from "../../../infrastructure/database/repositories/chemical/ChemicalRepository";

export default async function readChemicals(
  _: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const chemicals = await ChemicalRepository.readAll();

    response.status(200).json({ data: chemicals });
  } catch (error) {
    console.error(error);
    next(error);
  }
}
