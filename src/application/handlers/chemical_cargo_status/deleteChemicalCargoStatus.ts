import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const deleteChemicalCargoStats = createHandler(
  async ({ request, response }) => {
    const { id } = request.params;

    if (!id || Array.isArray(id) || isNaN(+id) || !Number.isInteger(+id)) {
      response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
      return;
    }

    try {
      const deletedChemicalCargoStatus =
        await ChemicalCargoStatusRepository.delete(+id);
      response.json({ data: deletedChemicalCargoStatus });
    } catch (err) {
      console.error(err);
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
    }
  },
);

export default deleteChemicalCargoStats;
