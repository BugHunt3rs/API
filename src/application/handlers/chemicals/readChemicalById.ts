import logger from "@/infrastructure/logger/logger";
import ChemicalRepository from "@/infrastructure/database/repositories/chemical/ChemicalRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const readChemicalById = createHandler(async ({ request, response }) => {
  const { id } = request.params;

  if (!id || Array.isArray(id) || isNaN(+id) || !Number.isInteger(+id)) {
    logger.error(request, ERROR_MESSAGES.INVALID_ID);
    response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    return;
  }

  try {
    const chemical = await ChemicalRepository.readById(+id);

    if (!chemical) {
      logger.error(request, ERROR_MESSAGES.NOT_FOUND);
      response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      return;
    }

    response.status(200).json({ data: chemical });
  } catch (error) {
    logger.error(request, error as string);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default readChemicalById;
