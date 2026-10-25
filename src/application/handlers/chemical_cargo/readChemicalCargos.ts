import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import logger from "@/infrastructure/logger/logger";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const readChemicalCargos = createHandler(async ({ request, response }) => {
  try {
    const chemicalCargos = await ChemicalCargoRepository.readAll();
    response.status(200).json({ data: chemicalCargos });

  } catch (error) {
    logger.error(request, ERROR_MESSAGES.UNEXPECTED_ERROR)
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default readChemicalCargos;
