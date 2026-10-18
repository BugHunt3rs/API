import ChemicalRepository from "@/infrastructure/database/repositories/chemical/ChemicalRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const readChemicals = createHandler(async ({ response }) => {
  try {
    const chemicals = await ChemicalRepository.readAll();

    response.status(200).json({ data: chemicals });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default readChemicals;
