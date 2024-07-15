import { createLogger, format, transports } from "winston";

// Singleton pattern for logger instance
let loggerInstance: ReturnType<typeof createLogger> | null = null;
let activeLoggerWorkflowId = "";

export function createWorkflowLogger(workflowId: string) {
  if (loggerInstance && activeLoggerWorkflowId === workflowId) {
    return loggerInstance;
  }

  activeLoggerWorkflowId = workflowId;
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
      new transports.File({ filename: `workflow_${workflowId}.log` }),
      // Transports for Sentry, newrelic etc. can be added here
    ],
  });

  return loggerInstance;
}

export function getCurrentLogger() {
  if (!loggerInstance) {
    throw new Error("Logger not initialized. Call createWorkflowLogger first.");
  }
  return loggerInstance;
}

export default createWorkflowLogger;
