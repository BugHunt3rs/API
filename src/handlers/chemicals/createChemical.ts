import { Request, Response, NextFunction } from "express";
import { NewChemical } from "../../domain/entities/chemical_entities";
import { prisma } from "../../../infrastructure/database/orm/prisma/generated/prisma/prismaClient";

export default async function createChemical(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const { name, Description, UN_number, status, risk_class_id }: NewChemical =
    request.body;

  try {
    const newChemical = await prisma.chemical.create({
      data: {
        name,
        Description,
        UN_number,
        status,
        risk_class_id,
      },
    });

    response.json({ data: newChemical });
  } catch (error) {
    console.error(error);
    next(error);
  }
}
