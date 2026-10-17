import ERROR_MESSAGES from "@/utils/errorsMessages";
import fileSystem from "node:fs";
import path from "node:path";
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

const LOG_DIRECTORY_PATH = path.resolve(process.cwd(), "logs");

function createDirectorySync(directoryPath: string) {
  fileSystem.mkdirSync(directoryPath, { recursive: true });
}

function createFile(fileName: string, fileExtension: string = "txt") {
  const createPath = path.resolve(
    LOG_DIRECTORY_PATH,
    `${fileName}.${fileExtension}`,
  );

  try {
    createDirectorySync(LOG_DIRECTORY_PATH);
    fileSystem.writeFileSync(createPath, "", { flag: "w" });
  } catch (error) {
    console.error(`Cannot create log file at ${createPath} - ${error}`);
  }
}

function appendToFile(
  fileName: string,
  text: string,
  fileExtension: string = "txt",
) {
  const appendPath = path.resolve(
    LOG_DIRECTORY_PATH,
    `${fileName}.${fileExtension}`,
  );
  try {
    fileSystem.appendFileSync(appendPath, text);
  } catch (error) {
    console.error(`Could not append to log file at ${appendPath} - ${error}`);
  }
}

export default function logger({
  logType,
  newValue,
  oldValue,
  error,
  info,
  warning,
}: LoggerArgs) {
  const fileName = new Date().toISOString().split("T")[0];

  if (!fileName) {
    throw new Error("Could not crate log file name");
  }

  createFile(fileName);

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

  const newLogContent = `${logType} - new_value: ${newValue} | old_value: ${oldValue} | error: ${error} | info: ${info} | warning: ${warning}`;
  appendToFile(fileName, newLogContent);
}
