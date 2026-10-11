import ChemicalCargoStatus from "@/domain/status/ChemicalCargoStatus";
import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const releaseChemicalCargo = createHandler(async ({ request, response }) => {
  const { id } = request.params;

  if (!id || isNaN(+id) || Array.isArray(id) || !Number.isInteger(+id)) {
    response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    return;
  }

  try {
    const chemicalCargoToRelease = await ChemicalCargoRepository.readById(+id);

    if (!chemicalCargoToRelease) {
      response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      return;
    }

    if (!chemicalCargoToRelease.required_documentation_id) {
      response.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
      return;
    }

    const chemicalCargoStatus = await ChemicalCargoStatusRepository.readById(
      chemicalCargoToRelease.status_id,
    );

    if (!chemicalCargoStatus) {
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
      return;
    }

    if (chemicalCargoStatus.description === ChemicalCargoStatus.blocked) {
      response.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
      return;
    }

    const releasedCargoStatusId = (
      await ChemicalCargoStatusRepository.readAll()
    ).find(
      (cargoStatus) => cargoStatus.description === ChemicalCargoStatus.released,
    )?.id;

    if (!releasedCargoStatusId) {
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
      return;
    }

    const releasedChemicalCargo = ChemicalCargoRepository.update(
      chemicalCargoToRelease.id,
      { status_id: releasedCargoStatusId },
    );

    response.status(200).json({ data: releasedChemicalCargo });
  } catch (error) {
    console.error(error);

    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default releaseChemicalCargo;
