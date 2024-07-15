// WorkflowAI/packages/common/src/error.ts
import callsites from "callsites";
import type { Event } from "@sentry/node";

// Define the error levels
export type Level = "warning" | "error" | "fatal" | "info";

// Interface for reporting options
export interface ReportingOptions {
  level?: Level;
  tags?: NonNullable<Event["tags"]>;
  extra?: Event["extra"];
}

// Base class for all our custom errors
export class ApplicationError extends Error {
  level: Level;
  tags: NonNullable<Event["tags"]>;
  extra?: Event["extra"];

  constructor(
    message: string,
    {
      level = "error",
      tags = {},
      extra,
      ...rest
    }: Partial<ErrorOptions> & ReportingOptions = {},
  ) {
    super(message, rest);
    this.level = level;
    this.tags = tags;
    this.extra = extra;

    // Determine the package name from the call site
    try {
      const filePath = callsites()[2].getFileName() ?? "";
      const match = /packages\/([^\/]+)\//.exec(filePath)?.[1];
      if (match) this.tags.packageName = match;
    } catch {}
  }
}

// Extension of application error for validation specific errors
export class ValidationError extends ApplicationError {
  constructor(message: string, options: ReportingOptions = {}) {
    super(`Validation Error: ${message}`, options);
    this.name = "ValidationError";
  }
}

// Extension of application error for workflow specific errors
export class WorkflowError extends ApplicationError {
  constructor(message: string, options: ReportingOptions = {}) {
    super(message, options);
    this.name = "WorkflowError";
  }
}
