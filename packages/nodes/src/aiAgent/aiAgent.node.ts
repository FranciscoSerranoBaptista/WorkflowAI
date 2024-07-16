import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INode,
  INodeTypeDescription,
} from "workflowai.common";
import { interpolatePrompt, loadPrompts } from "../utils/prompts";
import { orchestrateAIAgent } from "./aiAgentOrchestrator";

const prompts = loadPrompts(); // Load prompts once and reuse

export class AiAgentNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: "AI Agent",
    name: "ai_agent",
    group: ["transform"],
    version: 1,
    description: "Executes a conversational AI agent",
    defaults: {
      name: "AI Agent",
      color: "#ff6347",
    },
    inputs: ["main"],
    outputs: ["main"],
    properties: [
      {
        displayName: "Model",
        name: "model",
        type: "string",
        default: "",
        description: "The model to use (e.g., GPT-3)",
        required: true,
      },
      {
        displayName: "Provider",
        name: "provider",
        type: "string",
        default: "",
        description: "The provider of the model (e.g., OpenAI)",
        required: true,
      },
      {
        displayName: "Prompt",
        name: "prompt",
        type: "string",
        default: "",
        description: "The prompt to send to the AI model",
        required: true,
      },
      {
        displayName: "Max Tokens",
        name: "maxTokens",
        type: "number",
        default: 100,
        description: "The maximum number of tokens to generate",
        required: false,
      },
      {
        displayName: "Temperature",
        name: "temperature",
        type: "number",
        default: 0.7,
        description: "The sampling temperature to use",
        required: false,
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const nodeId = this.getNodeParameter("id", itemIndex) as string;
      const model = this.getNodeParameter("model", itemIndex) as string;
      const provider = this.getNodeParameter("provider", itemIndex) as string;
      const maxTokens = this.getNodeParameter(
        "maxTokens",
        itemIndex,
        100,
      ) as number;
      const temperature = this.getNodeParameter(
        "temperature",
        itemIndex,
        0.7,
      ) as number;
      const promptId = this.getNodeParameter("promptId", itemIndex) as string;
      const promptTemplate = this.getNodeParameter(
        "promptTemplate",
        itemIndex,
      ) as string;

      try {
        // Get the prompt template
        const promptTemplate = prompts[promptId]?.content;
        if (!promptTemplate) {
          throw new Error(
            `Prompt template not found for promptId: ${promptId}`,
          );
        }

        // Prepare variables for interpolation
        const variables: { [key: string]: string } = {};
        items.forEach((item, index) => {
          Object.entries(item.json).forEach(([key, value]) => {
            variables[`${key}_${index}`] = String(value);
          });
        });

        // Interpolate prompt
        const interpolatedPrompt = interpolatePrompt(promptTemplate, variables);

        const config = {
          model,
          provider,
          prompt: interpolatedPrompt,
          maxTokens,
          temperature,
        };

        // Create a mock getNode function that returns a complete INode object
        const getNode = (id: string): INode | undefined => {
          if (id === nodeId) {
            return {
              id: nodeId,
              name: nodeId,
              type: "ai_agent",
              typeVersion: 1,
              parameters: this.getNodeParameter(
                "parameters",
                itemIndex,
              ) as IDataObject,
            };
          }
          return undefined;
        };

        // Orchestrate AI agent execution
        const result = await orchestrateAIAgent(
          nodeId,
          getNode,
          prompts,
          config,
        );

        // The result should now contain the AI call output
        const output: INodeExecutionData = {
          json: {
            status: "success",
            data: result,
          },
        };
        returnData.push(output);
      } catch (error) {
        returnData.push({ json: { error: (error as Error).message } });
      }
    }

    return returnData;
  }
}
