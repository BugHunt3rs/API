import type { NewChemical } from "@/domain/entities/Chemical";
import ChemicalRepository from "@/infrastructure/database/repositories/chemical/ChemicalRepository";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const createChemical = createHandler(async ({ request, response }) => {
  const { name, description, UN_number, status, risk_class_id }: NewChemical =
    request.body;

  if (typeof name !== "string" || !name.trim() || !risk_class_id) {
    response.status(400).json({ error: ERROR_MESSAGES.BAD_REQUEST });
    return;
  }

  try {
    const newChemical = await ChemicalRepository.create({
      name,
      description,
      UN_number,
      status,
      risk_class_id,
    });

    response.status(201).json({ data: newChemical });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
  }
});

export default createChemical;
