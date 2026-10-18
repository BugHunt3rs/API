import type { NewChemical } from "@/domain/entities/Chemical";
import ChemicalRepository from "@/infrastructure/database/repositories/chemical/ChemicalRepository";
import logger from "@/infrastructure/logger/logger";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import hasProperties from "@/utils/hasProperty";

const createChememical = createHandler(async ({ request, response }) => {
  const body: NewChemical = request.body;
  if (
    !hasProperties(body, [
      "name",
      "description",
      "UN_number",
      "risk_class_id",
      "status",
    ])
  ) {
    logger.error(request, ERROR_MESSAGES.BAD_REQUEST);
    response.status(400).json({ error: ERROR_MESSAGES.BAD_REQUEST });
    return;
  }

  try {
    const newChemical = await ChemicalRepository.create(body);
    logger.create(request, newChemical);
    response.status(201).json({ data: newChemical });
  } catch (error) {
    logger.error(request, error as string);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default createChemical;
