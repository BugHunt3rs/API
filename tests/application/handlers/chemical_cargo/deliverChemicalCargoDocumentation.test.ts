import deliverChemicalCargoDocumentation from "@/application/handlers/chemical_cargo/deliverChemicalCargoDocumentation";
import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import { mockRequest, mockResponse } from "../../../helpers/mockHttp";

jest.mock(
  "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository",
  () => ({
    __esModule: true,
    default: { readById: jest.fn(), update: jest.fn() },
  }),
);

const pendingCargo = { id: 1, documentation_delivered: false };

describe("deliverChemicalCargoDocumentation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("marks the documentation as delivered", async () => {
    const delivered = { ...pendingCargo, documentation_delivered: true };
    jest
      .mocked(ChemicalCargoRepository.readById)
      .mockResolvedValue(pendingCargo as never);
    jest
      .mocked(ChemicalCargoRepository.update)
      .mockResolvedValue(delivered as never);
    const response = mockResponse();

    await deliverChemicalCargoDocumentation(
      mockRequest({}, { id: "1" }),
      response,
    );

    expect(ChemicalCargoRepository.update).toHaveBeenCalledWith(1, {
      documentation_delivered: true,
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ data: delivered });
  });

  it("returns 400 for an invalid id", async () => {
    const response = mockResponse();

    await deliverChemicalCargoDocumentation(
      mockRequest({}, { id: "abc" }),
      response,
    );

    expect(ChemicalCargoRepository.update).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.INVALID_ID,
    });
  });

  it("returns 404 when the cargo does not exist", async () => {
    jest.mocked(ChemicalCargoRepository.readById).mockResolvedValue(null);
    const response = mockResponse();

    await deliverChemicalCargoDocumentation(
      mockRequest({}, { id: "99" }),
      response,
    );

    expect(ChemicalCargoRepository.update).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.NOT_FOUND,
    });
  });
});
