import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INode,
} from "workflowai.common";
import { orchestrateAIAgent } from "./aiAgentOrchestrator";
import { loadPrompts } from "../helpers/prompts";

const prompts = loadPrompts(); // Load prompts once and reuse

export class AiAgentNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: "AI Agent",
    name: "aiAgent",
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
      const nodeId = this.getNodeParameter("nodeId", itemIndex) as string;
      const model = this.getNodeParameter("model", itemIndex) as string;
      const provider = this.getNodeParameter("provider", itemIndex) as string;
      const prompt = this.getNodeParameter("prompt", itemIndex) as string;
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

      try {
        // Directly create the node based on parameters
        const currentNode: INode = {
          id: nodeId,
          name: "aiAgent",
          type: "aiAgent",
          typeVersion: 1,
          parameters: {
            model,
            provider,
            prompt,
            maxTokens,
            temperature,
          },
        };

        // Orchestrate AI agent execution
        await orchestrateAIAgent(nodeId, () => currentNode, prompts, {
          model,
          provider,
          prompt,
          maxTokens,
          temperature,
        });

        // Assume some output based on AI execution
        const output = {
          json: { status: "success", data: {} /* AI result data here */ },
        };
        returnData.push(output);
      } catch (error) {
        returnData.push({ json: { error: (error as Error).message } });
      }
    }

    return returnData;
  }
}
