import createMiddleware from "../createMiddleware";

const logger = createMiddleware(async ({ request, next }) => {
  const { url, method } = request;
  const displayingMessage = `${method} - ${url}`;
  console.log(displayingMessage);
  next();
});

export default logger;
