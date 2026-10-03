import type { NewChemicalCargo } from "@/domain/entities/ChemicalCargo";
import ChemicalRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

export const createChemicalCargo = createHandler(
  async ({ request, response }) => {
    const body: NewChemicalCargo = request.body;
    // Todo - VALIDADE REQUEST BODY
    

    try {
      const newChemicalCargo = await ChemicalRepository.create(body);
      response.status(201).json({ data: newChemicalCargo });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
    }
  },
);
