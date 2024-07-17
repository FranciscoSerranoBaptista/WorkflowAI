import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "workflowai.common";
import * as fs from "fs/promises";
import * as path from "path";
import { WorkflowError } from "workflowai.common";

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
        displayName: "File Content",
        name: "fileContent",
        type: "string",
        default: "",
        placeholder: "Content to write to the file",
        description: "The content to write to the file",
        required: true,
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
      ) as string;

      // Use the environment variable to construct the full path
      const baseDir = process.env.WORKFLOW_BASE_DIR || ".";
      const fullPath = path.join(baseDir, filePath);

      if (operation === "read") {
        try {
          const rawData = await fs.readFile(fullPath, "utf-8");
          const transformedData = {
            [variableName]: rawData,
          };

          returnData.push({
            json: {
              [nodeId]: {
                status: "success",
                data: transformedData,
                source: nodeId,
              },
            },
          });
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
        }
      } else if (operation === "write") {
        // Concatenate content from dependencies
        let fileContent = "";
        items.forEach((item) => {
          const sourceNodeId = item.json.source;
          const content = item.json[sourceNodeId]?.data;
          if (content) {
            fileContent += content + "\n"; // Concatenate with newline
          }
        });

        try {
          await fs.writeFile(fullPath, fileContent, "utf-8");
          returnData.push({
            json: { [nodeId]: { status: "success", source: nodeId } },
          });
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
        }
      } else {
        returnData.push({
          json: {
            [nodeId]: {
              status: "error",
              error: "Invalid operation",
              source: nodeId,
            },
          },
        });
      }
    }

    return returnData;
  }
}
