// logger.ts

import { createLogger, format, transports } from "winston";

export function createWorkflowLogger(workflowId: string) {
  return createLogger({
    level: "info",
    format: format.combine(
      format.timestamp(),
      format.printf(
        ({ timestamp, level, message }) =>
          `${timestamp} [${level}]: ${message}`,
      ),
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: `workflow_${workflowId}.log` }),
    ],
  });
}

export default createWorkflowLogger;
