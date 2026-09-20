import type IChemicalCargoRepository from "../../../../domain/repositories/IChemicalCargoRepository";
import { prisma } from "../../prismaClient";

const ChemicalRepository: IChemicalCargoRepository = {
  create: async (newChemicalCargoData) => {
    const {
      cargo_code,
      chemical_id,
      delivery_date,
      destination,
      measure_unity_id,
      origin,
      quantity,
      required_documentation_id,
      status,
      technical_manager_id,
    } = newChemicalCargoData;

    const newChemicalCargo = await prisma.chemical_cargo.create({
      data: {
        cargo_code,
        chemical_id,
        delivery_date,
        destination,
        measure_unity_id,
        origin,
        quantity,
        required_documentation_id,
        status,
        technical_manager_id,
      },
    });

    return newChemicalCargo;
  },

  readAll: async () => {
    const chemicalCargos = await prisma.chemical_cargo.findMany();

    return chemicalCargos;
  },

  readById: async (id) => {
    const chemicalCargo = await prisma.chemical_cargo.findFirst({
      where: { id },
    });

    return chemicalCargo;
  },
  update: async (id, newData) => {
    const {
      cargo_code,
      chemical_id,
      delivery_date,
      destination,
      measure_unity_id,
      origin,
      quantity,
      required_documentation_id,
      status,
      technical_manager_id,
    } = newData;
    const updatedChemicalCargo = await prisma.chemical_cargo.update({
      where: { id },
      data: {
        cargo_code,
        chemical_id,
        delivery_date,
        destination,
        measure_unity_id,
        origin,
        quantity,
        required_documentation_id,
        status,
        technical_manager_id,
      },
    });

    return updatedChemicalCargo;
  },

  delete: async (id) => {
    const deletedChemical = await prisma.chemical_cargo.delete({
      where: { id },
    });

    return deletedChemical;
  },
};

export default ChemicalRepository;
