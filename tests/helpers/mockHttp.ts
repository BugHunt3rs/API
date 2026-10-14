import type { NextFunction, Request, Response } from "express";

export function mockRequest(body: unknown = {}, params: object = {}) {
  return { body, params } as unknown as Request;
}

export function mockResponse() {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };
  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);

  return response as typeof response & Response;
}

export const mockNext = () =>
  jest.fn() as unknown as NextFunction & ReturnType<typeof jest.fn>;
