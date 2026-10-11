import type {
  ChemicalCargoStatus,
  NewChemicalCargoStatus,
} from "../entities/ChemicalCargoStatus";
import type IRepository from "./IRepository";

export default interface IChemicalCargoStatusReposiory extends IRepository<
  ChemicalCargoStatus,
  NewChemicalCargoStatus
> { }
