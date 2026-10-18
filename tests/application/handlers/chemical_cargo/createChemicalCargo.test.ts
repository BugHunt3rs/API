import { createChemicalCargo } from "@/application/handlers/chemical_cargo/createChemicalCargo";
import ChemicalRepository from "@/infrastructure/database/repositories/chemical/ChemicalRepository";
import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import { mockRequest, mockResponse } from "../../../helpers/mockHttp";

jest.mock(
  "@/infrastructure/database/repositories/chemical/ChemicalRepository",
  () => ({ __esModule: true, default: { readById: jest.fn() } }),
);
jest.mock(
  "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository",
  () => ({ __esModule: true, default: { create: jest.fn() } }),
);

const validCargo = {
  cargo_code: "CARGO-001",
  chemical_id: 1,
  quantity: 100,
  measure_unity_id: 1,
  origin: "Santos",
  destination: "Rotterdam",
  technical_manager_id: 1,
  required_documentation_id: 1,
  status_id: 1,
  delivery_date: "2026-10-20",
};

const activeChemical = { id: 1, status: true };
const inactiveChemical = { id: 1, status: false };

describe("createChemicalCargo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a cargo for an active chemical", async () => {
    const created = { id: 1, ...validCargo };
    jest
      .mocked(ChemicalRepository.readById)
      .mockResolvedValue(activeChemical as never);
    jest
      .mocked(ChemicalCargoRepository.create)
      .mockResolvedValue(created as never);
    const response = mockResponse();

    await createChemicalCargo(mockRequest(validCargo), response);

    expect(ChemicalRepository.readById).toHaveBeenCalledWith(1);
    expect(ChemicalCargoRepository.create).toHaveBeenCalledWith(validCargo);
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ data: created });
  });

  it("blocks a cargo with an inactive chemical", async () => {
    jest
      .mocked(ChemicalRepository.readById)
      .mockResolvedValue(inactiveChemical as never);
    const response = mockResponse();

    await createChemicalCargo(mockRequest(validCargo), response);

    expect(ChemicalCargoRepository.create).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.BAD_REQUEST,
    });
  });

  it.each([0, -5])("blocks a cargo with quantity %i", async (quantity) => {
    jest
      .mocked(ChemicalRepository.readById)
      .mockResolvedValue(activeChemical as never);
    const response = mockResponse();

    await createChemicalCargo(
      mockRequest({ ...validCargo, quantity }),
      response,
    );

    expect(ChemicalCargoRepository.create).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.BAD_REQUEST,
    });
  });
});
