import type { INodeType, INode, INodeExecutionData } from "../interfaces";

const NoOpNode: INodeType = {
  type: "NoOpNode",
  displayName: "No-Op Node",
  description:
    "A node that performs no operation and returns input data as output.",
  version: 1,
  execute: async function (
    this: INode,
    input: INodeExecutionData[],
  ): Promise<INodeExecutionData[]> {
    return input;
  },
};

export default NoOpNode;
