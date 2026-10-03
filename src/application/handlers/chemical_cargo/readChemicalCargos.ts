import ChemicalRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const readChemicalCargos = createHandler(async ({ response }) => {
  // Todo - VALIDADE REQUEST BODY

  try {
    const chemicalCargos = ChemicalRepository.readAll();
    response.status(201).json({ data: chemicalCargos });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default readChemicalCargos;
