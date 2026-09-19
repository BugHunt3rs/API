import type { chemical } from "../../../generated/prisma/client";

export type Chemical = chemical;
export type NewChemical = Omit<Chemical, "id" | "create_date" | "update_date">;
