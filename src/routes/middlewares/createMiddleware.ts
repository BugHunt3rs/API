import type { Request, Response, NextFunction } from "express";

type MiddlewareFunctionArgs = {
  request: Request;
  response: Response;
  next: NextFunction;
};

export default function createMiddleware(
  middlewareHandlerFunc: (middlewareArgs: MiddlewareFunctionArgs) => void,
) {
  return (request: Request, response: Response, next: NextFunction) => {
    middlewareHandlerFunc({ request, response, next });
  };
}
