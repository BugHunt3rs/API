import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import RequiredDocumentationRepository from "@/infrastructure/database/repositories/required_documentation/RequiredDocumentationRepository";
import logger from "@/infrastructure/logger/logger";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const deliverChemicalCargoDocumentation = createHandler(
  async ({ request, response }) => {
    const { id } = request.params;
    const { documentation_id } = request.body ?? {};

    if (!id || isNaN(+id) || Array.isArray(id) || !Number.isInteger(+id)) {
      logger.error(request, ERROR_MESSAGES.INVALID_ID);
      response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
      return;
    }

    if (!Number.isInteger(documentation_id)) {
      logger.error(request, ERROR_MESSAGES.BAD_REQUEST);
      response.status(400).json({ error: ERROR_MESSAGES.BAD_REQUEST });
      return;
    }

    try {
      const chemicalCargo = await ChemicalCargoRepository.readById(+id);

      if (!chemicalCargo) {
        logger.error(request, ERROR_MESSAGES.NOT_FOUND);
        response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
        return;
      }

      const documentation =
        await RequiredDocumentationRepository.readById(documentation_id);

      if (!documentation) {
        logger.error(request, ERROR_MESSAGES.NOT_FOUND);
        response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
        return;
      }

      const updatedChemicalCargo = await ChemicalCargoRepository.update(
        chemicalCargo.id,
        { delivered_documentation_id: documentation.id },
      );

      logger.update(request, chemicalCargo, updatedChemicalCargo);
      response.status(200).json({ data: updatedChemicalCargo });
    } catch (error) {
      logger.error(request, ERROR_MESSAGES.UNEXPECTED_ERROR);
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
    }
  },
);

export default deliverChemicalCargoDocumentation;
