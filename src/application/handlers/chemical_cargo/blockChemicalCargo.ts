import { canMoveChemicalCargo } from "@/domain/rules/chemical_cargo/cargoStatusRules";
import ChemicalCargoStatus from "@/domain/status/ChemicalCargoStatus";
import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const blockChemicalCargo = createHandler(async ({ request, response }) => {
  const { id } = request.params;

  if (!id || isNaN(+id) || Array.isArray(id) || !Number.isInteger(+id)) {
    response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    return;
  }

  try {
    const chemicalCargoToBlock = await ChemicalCargoRepository.readById(+id);
    if (!chemicalCargoToBlock) {
      response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      return;
    }

    const currentStatus = await ChemicalCargoStatusRepository.readById(
      chemicalCargoToBlock.status_id,
    );

    if (!currentStatus) {
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
      return;
    }

    const { canMove, cannotMoveReasons } = canMoveChemicalCargo(
      currentStatus.description,
      ChemicalCargoStatus.blocked,
    );

    if (!canMove) {
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
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
      return;
    }

    const blockedChemicalCargo = await ChemicalCargoRepository.update(
      chemicalCargoToBlock.id,
      { status_id: blockedStatusId },
    );

    response.status(200).json({ data: blockedChemicalCargo });
  } catch (error) {
    console.error(error);

    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default blockChemicalCargo;
