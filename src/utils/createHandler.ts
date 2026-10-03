import type { Request, Response } from "express";

export default function createHandler(
  handlerFunc: ({
    request,
    response,
  }: {
    request: Request;
    response: Response;
  }) => Promise<void>,
) {
  return (request: Request, response: Response) =>
    handlerFunc({ request, response });
}
