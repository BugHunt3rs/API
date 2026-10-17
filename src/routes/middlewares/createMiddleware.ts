import type { Request, Response, NextFunction } from "express";

type MiddlewareFunctionArgs = {
  request: Request;
  response: Response;
  next: NextFunction;
};

export default function createMiddleware(
  middlewareHandlerFunc: (
    middlewareArgs: MiddlewareFunctionArgs,
  ) => Promise<any>,
) {
  return (middlewareArgs: MiddlewareFunctionArgs) =>
    middlewareHandlerFunc(middlewareArgs);
}
