import type { Chemical } from "../../../../domain/entities/Chemical";

export default interface IChemicalRepository {
  create: (chemical: Chemical) => Promise<Chemical>;
  readAll: () => Promise<Chemical[]>;
  readById: (id: number) => Promise<Chemical | null>;
  update: (id: number) => Promise<Chemical | null>;
  delete: (id: number) => Promise<Chemical | null>;
}
