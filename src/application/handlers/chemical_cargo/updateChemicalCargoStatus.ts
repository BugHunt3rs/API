import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const updateChemicalCargoStatus = createHandler(
  async ({ request, response }) => {
    const { id } = request.params;
    const { status_id } = request.body ?? {};

    if (!id || isNaN(+id) || Array.isArray(id) || !Number.isInteger(+id)) {
      response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
      return;
    }

    if (!Number.isInteger(status_id)) {
      response.status(400).json({ error: ERROR_MESSAGES.BAD_REQUEST });
      return;
    }

    try {
      const chemicalCargoToUpdate = await ChemicalCargoRepository.readById(+id);

      if (!chemicalCargoToUpdate) {
        response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
        return;
      }

      const updatedChemicalCargo = await ChemicalCargoRepository.update(
        chemicalCargoToUpdate.id,
        { status_id },
      );

      response.status(200).json({ data: updatedChemicalCargo });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
    }
  },
);

export default updateChemicalCargoStatus;
