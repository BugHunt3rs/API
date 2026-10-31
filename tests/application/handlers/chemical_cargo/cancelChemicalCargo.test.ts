import cancelChemicalCargo from "@/application/handlers/chemical_cargo/cancelChemicalCargo";
import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import {
  CARGO_STATUS_ID,
  mockCargoStatusRepository,
} from "../../../helpers/cargoStatus";
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

function cargoWith(status_id: number) {
  return { id: 1, status_id, delivered_documentation_id: null } as never;
}

describe("cancelChemicalCargo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCargoStatusRepository();
  });

  it.each<[string, number]>([
    ["Registered", CARGO_STATUS_ID.registered],
    ["Under Analyses", CARGO_STATUS_ID.underAnalyses],
    ["Under inspection", CARGO_STATUS_ID.underInspection],
    ["Released", CARGO_STATUS_ID.released],
    ["Blocked", CARGO_STATUS_ID.blocked],
  ])("cancels a cargo that is %s", async (_name, status_id) => {
    const canceled = { id: 1, status_id: CARGO_STATUS_ID.canceled };
    jest
      .mocked(ChemicalCargoRepository.readById)
      .mockResolvedValue(cargoWith(status_id));
    jest
      .mocked(ChemicalCargoRepository.update)
      .mockResolvedValue(canceled as never);
    const response = mockResponse();

    await cancelChemicalCargo(mockRequest({}, { id: "1" }), response);

    expect(ChemicalCargoRepository.update).toHaveBeenCalledWith(1, {
      status_id: CARGO_STATUS_ID.canceled,
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ data: canceled });
  });

  it.each<[string, number, string]>([
    ["Canceled", CARGO_STATUS_ID.canceled, "Cargo status is canceled"],
    ["Moving", CARGO_STATUS_ID.moving, "Status transition not allowed"],
    ["Done", CARGO_STATUS_ID.done, "Status transition not allowed"],
  ])(
    "refuses to cancel a cargo that is %s",
    async (_name, status_id, reason) => {
      jest
        .mocked(ChemicalCargoRepository.readById)
        .mockResolvedValue(cargoWith(status_id));
      const response = mockResponse();

      await cancelChemicalCargo(mockRequest({}, { id: "1" }), response);

      expect(ChemicalCargoRepository.update).not.toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(409);
      expect(response.json).toHaveBeenCalledWith({
        error: `${ERROR_MESSAGES.INVALID_STATUS_TRANSITION} - ["${reason}"]`,
      });
    },
  );

  it("returns 404 when the cargo does not exist", async () => {
    jest.mocked(ChemicalCargoRepository.readById).mockResolvedValue(null);
    const response = mockResponse();

    await cancelChemicalCargo(mockRequest({}, { id: "99" }), response);

    expect(ChemicalCargoRepository.update).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.NOT_FOUND,
    });
  });

  it("returns 400 for an invalid id", async () => {
    const response = mockResponse();

    await cancelChemicalCargo(mockRequest({}, { id: "abc" }), response);

    expect(ChemicalCargoRepository.readById).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.INVALID_ID,
    });
  });
});
