import ChemicalRepository from "@/infrastructure/database/repositories/chemical/ChemicalRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import logger from "@/infrastructure/logger/logger";

const deleteChemical = createHandler(async ({ request, response }) => {
  const { id } = request.params;

  if (!id || Array.isArray(id) || isNaN(+id) || !Number.isInteger(+id)) {
    logger.error(request, ERROR_MESSAGES.BAD_REQUEST);
    response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    return;
  }

  try {
    const chemicalToDelete = await ChemicalRepository.readById(+id);

    if (!chemicalToDelete) {
      logger.error(request, ERROR_MESSAGES.NOT_FOUND);
      response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      return;
    }

    const deletedChemical = await ChemicalRepository.delete(+id);
    logger.deletion(request, deletedChemical);

    response.status(200).json({ data: deletedChemical });
  } catch (error) {
    logger.error(request, error as string);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default deleteChemical;
