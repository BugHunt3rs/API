import updateChemicalCargoStatus from "@/application/handlers/chemical_cargo/updateChemicalCargoStatus";
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

function cargoWith(
  status_id: number,
  delivered_documentation_id: number | null = null,
) {
  return { id: 1, status_id, delivered_documentation_id } as never;
}

describe("updateChemicalCargoStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCargoStatusRepository();
  });

  it.each<[string, number, number, number | null]>([
    [
      "Registered -> Under Analyses",
      CARGO_STATUS_ID.registered,
      CARGO_STATUS_ID.underAnalyses,
      null,
    ],
    [
      "Under Analyses -> Under inspection with documentation",
      CARGO_STATUS_ID.underAnalyses,
      CARGO_STATUS_ID.underInspection,
      2,
    ],
    [
      "Released -> Moving",
      CARGO_STATUS_ID.released,
      CARGO_STATUS_ID.moving,
      null,
    ],
    ["Moving -> Done", CARGO_STATUS_ID.moving, CARGO_STATUS_ID.done, null],
  ])(
    "updates the status on an allowed transition: %s",
    async (_name, from, to, documentation) => {
      const updated = { id: 1, status_id: to };
      jest
        .mocked(ChemicalCargoRepository.readById)
        .mockResolvedValue(cargoWith(from, documentation));
      jest
        .mocked(ChemicalCargoRepository.update)
        .mockResolvedValue(updated as never);
      const response = mockResponse();

      await updateChemicalCargoStatus(
        mockRequest({ status_id: to }, { id: "1" }),
        response,
      );

      expect(ChemicalCargoRepository.update).toHaveBeenCalledWith(1, {
        status_id: to,
      });
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({ data: updated });
    },
  );

  it.each<[string, number, number, string]>([
    [
      "Registered -> Done",
      CARGO_STATUS_ID.registered,
      CARGO_STATUS_ID.done,
      "Status transition not allowed",
    ],
    [
      "Released -> Registered",
      CARGO_STATUS_ID.released,
      CARGO_STATUS_ID.registered,
      "Status transition not allowed",
    ],
    [
      "Done -> Moving",
      CARGO_STATUS_ID.done,
      CARGO_STATUS_ID.moving,
      "Status transition not allowed",
    ],
    [
      "Canceled -> Released",
      CARGO_STATUS_ID.canceled,
      CARGO_STATUS_ID.released,
      "Cargo status is canceled",
    ],
  ])("blocks a forbidden transition: %s", async (_name, from, to, reason) => {
    jest
      .mocked(ChemicalCargoRepository.readById)
      .mockResolvedValue(cargoWith(from, 2));
    const response = mockResponse();

    await updateChemicalCargoStatus(
      mockRequest({ status_id: to }, { id: "1" }),
      response,
    );

    expect(ChemicalCargoRepository.update).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      error: `${ERROR_MESSAGES.INVALID_STATUS_TRANSITION} - ["${reason}"]`,
    });
  });

  it("rejects moving a blocked cargo", async () => {
    jest
      .mocked(ChemicalCargoRepository.readById)
      .mockResolvedValue(cargoWith(CARGO_STATUS_ID.blocked, 2));
    const response = mockResponse();

    await updateChemicalCargoStatus(
      mockRequest({ status_id: CARGO_STATUS_ID.moving }, { id: "1" }),
      response,
    );

    expect(ChemicalCargoRepository.update).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      error: `${ERROR_MESSAGES.INVALID_STATUS_TRANSITION} - ["Cargo status is blocked"]`,
    });
  });

  it("blocks Under Analyses -> Under inspection without delivered documentation", async () => {
    jest
      .mocked(ChemicalCargoRepository.readById)
      .mockResolvedValue(cargoWith(CARGO_STATUS_ID.underAnalyses));
    const response = mockResponse();

    await updateChemicalCargoStatus(
      mockRequest({ status_id: CARGO_STATUS_ID.underInspection }, { id: "1" }),
      response,
    );

    expect(ChemicalCargoRepository.update).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      error: `${ERROR_MESSAGES.INVALID_STATUS_TRANSITION} - ["Documentation not delivered"]`,
    });
  });

  it("returns 400 when the new status does not exist", async () => {
    jest
      .mocked(ChemicalCargoRepository.readById)
      .mockResolvedValue(cargoWith(CARGO_STATUS_ID.registered));
    const response = mockResponse();

    await updateChemicalCargoStatus(
      mockRequest({ status_id: 99 }, { id: "1" }),
      response,
    );

    expect(ChemicalCargoRepository.update).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.BAD_REQUEST,
    });
  });

  it.each([{}, { status_id: "2" }, { status_id: null }])(
    "returns 400 when status_id is missing or not a number (%o)",
    async (body) => {
      const response = mockResponse();

      await updateChemicalCargoStatus(mockRequest(body, { id: "1" }), response);

      expect(ChemicalCargoRepository.readById).not.toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.BAD_REQUEST,
      });
    },
  );

  it("returns 404 when the cargo does not exist", async () => {
    jest.mocked(ChemicalCargoRepository.readById).mockResolvedValue(null);
    const response = mockResponse();

    await updateChemicalCargoStatus(
      mockRequest({ status_id: CARGO_STATUS_ID.underAnalyses }, { id: "99" }),
      response,
    );

    expect(ChemicalCargoRepository.update).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.NOT_FOUND,
    });
  });

  it("returns 400 for an invalid id", async () => {
    const response = mockResponse();

    await updateChemicalCargoStatus(
      mockRequest({ status_id: CARGO_STATUS_ID.underAnalyses }, { id: "abc" }),
      response,
    );

    expect(ChemicalCargoRepository.readById).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.INVALID_ID,
    });
  });
});
