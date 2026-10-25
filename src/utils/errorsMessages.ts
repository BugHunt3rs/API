const ERROR_MESSAGES = {
  INVALID_ID: "Invalid ID",
  NOT_FOUND: "Not Found",
  UNEXPECTED_ERROR: "Unexpected Error",
  BAD_REQUEST: "Bad Request",
  FORBIDDEN: "Forbidden",
  INVALID_STATUS_TRANSITION: "Invalid status transition",
  INVALID_STATUS_KEY: "Status is not valid",
} as const;

export default ERROR_MESSAGES;
