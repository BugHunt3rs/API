import type { NewChemicalCargo } from "@/domain/entities/ChemicalCargo";
import ChemicalRepository from "@/infrastructure/database/repositories/chemical/ChemicalRepository";
import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import logger from "@/infrastructure/logger/logger";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import hasProperties from "@/utils/hasProperty";

export const createChemicalCargo = createHandler(
  async ({ request, response }) => {
    const body: NewChemicalCargo = request.body;

    if (
      !hasProperties(body, ["chemical_id", "quantity", "technical_manager_id"]) || body.quantity <= 0
    ) {
      logger.error(request, ERROR_MESSAGES.BAD_REQUEST)
      response.status(400).json({ error: ERROR_MESSAGES.BAD_REQUEST });
      return;
    }

    try {
      const chemical = await ChemicalRepository.readById(body.chemical_id);

      if (!chemical || !chemical.status) {
        logger.error(request, ERROR_MESSAGES.BAD_REQUEST)
        response.status(400).json({ error: ERROR_MESSAGES.BAD_REQUEST });
        return;
      }

      const newChemicalCargo = await ChemicalCargoRepository.create(body);
      logger.create(request, newChemicalCargo)
      response.status(201).json({ data: newChemicalCargo });
    } catch (error) {
      logger.error(request, ERROR_MESSAGES.UNEXPECTED_ERROR)
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
    }
  },
);
