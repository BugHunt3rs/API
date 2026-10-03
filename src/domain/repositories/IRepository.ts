export default interface IRepository<T, NewT> {
  create: (chemical: NewT) => Promise<T>;
  readAll: () => Promise<T[]>;
  readById: (id: number) => Promise<T | null>;
  update: (
    id: number,
    newData: Partial<Omit<T, "id" | "create_date">>,
  ) => Promise<T>;
  delete: (id: number) => Promise<T>;
}
