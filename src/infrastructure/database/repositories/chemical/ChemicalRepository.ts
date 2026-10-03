import { prisma } from "../../prismaClient";
import type IChemicalRepository from "../../../../domain/repositories/IChemicalRepository";

const ChemicalRepository: IChemicalRepository = {
  create: async (newChemicalData) => {
    const { name, description, UN_number, status, risk_class_id } =
      newChemicalData;

    const newChemical = await prisma.chemical.create({
      data: {
        name,
        description,
        UN_number,
        status,
        risk_class_id,
      },
    });

    return newChemical;
  },

  readAll: async () => {
    const chemicals = await prisma.chemical.findMany();

    return chemicals;
  },

  readById: async (id) => {
    const chemical = await prisma.chemical.findFirst({ where: { id } });

    return chemical;
  },

  update: async (id, newData) => {
    if (!id || isNaN(+id)) {
      throw new Error("Invalid ID");
    }

    const { name, description, UN_number, risk_class_id, status } = newData;

    const updatedChemical = await prisma.chemical.update({
      where: { id: +id },
      data: {
        name,
        description,
        UN_number,
        risk_class_id,
        status,
        update_date: new Date(),
      },
    });

    return updatedChemical;
  },

  delete: async (id) => {
    const chemicalToDelete = await prisma.chemical.findFirst({ where: { id } });

    if (!chemicalToDelete) {
      throw new Error("Not found");
    }

    const deletedChemical = await prisma.chemical.delete({ where: { id } });

    return deletedChemical;
  },
};

export default ChemicalRepository;
