import type { Request, Response, NextFunction } from "express";
import type { NewChemical } from "../../domain/entities/chemical_entities.ts";
import { prisma } from "../../lib/prismaClient";

export default async function createChemical(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const { name, description, UN_number, status, risk_class_id }: NewChemical =
    request.body;

  try {
    const newChemical = await prisma.chemical.create({
      data: {
        name,
        description,
        UN_number,
        status,
        risk_class_id,
      },
    });

    response.status(201).json({ data: newChemical });
  } catch (error) {
    console.error(error);
    next(error);
  }
}
