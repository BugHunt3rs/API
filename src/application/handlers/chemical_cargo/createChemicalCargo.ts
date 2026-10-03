import type { NewChemicalCargo } from "@/domain/entities/ChemicalCargo";
import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import hasProperties from "@/utils/hasProperty";

export const createChemicalCargo = createHandler(
  async ({ request, response }) => {
    const body: NewChemicalCargo = request.body;

    if (!hasProperties(body, ["chemical_id"])) {
      response.status(400).json({ error: ERROR_MESSAGES.BAD_REQUEST });
      return;
    }

    try {
      const newChemicalCargo = await ChemicalCargoRepository.create(body);
      response.status(201).json({ data: newChemicalCargo });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
    }
  },
);
