import type { NewEntity } from "@/types/NewEntity";

export type ChemicalCargoStatus = {
  id: number;
  description: string;
  create_date: Date;
};

export type NewChemicalCargoStatus = NewEntity<ChemicalCargoStatus>;
