import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";

export const CARGO_STATUS_ID = {
  registered: 1,
  underAnalyses: 2,
  underInspection: 3,
  released: 4,
  blocked: 5,
  moving: 6,
  done: 7,
  canceled: 8,
} as const;

const cargoStatuses = [
  { id: 1, description: "Registered" },
  { id: 2, description: "Under Analyses" },
  { id: 3, description: "Under inspection" },
  { id: 4, description: "Released" },
  { id: 5, description: "Blocked" },
  { id: 6, description: "Moving" },
  { id: 7, description: "Done" },
  { id: 8, description: "Canceled" },
];

// The repository must be mocked with jest.mock in the test file.
export function mockCargoStatusRepository() {
  jest
    .mocked(ChemicalCargoStatusRepository.readById)
    .mockImplementation(
      async (id) => (cargoStatuses.find((status) => status.id === id) ?? null) as never,
    );
  jest
    .mocked(ChemicalCargoStatusRepository.readAll)
    .mockResolvedValue(cargoStatuses as never);
}
