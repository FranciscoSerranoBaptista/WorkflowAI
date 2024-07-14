import type { INodeType, INode, INodeExecutionData } from "../interfaces";
import fs from "fs";

export const fileReadNode: INodeType = {
  type: "fileRead",
  displayName: "File Read Node",
  description: "Node to read content from a file",
  version: 1,
  execute: async function (
    this: INode,
    input: INodeExecutionData[],
  ): Promise<INodeExecutionData[]> {
    const { filePath } = this.parameters;
    const content = fs.readFileSync(filePath, "utf8");
    return [{ json: { content } }];
  },
};
