export type NewEntity<T> = Omit<T, "id" | "create_date" | "update_date">;
