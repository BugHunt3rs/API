import type { Request, Response } from "express";
import ChemicalRepository from "../../../infrastructure/database/repositories/chemical/ChemicalRepository";
import logger from "@/infrastructure/logger/logger";
import ERROR_MESSAGES from "@/utils/errorsMessages";
export default async function readChemicalById(
  request: Request,
  response: Response,
) {
  const { id } = request.params;

  if (!id || Array.isArray(id) || isNaN(+id) || !Number.isInteger(+id)) {
    logger.error(request, ERROR_MESSAGES.BAD_REQUEST);
    response.status(500).json({ error: "Invalid ID" });
import ChemicalRepository from "@/infrastructure/database/repositories/chemical/ChemicalRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const readChemicalById = createHandler(async ({ request, response }) => {
  const { id } = request.params;

  if (!id || Array.isArray(id) || isNaN(+id) || !Number.isInteger(+id)) {
    response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    return;
  }

  try {
    const chemical = await ChemicalRepository.readById(+id);
    response.status(200).json({ data: chemical });
  } catch (error) {
    logger.error(request, error as string);
    // TODO: respond with error

    if (!chemical) {
      response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      return;
    }

    if (!chemical) {
      response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      return;
    }

    response.status(200).json({ data: chemical });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default readChemicalById;
