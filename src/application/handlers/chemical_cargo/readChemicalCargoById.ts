import { prisma } from "../../../infrastructure/database/prismaClient";
import ChemicalRepository from "../../../infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import createHandler from "../../../utils/createHandler";
import ERROR_MESSAGES from "../../../utils/ErrorsMessages";

const readChemicalCargoById = createHandler(async ({ request, response }) => {
  const { id } = request.params;

  if (!id || isNaN(+id) || !Number.isInteger(+id)) {
    response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    return;
  }

  const chemicalCargo = await ChemicalRepository.readById(+id);

  response.status(200).json({ data: chemicalCargo });
  try {
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default readChemicalCargoById;
