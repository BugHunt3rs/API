import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prismaClient";

export default async function readChemicals(
  _: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const chemicals = await prisma.chemical.findMany();
    response.status(200).json({ data: chemicals });
  } catch (error) {
    console.error(error);
    next(error);
  }
}
