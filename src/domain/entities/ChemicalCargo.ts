import type { NewEntity } from "../../utils/NewEntity";

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
  status: number;
  delivery_date: Date;
  create_date: Date;
  update_date: Date;
};

export type NewChemicalCargo = NewEntity<ChemicalCargo>;
