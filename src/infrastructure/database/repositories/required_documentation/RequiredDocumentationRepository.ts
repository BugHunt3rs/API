import type IRequiredDocumentationRepository from "@/domain/repositories/IRequiredDocumentationRepository";
import { prisma } from "../../prismaClient";

const RequiredDocumentationRepository: IRequiredDocumentationRepository = {
  readById: async (id) => {
    const requiredDocumentation = await prisma.required_documentation.findFirst(
      { where: { id } },
    );

    return requiredDocumentation;
  },
};

export default RequiredDocumentationRepository;
