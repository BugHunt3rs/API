import createMiddleware from "../createMiddleware";

const logger = createMiddleware(async ({ request, response, next }) => {
  console.log(request, response);
  next();
});

export default logger;
