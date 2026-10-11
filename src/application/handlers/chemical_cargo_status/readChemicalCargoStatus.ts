import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const readChemicalCargo = createHandler(async ({ response }) => {
  try {
    const chemicalCargosStatus = await ChemicalCargoStatusRepository.readAll();

    response.json({ data: chemicalCargosStatus });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default readChemicalCargo;
