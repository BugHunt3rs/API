import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import logger from "@/infrastructure/logger/logger";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const deleteChemicalCargoStats = createHandler(
  async ({ request, response }) => {
    const { id } = request.params;

    if (!id || Array.isArray(id) || isNaN(+id) || !Number.isInteger(+id)) {
      logger.error(request, ERROR_MESSAGES.BAD_REQUEST)
      response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
      return;
    }

    try {
      const deletedChemicalCargoStatus =
        await ChemicalCargoStatusRepository.delete(+id);

      logger.deletion(request, deletedChemicalCargoStatus)
      response.json({ data: deletedChemicalCargoStatus });
    } catch (err) {
      logger.error(request, `${ERROR_MESSAGES.UNEXPECTED_ERROR} - ${err}`)
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
    }
  },
);

export default deleteChemicalCargoStats;
