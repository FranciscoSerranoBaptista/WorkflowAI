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

    // Ensure each item has a `json` property
    const returnData: INodeExecutionData[] = items.map((item) => ({
      json: item.json,
    }));

    return returnData;
  }
}
