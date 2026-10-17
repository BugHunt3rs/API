import type IChemicalCargoStatusReposiory from "@/domain/repositories/IChemicalCargoStatusRepository";
import { prisma } from "../../prismaClient";

const ChemicalCargoStatusRepository: IChemicalCargoStatusReposiory = {
  create: async (newChemicalCargoStatusData) => {
    const { description } = newChemicalCargoStatusData;

    const newChemicalCargoStatus = await prisma.cargo_status.create({
      data: { description },
    });

    return newChemicalCargoStatus;
  },

  readAll: async () => {
    const chemicalCargosStatus = await prisma.cargo_status.findMany();

    return chemicalCargosStatus;
  },

  readById: async (id) => {
    const chemicalCargoStatus = await prisma.cargo_status.findFirst({
      where: { id },
    });
    return chemicalCargoStatus;
  },

  update: async (id, newChemicalCargoStatusData) => {
    const { description } = newChemicalCargoStatusData;

    const updatedChemicalCargoStatusData = await prisma.cargo_status.update({
      where: { id },
      data: { description },
    });

    return updatedChemicalCargoStatusData;
  },

  delete: async (id) => {
    const deletedChemicalCargo = await prisma.cargo_status.delete({
      where: { id },
    });

    return deletedChemicalCargo;
  },
};

export default ChemicalCargoStatusRepository;
