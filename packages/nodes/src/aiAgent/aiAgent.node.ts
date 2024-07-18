import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INode,
  INodeTypeDescription,
} from "workflowai.common";
import { orchestrateAIAgent } from "./aiAgentOrchestrator";
import { interpolatePrompt, loadPrompts } from "../utils/prompts";

const prompts = loadPrompts(); // Load prompts once and reuse

export class AiAgentNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: "AI Agent",
    name: "ai_Agent",
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
      const maxTokens = this.getNodeParameter("maxTokens", itemIndex) as number;
      const temperature = this.getNodeParameter("temperature", itemIndex) as number;
      const promptId = this.getNodeParameter("promptId", itemIndex) as string;

      // Assuming that the `node` information should be part of the parameters
      const node: INode = {
        id: nodeId,
        name: nodeId,
        type: "ai_agent",
        typeVersion: 1,
        parameters: {
          model,
          provider,
          promptId,
          maxTokens,
          temperature,
        },
      };

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
        for (const item of items) {
          for (const itemKey in item.json) {
            if (item.json[itemKey] && item.json[itemKey].data) {
              const dataObject = item.json[itemKey].data;
              for (const [key, data] of Object.entries(dataObject)) {
                if (typeof data === "object" && data !== null) {
                  variables[key] = JSON.stringify(data);
                } else if (typeof data === "string") {
                  variables[key] = data;
                }
              }
            }
          }
        }

        // Interpolate prompt
        const interpolatedPrompt = interpolatePrompt(promptTemplate, variables);

        const config = {
          model,
          provider,
          prompt: interpolatedPrompt,
          maxTokens,
          temperature,
        };

        // Orchestrate AI agent execution
        const result = await orchestrateAIAgent(node, prompts, config);

        // Wrap the result with the node ID
        const output: INodeExecutionData = {
          json: {
            [nodeId]: {
              status: "success",
              data: result,
              source: nodeId,
            },
          },
        };
        returnData.push(output);
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
    }

    return returnData;
  }
}
