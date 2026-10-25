import ChemicalCargoStatus from "@/domain/status/ChemicalCargoStatus";
import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import logger from "@/infrastructure/logger/logger";
import canMoveChemicalCargo from "@/utils/canMoveChemicalCargo";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

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

    const { canMove, cannotMoveReasons } = await canMoveChemicalCargo(
      chemicalCargoToRelease,
    );

    if (!canMove) {
      response.status(403).json({
        error: `${ERROR_MESSAGES.FORBIDDEN} - ${JSON.stringify(cannotMoveReasons)}`,
      });
    }

    if (!chemicalCargoToRelease.required_documentation_id) {
      logger.error(request, ERROR_MESSAGES.FORBIDDEN)
      response.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
      return;
    }

    const chemicalCargoStatus = await ChemicalCargoStatusRepository.readById(
      chemicalCargoToRelease.status_id,
    );

    if (!chemicalCargoStatus) {
      logger.error(request, ERROR_MESSAGES.UNEXPECTED_ERROR)
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
      return;
    }

    if (chemicalCargoStatus.description === ChemicalCargoStatus.blocked) {
      logger.error(request, ERROR_MESSAGES.FORBIDDEN)
      response.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
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

    const releasedChemicalCargo = ChemicalCargoRepository.update(
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
