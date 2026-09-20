import ChemicalRepository from "../../../infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import createHandler from "../../../utils/createHandler";
import ERROR_MESSAGES from "../../../utils/ErrorsMessages";

const updateChemicalCargoStatus = createHandler(
  async ({ request, response }) => {
    const { newStatusId } = request.params;

    if (
      !newStatusId ||
      isNaN(+newStatusId) ||
      !Number.isInteger(+newStatusId)
    ) {
      response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
      return;
    }

    try {
      const chemicalCargoToUpdate =
        await ChemicalRepository.readById(+newStatusId);

      if (!chemicalCargoToUpdate) {
        response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
        return;
      }

      const updatedChemicalCargo = await ChemicalRepository.update(
        chemicalCargoToUpdate.id,
        { status_id: +newStatusId },
      );

      response.status(200).json({ data: updatedChemicalCargo });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
    }
  },
);

export default updateChemicalCargoStatus;
