import releaseChemicalCargo from "@/application/handlers/chemical_cargo/releaseChemicalCargo";
import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import { CARGO_STATUS_ID, mockCargoStatusRepository } from "../../../helpers/cargoStatus";
import { mockRequest, mockResponse } from "../../../helpers/mockHttp";

jest.mock(
  "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository",
  () => ({
    __esModule: true,
    default: { readById: jest.fn(), update: jest.fn() },
  }),
);
jest.mock(
  "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository",
  () => ({
    __esModule: true,
    default: { readById: jest.fn(), readAll: jest.fn() },
  }),
);

const inspectedCargo = {
  id: 1,
  status_id: CARGO_STATUS_ID.underInspection,
  delivered_documentation_id: null,
};

describe("releaseChemicalCargo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCargoStatusRepository();
  });

  it("blocks the release of a cargo without delivered documentation", async () => {
    jest
      .mocked(ChemicalCargoRepository.readById)
      .mockResolvedValue(inspectedCargo as never);
    const response = mockResponse();

    await releaseChemicalCargo(mockRequest({}, { id: "1" }), response);

    expect(ChemicalCargoRepository.update).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      error: `${ERROR_MESSAGES.INVALID_STATUS_TRANSITION} - ["Documentation not delivered"]`,
    });
  });

  it("releases a cargo that has delivered documentation", async () => {
    const released = {
      ...inspectedCargo,
      delivered_documentation_id: 2,
      status_id: CARGO_STATUS_ID.released,
    };
    jest
      .mocked(ChemicalCargoRepository.readById)
      .mockResolvedValue({ ...inspectedCargo, delivered_documentation_id: 2 } as never);
    jest
      .mocked(ChemicalCargoRepository.update)
      .mockResolvedValue(released as never);
    const response = mockResponse();

    await releaseChemicalCargo(mockRequest({}, { id: "1" }), response);

    expect(ChemicalCargoRepository.update).toHaveBeenCalledWith(1, {
      status_id: CARGO_STATUS_ID.released,
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ data: released });
  });

  it("rejects releasing a blocked cargo", async () => {
    jest.mocked(ChemicalCargoRepository.readById).mockResolvedValue({
      ...inspectedCargo,
      delivered_documentation_id: 2,
      status_id: CARGO_STATUS_ID.blocked,
    } as never);
    const response = mockResponse();

    await releaseChemicalCargo(mockRequest({}, { id: "1" }), response);

    expect(ChemicalCargoRepository.update).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      error: `${ERROR_MESSAGES.INVALID_STATUS_TRANSITION} - ["Cargo status is blocked"]`,
    });
  });

  it("returns 404 when the cargo does not exist", async () => {
    jest.mocked(ChemicalCargoRepository.readById).mockResolvedValue(null);
    const response = mockResponse();

    await releaseChemicalCargo(mockRequest({}, { id: "99" }), response);

    expect(ChemicalCargoStatusRepository.readById).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.NOT_FOUND,
    });
  });

  it("returns 400 for an invalid id", async () => {
    const response = mockResponse();

    await releaseChemicalCargo(mockRequest({}, { id: "abc" }), response);

    expect(ChemicalCargoRepository.readById).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.INVALID_ID,
    });
  });
});
