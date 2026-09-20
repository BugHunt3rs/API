import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prismaClient";
import type {
  Chemical,
  NewChemical,
} from "../../domain/entities/chemical_entities";

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

    const {
      name,
      description,
      UN_number,
      risk_class_id,
      status,
    }: Partial<NewChemical> = request.body;

    const chemicals = await prisma.chemical.update({
      where: { id: +id },
      data: {
        name,
        description,
        UN_number,
        risk_class_id,
        status,
        update_date: new Date(),
      },
    });
    response.status(200).json({ data: chemicals });
  } catch (error) {
    console.error(error);
    next(error);
  }
}
