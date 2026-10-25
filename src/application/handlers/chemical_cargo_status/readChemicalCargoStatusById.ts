import { prisma } from "@/infrastructure/database/prismaClient";
import logger from "@/infrastructure/logger/logger";
import createHandler from "@/utils/createHandler";
import ERROR_MESSAGES from "@/utils/errorsMessages";

const readChemicalCargoStatusById = createHandler(
  async ({ request, response }) => {
    const { id } = request.params;

    if (!id || Array.isArray(id) || isNaN(+id) || !Number.isInteger(+id)) {
      logger.error(request, ERROR_MESSAGES.INVALID_ID)
      response.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
      return;
    }

    try {
      const chemicalCargoStatus = await prisma.cargo_status.findFirst({
        where: { id: +id },
      });

      response.json({ data: chemicalCargoStatus });
    } catch (err) {
      logger.error(request, `${ERROR_MESSAGES.UNEXPECTED_ERROR} - ${err}`)
      response.status(500).json({ error: ERROR_MESSAGES.UNEXPECTED_ERROR });
    }
  },
);

export default readChemicalCargoStatusById;
