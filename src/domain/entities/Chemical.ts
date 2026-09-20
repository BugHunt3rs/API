export type Chemical = {
  id: number;
  name: string;
  description: string;
  UN_number: string;
  risk_class_id: number;
  status: boolean;
  create_date: Date;
  update_date: Date;
};

export type NewChemical = Omit<Chemical, "id" | "create_date" | "update_date">;
