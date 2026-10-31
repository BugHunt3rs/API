import deliverChemicalCargoDocumentation from "@/application/handlers/chemical_cargo/deliverChemicalCargoDocumentation";
import ChemicalCargoRepository from "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository";
import RequiredDocumentationRepository from "@/infrastructure/database/repositories/required_documentation/RequiredDocumentationRepository";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import { mockRequest, mockResponse } from "../../../helpers/mockHttp";

jest.mock(
  "@/infrastructure/database/repositories/chemical_cargo/ChemicalCargoRepository",
  () => ({
    __esModule: true,
    default: { readById: jest.fn(), update: jest.fn() },
  }),
);
jest.mock(
  "@/infrastructure/database/repositories/required_documentation/RequiredDocumentationRepository",
  () => ({ __esModule: true, default: { readById: jest.fn() } }),
);

const pendingCargo = { id: 1, delivered_documentation_id: null };
const documentation = { id: 2, description: "Safety data sheet" };

describe("deliverChemicalCargoDocumentation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("marks the documentation as delivered", async () => {
    const delivered = { ...pendingCargo, delivered_documentation_id: 2 };
    jest
      .mocked(ChemicalCargoRepository.readById)
      .mockResolvedValue(pendingCargo as never);
    jest
      .mocked(RequiredDocumentationRepository.readById)
      .mockResolvedValue(documentation as never);
    jest
      .mocked(ChemicalCargoRepository.update)
      .mockResolvedValue(delivered as never);
    const response = mockResponse();

    await deliverChemicalCargoDocumentation(
      mockRequest({ documentation_id: 2 }, { id: "1" }),
      response,
    );

    expect(ChemicalCargoRepository.update).toHaveBeenCalledWith(1, {
      delivered_documentation_id: 2,
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ data: delivered });
  });

  it("returns 400 for an invalid id", async () => {
    const response = mockResponse();

    await deliverChemicalCargoDocumentation(
      mockRequest({ documentation_id: 2 }, { id: "abc" }),
      response,
    );

    expect(ChemicalCargoRepository.update).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.INVALID_ID,
    });
  });

  it.each([{}, { documentation_id: "2" }, { documentation_id: null }])(
    "returns 400 when the documentation id is missing or not a number (%o)",
    async (body) => {
      const response = mockResponse();

      await deliverChemicalCargoDocumentation(
        mockRequest(body, { id: "1" }),
        response,
      );

      expect(ChemicalCargoRepository.update).not.toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.BAD_REQUEST,
      });
    },
  );

  it("returns 404 when the cargo does not exist", async () => {
    jest.mocked(ChemicalCargoRepository.readById).mockResolvedValue(null);
    const response = mockResponse();

    await deliverChemicalCargoDocumentation(
      mockRequest({ documentation_id: 2 }, { id: "99" }),
      response,
    );

    expect(ChemicalCargoRepository.update).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.NOT_FOUND,
    });
  });

  it("returns 404 and does not update when the documentation does not exist", async () => {
    jest
      .mocked(ChemicalCargoRepository.readById)
      .mockResolvedValue(pendingCargo as never);
    jest.mocked(RequiredDocumentationRepository.readById).mockResolvedValue(null);
    const response = mockResponse();

    await deliverChemicalCargoDocumentation(
      mockRequest({ documentation_id: 99 }, { id: "1" }),
      response,
    );

    expect(ChemicalCargoRepository.update).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.NOT_FOUND,
    });
  });
});
