import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "workflowai.common";
import * as fs from "fs/promises";
import * as path from "path";

export class FileReadWriteNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Read/Write File",
    name: "fileReadWrite",
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

      if (operation === "read") {
        try {
          const data = await fs.readFile(path.resolve(filePath), "utf-8");
          returnData.push({ json: { data } });
        } catch (error) {
          returnData.push({ json: { error: (error as Error).message } });
        }
      } else if (operation === "write") {
        const fileContent = this.getNodeParameter(
          "fileContent",
          itemIndex,
        ) as string;
        try {
          await fs.writeFile(path.resolve(filePath), fileContent, "utf-8");
          returnData.push({ json: { status: "success" } });
        } catch (error) {
          returnData.push({ json: { error: (error as Error).message } });
        }
      } else {
        returnData.push({ json: { error: "Invalid operation" } });
      }
    }

    return returnData;
  }
}
