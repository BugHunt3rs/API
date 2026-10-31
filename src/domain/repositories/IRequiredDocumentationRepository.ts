import type { RequiredDocumentation } from "../entities/RequiredDocumentation";

export default interface IRequiredDocumentationRepository {
  readById: (id: number) => Promise<RequiredDocumentation | null>;
}
