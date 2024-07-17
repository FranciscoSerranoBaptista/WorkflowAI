import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "workflowai.common";

export class NoOpNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: "No Operation",
    name: "noop",
    group: ["transform"],
    version: 1,
    description: "Simply passes the data through without any modification",
    defaults: {
      name: "NoOp",
      color: "#777777",
    },
    inputs: ["main"],
    outputs: ["main"],
    properties: [],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    items.forEach((item, index) => {
      const nodeId = this.getNodeParameter("id", index) as string;
      try {
        returnData.push({
          json: {
            [nodeId]: {
              status: "success",
              data: item.json,
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
    });

    return returnData;
  }
}
