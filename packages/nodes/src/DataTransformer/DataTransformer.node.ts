import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "workflowai.common";

export class DataTransformerNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Data Transformation",
    name: "dataTransformation",
    group: ["transform"],
    version: 1,
    description: "Transforms raw text data into a structured format",
    defaults: {
      name: "Data Transformation",
      color: "#1A82e2",
    },
    inputs: ["main"],
    outputs: ["main"],
    properties: [
      {
        displayName: "Variable Name",
        name: "variableName",
        type: "string",
        default: "data",
        placeholder: "variable name",
        description: "The name of the variable to assign the text data to",
        required: true,
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const variableName = this.getNodeParameter(
        "variableName",
        itemIndex,
      ) as string;
      const item = items[itemIndex];

      try {
        const transformedData = {
          [variableName]: item.json.data,
        };

        returnData.push({
          json: {
            status: "success",
            data: transformedData,
            source: item.json.source,
          },
        });
      } catch (error) {
        returnData.push({
          json: {
            status: "error",
            error: (error as Error).message,
            source: item.json.source,
          },
        });
      }
    }

    return returnData;
  }
}
