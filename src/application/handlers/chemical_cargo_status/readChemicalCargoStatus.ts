import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import logger from "@/infrastructure/logger/logger";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const readChemicalCargoStatus = createHandler(async ({ request, response }) => {
  try {
    const chemicalCargosStatus = await ChemicalCargoStatusRepository.readAll();

    response.json({ data: chemicalCargosStatus });
  } catch (error) {
    logger.error(request, `${ERROR_MESSAGES.UNEXPECTED_ERROR} - ${error}`)
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default readChemicalCargoStatus;
