import { canMoveChemicalCargo } from "@/domain/rules/chemical_cargo/cargoStatusRules";
import getStatusKey from "@/utils/getStatusKey";
import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import logger from "@/infrastructure/logger/logger";
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

      const newStatus =
        await ChemicalCargoStatusRepository.readById(status_id);

      const newStatusKey = newStatus
        ? getStatusKey(newStatus.description)
        : undefined;

      if (!newStatus) {
        logger.error(request, ERROR_MESSAGES.BAD_REQUEST);
        response.status(400).json({ error: ERROR_MESSAGES.BAD_REQUEST });
        return;
      }

      if (!newStatusKey) {
        logger.error(request, ERROR_MESSAGES.INVALID_STATUS_KEY);
        response.status(400).json({ error: ERROR_MESSAGES.INVALID_STATUS_KEY });
        return;
      }

      const currentStatus = await ChemicalCargoStatusRepository.readById(
        chemicalCargoToUpdate.status_id,
      );

      const currentStatusKey = currentStatus
        ? getStatusKey(currentStatus.description)
        : undefined;

      if (!currentStatusKey) {
        logger.error(request, ERROR_MESSAGES.INVALID_STATUS_KEY);
        response.status(500).json({ error: ERROR_MESSAGES.INVALID_STATUS_KEY });
        return;
      }

      const { canMove, cannotMoveReasons } = canMoveChemicalCargo(
        currentStatusKey,
        newStatusKey,
      );

      if (!canMove) {
        logger.error(request, ERROR_MESSAGES.INVALID_STATUS_TRANSITION);
        response.status(409).json({
          error: `${ERROR_MESSAGES.INVALID_STATUS_TRANSITION} - ${JSON.stringify(cannotMoveReasons)}`,
        });
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
