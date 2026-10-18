import type { NewChemical } from "@/domain/entities/Chemical";
import ChemicalRepository from "@/infrastructure/database/repositories/chemical/ChemicalRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const updateChemical = createHandler(async ({ request, response }) => {
  const { id } = request.params;

  if (!id || Array.isArray(id) || isNaN(+id) || !Number.isInteger(+id)) {
    response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    return;
  }

  const {
    name,
    description,
    UN_number,
    risk_class_id,
    status,
  }: Partial<NewChemical> = request.body;

  try {
    const chemicalToUpdate = await ChemicalRepository.readById(+id);

    if (!chemicalToUpdate) {
      response.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      return;
    }

    const updatedChemical = await ChemicalRepository.update(+id, {
      name,
      description,
      UN_number,
      risk_class_id,
      status,
    });

    response.status(200).json({ data: updatedChemical });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default updateChemical;
