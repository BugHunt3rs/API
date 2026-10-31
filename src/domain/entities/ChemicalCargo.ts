import type { NewEntity } from "../../types/NewEntity";

export type ChemicalCargo = {
  id: number;
  cargo_code: string;
  chemical_id: number;
  quantity: bigint;
  measure_unity_id: number;
  origin: string;
  destination: string;
  technical_manager_id: number;
  required_documentation_id: number;
  documentation_delivered: boolean;
  delivered_documentation_id: number | null;
  status_id: number;
  delivery_date: Date;
  create_date: Date;
  update_date: Date;
};

export type NewChemicalCargo = Omit<
  NewEntity<ChemicalCargo>,
  "documentation_delivered" | "delivered_documentation_id"
>;