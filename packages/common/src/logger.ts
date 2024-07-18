import pino from "pino";
import pinoPretty from "pino-pretty"; // Import pino-pretty
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Generate a default UUID
let globalWorkflowId: string = uuidv4();

// Get log directory from .env, default to 'logs' if not set
const LOG_DIR = process.env.LOG_DIR || "logs";

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Sets the global workflow ID for logging purposes.
 * @param {string} workflowId - The workflow ID to set globally.
 */
export function setGlobalWorkflowId(workflowId: string) {
  globalWorkflowId = workflowId;
}

/**
 * Retrieves the global workflow ID.
 * @returns {string} - The global workflow ID.
 */
export function getGlobalWorkflowId(): string {
  return globalWorkflowId;
}

/**
 * Creates or returns the existing logger instance.
 * @returns {pino.Logger} The logger instance.
 */
export function getLogger(options?: Record<string, any>): pino.Logger {
  const workflowId = getGlobalWorkflowId();
  const logFilePath = path.join(LOG_DIR, `workflow_${workflowId}.log`);

  // Pretty transport for console logs
  const prettyTransport = pinoPretty({
    colorize: true, // Colorize logs for better readability in the console
    levelFirst: true, // Show level first
    messageFormat: '{levelLabel} - {time} - {msg}', // Custom message format
    translateTime: 'SYS:standard', // Use standard ISO time format
    ignore: 'pid,hostname' // Ignore unnecessary fields
  });

  // File transport for JSON logs
  const fileTransport = pino.transport({
    target: "pino/file",
    options: {
      destination: logFilePath,
      mkdir: true,
      // You can add a specific formatter if needed, but typically file logs are raw JSON
    },
  });

  return pino(
    {
      level: process.env.LOG_LEVEL || "debug",
      formatters: {
        level: (label) => {
          return { level: label.toUpperCase() };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    pino.multistream([
      { level: 'debug', stream: prettyTransport }, // Console logs are pretty-printed
      { level: 'debug', stream: fileTransport }    // File logs are JSON
    ]),
  );
}

export default getLogger;
