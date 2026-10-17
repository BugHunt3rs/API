import createChemical from "@/application/handlers/chemicals/createChemical";
import ChemicalRepository from "@/infrastructure/database/repositories/chemical/ChemicalRepository";
import ERROR_MESSAGES from "@/utils/errorsMessages";
import { mockNext, mockRequest, mockResponse } from "../../../helpers/mockHttp";

jest.mock(
  "@/infrastructure/database/repositories/chemical/ChemicalRepository",
  () => ({ __esModule: true, default: { create: jest.fn() } }),
);

const validChemical = {
  name: "Sulfuric Acid",
  description: "Corrosive liquid",
  UN_number: "UN1830",
  status: true,
  risk_class_id: 8,
};

describe("createChemical", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a chemical when the data is valid", async () => {
    const created = { id: 1, ...validChemical };
    jest.mocked(ChemicalRepository.create).mockResolvedValue(created as never);
    const response = mockResponse();

    await createChemical(mockRequest(validChemical), response, mockNext());

    expect(ChemicalRepository.create).toHaveBeenCalledWith(validChemical);
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ data: created });
  });

  it("blocks the creation of a chemical without name", async () => {
    const { name: _name, ...withoutName } = validChemical;
    const response = mockResponse();

    await createChemical(mockRequest(withoutName), response, mockNext());

    expect(ChemicalRepository.create).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.BAD_REQUEST,
    });
  });

  it("blocks the creation of a chemical with a blank name", async () => {
    const response = mockResponse();

    await createChemical(
      mockRequest({ ...validChemical, name: "   " }),
      response,
      mockNext(),
    );

    expect(ChemicalRepository.create).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
  });

  it("blocks the creation of a chemical without risk class", async () => {
    const { risk_class_id: _riskClass, ...withoutRiskClass } = validChemical;
    const response = mockResponse();

    await createChemical(mockRequest(withoutRiskClass), response, mockNext());

    expect(ChemicalRepository.create).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.BAD_REQUEST,
    });
  });
});
