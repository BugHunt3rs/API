import ChemicalRepository from "@/infrastructure/database/repositories/chemical/ChemicalRepository";
import logger from "@/infrastructure/logger/logger";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const readChemicals = createHandler(async ({ request, response }) => {
  try {
    const chemicals = await ChemicalRepository.readAll();

    response.status(200).json({ data: chemicals });
  } catch (error) {
    logger.error(request, error as string);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default readChemicals;
