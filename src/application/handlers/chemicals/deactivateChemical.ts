import ChemicalRepository from "@/infrastructure/database/repositories/chemical/ChemicalRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import logger from "@/infrastructure/logger/logger";

const deactivateChemical = createHandler(async ({ request, response }) => {
  const { id } = request.params;

  if (!id || Array.isArray(id) || isNaN(+id) || !Number.isInteger(+id)) {
    logger.error(request, ERROR_MESSAGES.INVALID_ID);
    response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    return;
  }

  try {
    const chemicalToDeactivate = await ChemicalRepository.readById(+id);

    if (!chemicalToDeactivate) {
      logger.error(request, ERROR_MESSAGES.NOT_FOUND);
      response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      return;
    }

    const deactivatedChemical = await ChemicalRepository.update(+id, {
      status: false,
      update_date: new Date(),
    });

    logger.update(request, chemicalToDeactivate, deactivatedChemical);
    response.status(200).json({ data: deactivatedChemical });
  } catch (error) {
    logger.error(request, `${ERROR_MESSAGES.UNEXPECTED_ERROR} - ${error}`);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default deactivateChemical;
