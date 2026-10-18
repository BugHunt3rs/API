import ChemicalRepository from "@/infrastructure/database/repositories/chemical/ChemicalRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import logger from "@/infrastructure/logger/logger";

const deactivateChemical = createHandler(async ({ request, response }) => {
  const { id } = request.params;

  if (!id || Array.isArray(id) || isNaN(+id) || !Number.isInteger(+id)) {
    response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    return;
  }

  try {
    // TODO: Check if target chemical exists before attempting to update it
    // TODO: add logger after deactivating chemical
    const chemicalToDeactivate = await ChemicalRepository.readById(+id);

    if (!chemicalToDeactivate) {
      response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      return;
    }

    const deactivatedChemical = await ChemicalRepository.update(+id, {
      status: false,
      update_date: new Date(),
    });
    response.status(200).json({ data: deactivatedChemical });
  } catch (error) {
    logger.error(request, error as string);
    console.error(error);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default deactivateChemical;
