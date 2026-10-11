import type { NewChemicalCargo } from "@/domain/entities/ChemicalCargo";
import ChemicalCargoStatus from "@/domain/status/ChemicalCargoStatus";
import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import hasProperties from "@/utils/hasProperty";

export const createChemicalCargo = createHandler(
  async ({ request, response }) => {
    const body: NewChemicalCargo = request.body;

    if (!hasProperties(body, ["chemical_id", "quantity"])) {
      response.status(400).json({ error: ERROR_MESSAGES.BAD_REQUEST });
      return;
    }

    try {
      if (body.quantity <= 0) {
        response.status(400).json({ error: ERROR_MESSAGES.BAD_REQUEST });
        return;
      }

      const chemical = await ChemicalCargoRepository.readById(body.chemical_id);
      if (!chemical) {
        response.status(400).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
        return;
      }

      const chemicalStatus = await ChemicalCargoStatusRepository.readById(
        chemical.status_id,
      );

      if (!chemicalStatus) {
        response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
        return;
      }

      if (chemicalStatus.description === ChemicalCargoStatus.blocked) {
        response.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        return;
      }
      const newChemicalCargo = await ChemicalCargoRepository.create(body);
      response.status(201).json({ data: newChemicalCargo });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
    }
  },
);
