import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "workflowai.common";
import fs from "fs";
import * as path from "path";
import { WorkflowError } from "workflowai.common";
import { getLogger } from "workflowai.common";

// Initialize logger
const logger = getLogger({ module: "FileReadWriteNode" });

// Helper functions
const readFile = (fullPath: string, filePath: string): string => {
  try {
    logger.debug(`Attempting to read file: ${fullPath}`);
    const data = fs.readFileSync(fullPath, "utf-8");
    logger.debug(`File content read: ${data.substr(0, 100)}...`);
    return data;
  } catch (error) {
    logger.error(`Error reading file: ${fullPath}`, { error });
    throw new WorkflowError(
      `Error reading file: ${(error as Error).message}`,
      {
        tags: { operation: "read", filePath: fullPath },
      },
    );
  }
};

const writeFile = async (fullPath: string, fileContent: string, filePath: string): Promise<void> => {
  try {
    logger.debug(`Attempting to write file: ${fullPath}`);
    await Bun.write(fullPath, fileContent);
    logger.debug(`File written successfully: ${fullPath}`);
  } catch (error) {
    logger.error(`Error writing file: ${fullPath}`, { error });
    throw new WorkflowError(
      `Error writing file: ${(error as Error).message}`,
      {
        tags: { operation: "write", filePath: fullPath },
      },
    );
  }
};

const createWorkflowError = (error: unknown, fullPath: string, operation: string): WorkflowError => {
  let errorMessage = "An unknown error occurred.";
  let errorTags: Record<string, any> = { operation, filePath: fullPath };

  if (error instanceof WorkflowError) {
    throw error; // Re-throw WorkflowErrors for specific handling elsewhere
  } else if (error instanceof Error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      errorMessage = `File not found: ${fullPath}`;
    } else if (err.code === "EACCES") {
      errorMessage = `Permission denied: ${fullPath}`;
    } else {
      errorMessage = `Error during file operation: ${err.message}`;
      errorTags.errorCode = err.code; // Add error code to tags
    }
  }

  logger.error(errorMessage, { errorTags });
  return new WorkflowError(errorMessage, {
    tags: errorTags
  });
};

export class FileReadWriteNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Read/Write File",
    name: "read_write_file",
    group: ["transform"],
    version: 1,
    description: "Reads or writes a file from/to the filesystem",
    defaults: {
      name: "Read/Write File",
      color: "#1A82e2",
    },
    inputs: ["main"],
    outputs: ["main"],
    properties: [
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        options: [
          { name: "Read", value: "read" },
          { name: "Write", value: "write" },
        ],
        default: "read",
        description: "Whether to read from or write to a file",
        required: true,
      },
      {
        displayName: "File Path",
        name: "filePath",
        type: "string",
        default: "",
        placeholder: "/path/to/file.txt",
        description: "The path to the file to read/write",
        required: true,
      },
      {
        displayName: "Variable Name",
        name: "variableName",
        type: "string",
        default: "",
        placeholder: "Variable name for storing data",
        description: "The name of the variable to store/read the data",
        required: false,
      },
      {
        displayName: "File Content",
        name: "fileContent",
        type: "string",
        default: "",
        placeholder: "Content to write to the file",
        description: "The content to write to the file",
        required: false,
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const operation = this.getNodeParameter("operation", itemIndex) as string;
      const filePath = this.getNodeParameter("filePath", itemIndex) as string;
      const nodeId = this.getNodeParameter("id", itemIndex) as string;
      const variableName = this.getNodeParameter(
        "variableName",
        itemIndex,
        "data"
      ) as string;
      const fullPath = path.join(
        process.env.WORKFLOW_BASE_DIR || ".",
        filePath,
      );

      logger.debug(`Processing item ${itemIndex + 1}/${items.length}`, {
        operation,
        filePath,
        variableName,
        fullPath
      });

      try {
        if (operation === "read") {
          const data = readFile(fullPath, filePath);
          returnData.push({
            json: {
              [variableName]: {
                status: "success",
                data: {
                  [variableName.trim() || "data"]: data,
                },
                source: nodeId,
              },
            },
          });
        } else if (operation === "write") {
          const fileContent = this.getNodeParameter(
            "fileContent",
            itemIndex,
            "",
          ) as string;
          await writeFile(fullPath, fileContent, filePath);
          returnData.push({ json: { [nodeId]: { status: "success", source: nodeId } } });
        } else {
          logger.error(`Invalid operation`, { operation });
          throw new WorkflowError("Invalid operation", { tags: { operation } });
        }
      } catch (error) {
        returnData.push({
          json: {
            [nodeId]: {
              status: "error",
              error: (error as Error).message,
              source: nodeId,
            },
          },
        });
        logger.error(`Error processing item ${itemIndex + 1}/${items.length}`, {
          error,
          operation,
          filePath,
          variableName,
          fullPath
        });
      }
    }

    return returnData;
  }
}
