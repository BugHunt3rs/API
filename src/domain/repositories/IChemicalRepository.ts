import type { Chemical, NewChemical } from "../entities/Chemical";

export default interface IChemicalRepository {
  create: (chemical: NewChemical) => Promise<Chemical>;
  readAll: () => Promise<Chemical[]>;
  readById: (id: number) => Promise<Chemical | null>;
  update: (id: number, newData: Partial<NewChemical>) => Promise<Chemical | null>;
  delete: (id: number) => Promise<Chemical | null>;
}
