import type {
  ChemicalCargo,
  NewChemicalCargo,
} from "../entities/ChemicalCargo";
import type IRepository from "./IRepository";

export default interface IChemicalCargoRepository extends IRepository<
  ChemicalCargo,
  NewChemicalCargo
> {}
