import { readFile } from "fs/promises";
import { join } from "path";
import type {
  INode,
  INodeTypes,
  PromptMetaData,
  ILLMConfig,
} from "workflowai.common";
import { nodeRegistry } from "../nodeRegistry";

import { aiCall } from "./aiCall";

async function orchestrateAIAgent(
  nodeId: string,
  getNode: (nodeId: string) => INode | undefined,
  prompts: { [key: string]: PromptMetaData },
  config: {
    model: string;
    provider: string;
    prompt: string;
    maxTokens: number;
    temperature: number;
  },
): Promise<void> {
  const node = getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found in workflow`);
  }

  const llmConfig = {
    model: config.model,
    provider: config.provider,
    prompt: config.prompt,
    maxTokens: config.maxTokens,
    temperature: config.temperature,
  };

  node.parameters = {
    ...node.parameters,
    llmConfig,
  };

  const result = await aiCall(nodeId, () => node);

  return result;
}

export { orchestrateAIAgent };
