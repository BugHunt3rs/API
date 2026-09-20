import type { Chemical, NewChemical } from "../entities/Chemical";
import type IRepository from "./IRepository";

export default interface IChemicalRepository extends IRepository<
  Chemical,
  NewChemical
> {}
