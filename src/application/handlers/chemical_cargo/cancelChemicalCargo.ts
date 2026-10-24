import ChemicalCargoStatus from "@/domain/status/ChemicalCargoStatus";
import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import logger from "@/infrastructure/logger/logger";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const cancelChemicalCargo = createHandler(async ({ request, response }) => {
  const { id } = request.params;

  if (!id || isNaN(+id) || Array.isArray(id) || !Number.isInteger(+id)) {
    logger.error(request, ERROR_MESSAGES.INVALID_ID)
    response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    return;
  }

  try {
    const chemicalCargoToCancel = await ChemicalCargoRepository.readById(+id);
    if (!chemicalCargoToCancel) {
      logger.error(request, ERROR_MESSAGES.BAD_REQUEST)
      response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      return;
    }

    const canceledStatusId = (
      await ChemicalCargoStatusRepository.readAll()
    ).find(
      (cargoStatus) => cargoStatus.description === ChemicalCargoStatus.canceled,
    )?.id;

    if (!canceledStatusId) {
      logger.error(request, ERROR_MESSAGES.UNEXPECTED_ERROR)
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
      return;
    }

    const canceledChemicalCargo = await ChemicalCargoRepository.update(
      chemicalCargoToCancel.id,
      { status_id: canceledStatusId },
    );

    logger.update(request, chemicalCargoToCancel, canceledChemicalCargo)
    response.status(200).json({ data: canceledChemicalCargo });
  } catch (error) {

    logger.error(request, `${ERROR_MESSAGES.UNEXPECTED_ERROR} - ${error}`)
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default cancelChemicalCargo;
