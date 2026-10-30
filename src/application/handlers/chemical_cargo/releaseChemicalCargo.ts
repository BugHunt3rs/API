import { canMoveChemicalCargo } from "@/domain/rules/chemical_cargo/cargoStatusRules";
import ChemicalCargoStatus from "@/domain/status/ChemicalCargoStatus";
import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import logger from "@/infrastructure/logger/logger";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import getCargoStatusKey from "@/utils/getCargoStatusKey";

const releaseChemicalCargo = createHandler(async ({ request, response }) => {
  const { id } = request.params;

  if (!id || isNaN(+id) || Array.isArray(id) || !Number.isInteger(+id)) {
    logger.error(request, ERROR_MESSAGES.INVALID_ID)
    response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    return;
  }

  try {
    const chemicalCargoToRelease = await ChemicalCargoRepository.readById(+id);

    if (!chemicalCargoToRelease) {
      logger.error(request, ERROR_MESSAGES.NOT_FOUND)
      response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      return;
    }

    if (!chemicalCargoToRelease.required_documentation_id) {
      logger.error(request, ERROR_MESSAGES.FORBIDDEN)
      response.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
      return;
    }

    const chemicalCargoStatus = await ChemicalCargoStatusRepository.readById(
      chemicalCargoToRelease.status_id,
    );

    const currentStatusKey = chemicalCargoStatus
      ? getCargoStatusKey(chemicalCargoStatus.description)
      : undefined;

    if (!currentStatusKey) {
      logger.error(request, ERROR_MESSAGES.INVALID_STATUS_KEY);
      response.status(500).json({ error: ERROR_MESSAGES.INVALID_STATUS_KEY });
      return;
    }

    const { canMove, cannotMoveReasons } = canMoveChemicalCargo(
      currentStatusKey,
      "released",
      chemicalCargoToRelease.documentation_delivered,
    );

    if (!canMove) {
      logger.error(request, ERROR_MESSAGES.INVALID_STATUS_TRANSITION);
      response.status(409).json({
        error: `${ERROR_MESSAGES.INVALID_STATUS_TRANSITION} - ${JSON.stringify(cannotMoveReasons)}`,
      });
      return;
    }

    const releasedCargoStatusId = (
      await ChemicalCargoStatusRepository.readAll()
    ).find(
      (cargoStatus) => cargoStatus.description === ChemicalCargoStatus.released,
    )?.id;

    if (!releasedCargoStatusId) {
      logger.error(request, ERROR_MESSAGES.UNEXPECTED_ERROR)
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
      return;
    }

    const releasedChemicalCargo = await ChemicalCargoRepository.update(
      chemicalCargoToRelease.id,
      { status_id: releasedCargoStatusId },
    );

    logger.update(request, chemicalCargoToRelease, releasedChemicalCargo)
    response.status(200).json({ data: releasedChemicalCargo });
  } catch (error) {
    logger.error(request, ERROR_MESSAGES.UNEXPECTED_ERROR)
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default releaseChemicalCargo;
