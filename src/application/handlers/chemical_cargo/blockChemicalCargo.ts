import { canMoveChemicalCargo } from "@/domain/rules/chemical_cargo/cargoStatusRules";
import ChemicalCargoStatus from "@/domain/status/ChemicalCargoStatus";
import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import logger from "@/infrastructure/logger/logger";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import getCargoStatusKey from "@/utils/getCargoStatusKey";

const blockChemicalCargo = createHandler(async ({ request, response }) => {
  const { id } = request.params;

  if (!id || isNaN(+id) || Array.isArray(id) || !Number.isInteger(+id)) {
    logger.error(request, ERROR_MESSAGES.INVALID_ID);
    response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    return;
  }

  try {
    const chemicalCargoToBlock = await ChemicalCargoRepository.readById(+id);
    if (!chemicalCargoToBlock) {
      logger.error(request, ERROR_MESSAGES.NOT_FOUND);
      response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      return;
    }

    const currentStatus = await ChemicalCargoStatusRepository.readById(
      chemicalCargoToBlock.status_id,
    );

    const currentStatusKey = currentStatus
      ? getCargoStatusKey(currentStatus.description)
      : undefined;

    if (!currentStatusKey) {
      logger.error(request, ERROR_MESSAGES.INVALID_STATUS_KEY);
      response.status(500).json({ error: ERROR_MESSAGES.INVALID_STATUS_KEY });
      return;
    }

    const { canMove, cannotMoveReasons } = canMoveChemicalCargo(
      currentStatusKey,
      "blocked",
    );

    if (!canMove) {
      logger.error(request, ERROR_MESSAGES.INVALID_STATUS_TRANSITION);
      response.status(409).json({
        error: `${ERROR_MESSAGES.INVALID_STATUS_TRANSITION} - ${JSON.stringify(cannotMoveReasons)}`,
      });
      return;
    }

    const blockedStatusId = (
      await ChemicalCargoStatusRepository.readAll()
    ).find(
      (cargoStatus) => cargoStatus.description === ChemicalCargoStatus.blocked,
    )?.id;

    if (!blockedStatusId) {
      logger.error(request, ERROR_MESSAGES.UNEXPECTED_ERROR);
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
      return;
    }

    const blockedChemicalCargo = await ChemicalCargoRepository.update(
      chemicalCargoToBlock.id,
      { status_id: blockedStatusId },
    );
    logger.update(request, chemicalCargoToBlock, blockedChemicalCargo);
    response.status(200).json({ data: blockedChemicalCargo });
  } catch (error) {
    logger.error(request, `${ERROR_MESSAGES.UNEXPECTED_ERROR} - ${error}`);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default blockChemicalCargo;
