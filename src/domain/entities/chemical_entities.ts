import { chemicalModel } from "../../../infrastructure/database/orm/prisma/generated/prisma/models";

export type NewChemical = Omit<chemicalModel, "id" | "create_date" | "update_date">;