import ERROR_MESSAGES from "@/utils/errorsMessages";
const LOG_TYPE = {
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
  CREATE: "CREATE",
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
} as const;

type LoggerArgs = {
  logType: keyof typeof LOG_TYPE;
  newValue: Object | null;
  oldValue: Object | null;
  error?: keyof typeof ERROR_MESSAGES;
  info?: string;
  warning?: string;
};

export default function logger({
  logType,
  newValue,
  oldValue,
  error,
  info,
  warning,
}: LoggerArgs) {
  newValue = JSON.stringify(newValue, null, 2);
  oldValue = JSON.stringify(oldValue, null, 2);

  switch (logType) {
    case LOG_TYPE.CREATE:
      console.log(`${LOG_TYPE.CREATE} - ${newValue}`);
      break;
    case LOG_TYPE.READ:
      console.log(`${LOG_TYPE.READ}`);
      break;
    case LOG_TYPE.UPDATE:
      console.log(`${LOG_TYPE.UPDATE} - ${oldValue} -> ${newValue}`);
      break;
    case LOG_TYPE.DELETE:
      console.log(`${LOG_TYPE.DELETE} - ${oldValue}`);
      break;
    case LOG_TYPE.INFO:
      console.info(`${info}`);
      break;
    case LOG_TYPE.WARNING:
      console.info(`${warning}`);
      break;
    case LOG_TYPE.ERROR:
      console.error(`${error}`);
      break;
  }
}
