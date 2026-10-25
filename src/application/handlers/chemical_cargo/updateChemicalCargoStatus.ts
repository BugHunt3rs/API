import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import logger from "@/infrastructure/logger/logger";
import canMoveChemicalCargo from "@/utils/canMoveChemicalCargo";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const updateChemicalCargoStatus = createHandler(
  async ({ request, response }) => {
    const { id } = request.params;
    const { status_id } = request.body ?? {};

    if (!id || isNaN(+id) || Array.isArray(id) || !Number.isInteger(+id)) {
      logger.error(request, ERROR_MESSAGES.INVALID_ID)
      response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
      return;
    }

    if (!Number.isInteger(status_id)) {
      logger.error(request, ERROR_MESSAGES.BAD_REQUEST)
      response.status(400).json({ error: ERROR_MESSAGES.BAD_REQUEST });
      return;
    }

    try {
      const chemicalCargoToUpdate = await ChemicalCargoRepository.readById(+id);

      if (!chemicalCargoToUpdate) {
        logger.error(request, ERROR_MESSAGES.NOT_FOUND)
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
        await ChemicalCargoStatusRepository.readById(status_id);

      if (!newStatus) {
        logger.error(request, ERROR_MESSAGES.BAD_REQUEST)
        response.status(400).json({ error: ERROR_MESSAGES.BAD_REQUEST });
        return;
      }

      const updatedChemicalCargo = await ChemicalCargoRepository.update(
        chemicalCargoToUpdate.id,
        { status_id: newStatus.id },
      );

      logger.update(request, chemicalCargoToUpdate, updatedChemicalCargo)
      response.status(200).json({ data: updatedChemicalCargo });
    } catch (error) {
      logger.error(request, ERROR_MESSAGES.BAD_REQUEST)
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
    }
  },
);

export default updateChemicalCargoStatus;
