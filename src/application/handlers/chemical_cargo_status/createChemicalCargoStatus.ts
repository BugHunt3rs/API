import type { NewChemicalCargoStatus } from "@/domain/entities/ChemicalCargoStatus";
import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import hasProperties from "@/utils/hasProperty";

const createChemicalCargoStatus = createHandler(
  async ({ request, response }) => {
    const body: NewChemicalCargoStatus = request.body;

    if (!hasProperties(body, ["description"])) {
      response.status(400).json({ error: ERROR_MESSAGES.BAD_REQUEST });
      return;
    }

    try {
      const newChemicalCargoStatus =
        await ChemicalCargoStatusRepository.create(body);

      response.json({ data: newChemicalCargoStatus });
    } catch (err) {
      console.error(err);
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
    }
  },
);

export default createChemicalCargoStatus;
