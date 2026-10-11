import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import canMoveChemicalCargo from "@/utils/canMoveChemicalCargo";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const updateChemicalCargoStatus = createHandler(
  async ({ request, response }) => {
    const { newStatusId } = request.params;

    if (
      !newStatusId ||
      isNaN(+newStatusId) ||
      Array.isArray(newStatusId) ||
      !Number.isInteger(+newStatusId)
    ) {
      response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
      return;
    }

    try {
      const chemicalCargoToUpdate =
        await ChemicalCargoRepository.readById(+newStatusId);

      if (!chemicalCargoToUpdate) {
        response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
        return;
      }

      const { canMove, cannotMoveReasons } = await canMoveChemicalCargo(
        chemicalCargoToUpdate,
      );

      if (!canMove) {
        response.status(403).json({
          error: `${ERROR_MESSAGES.FORBIDDEN} - ${JSON.stringify(cannotMoveReasons)}`,
        });
      }

      const newStatus =
        await ChemicalCargoStatusRepository.readById(+newStatusId);

      if (!newStatus) {
        response.status(400).json({ error: ERROR_MESSAGES.BAD_REQUEST });
        return;
      }

      const updatedChemicalCargo = await ChemicalCargoRepository.update(
        chemicalCargoToUpdate.id,
        { status_id: newStatus.id },
      );

      response.status(200).json({ data: updatedChemicalCargo });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
    }
  },
);

export default updateChemicalCargoStatus;
