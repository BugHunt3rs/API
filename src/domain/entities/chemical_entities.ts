import { chemicalModel } from "../../../infrastructure/database/orm/prisma/generated/prisma/models";

export type NewChemical = Omit<chemicalModel, "id">;