import type { INodeType, INode, INodeExecutionData } from "../interfaces";
import fs from "fs";

export const fileWriteNode: INodeType = {
  type: "fileWrite",
  displayName: "File Write Node",
  description: "Node to write content to a file",
  version: 1,
  execute: async function (
    this: INode,
    input: INodeExecutionData[],
  ): Promise<INodeExecutionData[]> {
    const { filePath, content } = this.parameters;
    fs.writeFileSync(filePath, content, "utf8");
    return [{ json: { success: true } }];
  },
};
