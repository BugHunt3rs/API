import ChemicalRepository from "../../../infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import createHandler from "../../../utils/createHandler";
import ERROR_MESSAGES from "../../../utils/ErrorsMessages";

const blockChemicalCargo = createHandler(async ({ request, response }) => {
  const { id } = request.params;

  if (!id || isNaN(+id) || Array.isArray(id) || !Number.isInteger(+id)) {
    response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    return;
  }

  try {
    const chemicalCargoToBlock = await ChemicalRepository.readById(+id);
    if (!chemicalCargoToBlock) {
      response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      return;
    }

    const blockedChemicalCargo = ChemicalRepository.update(
      chemicalCargoToBlock.id,
      { status_id: 0 }, // TODO - replace ZERO with blocked status id
    );

    response.status(200).json({ data: blockedChemicalCargo });
  } catch (error) {
    console.error(error);

    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});


export default blockChemicalCargo