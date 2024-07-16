import { createLogger, format, transports } from "winston";
import chalk from "chalk";
import fs from "fs";
import path from "path";

// Singleton pattern for logger instance
let loggerInstance: ReturnType<typeof createLogger> | null = null;

const logDir = path.join(__dirname, "../logs"); // Adjust the path as needed

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Creates or returns the existing logger instance.
 * @param {string} [workflowId] - Optional workflow ID for file logging.
 * @returns {ReturnType<typeof createLogger>} The logger instance.
 */
export function getLogger(
  workflowId?: string,
): ReturnType<typeof createLogger> {
  if (!loggerInstance) {
    const customFormat = format.printf(({ timestamp, level, message }) => {
      let coloredLevel;
      switch (level) {
        case "error":
          coloredLevel = chalk.red(level.toUpperCase());
          break;
        case "warn":
          coloredLevel = chalk.yellow(level.toUpperCase());
          break;
        case "info":
          coloredLevel = chalk.green(level.toUpperCase());
          break;
        case "debug":
          coloredLevel = chalk.blue(level.toUpperCase());
          break;
        default:
          coloredLevel = level.toUpperCase();
      }
      return `${chalk.gray(timestamp)} [${coloredLevel}]: ${message}`;
    });
    loggerInstance = createLogger({
      level: "debug",
      format: format.combine(
        format.timestamp(),
        format.printf(
          ({ timestamp, level, message }) =>
            `${timestamp} [${level.toUpperCase()}]: ${message}`,
        ),
      ),
      transports: [
        new transports.Console(),
        // Transports for Sentry, newrelic etc. can be added here
      ],
    });
  }

  // Add file transport if workflowId is provided
  if (
    workflowId &&
    !loggerInstance.transports.some((t) => t instanceof transports.File)
  ) {
    loggerInstance.add(
      new transports.File({
        filename: path.join(logDir, `workflow_${workflowId}.log`),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true,
      }),
    );
  }

  return loggerInstance;
}

export default getLogger;
