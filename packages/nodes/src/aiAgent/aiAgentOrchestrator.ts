import type { INode, PromptMetaData } from "workflowai.common";

import { aiCall } from "./aiCall";

async function orchestrateAIAgent(
  node: INode,
  prompts: { [key: string]: PromptMetaData },
  config: {
    model: string;
    provider: string;
    prompt: string;
    maxTokens: number;
    temperature: number;
  },
): Promise<void> {
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

  const result = await aiCall(node.id, () => node);

  return result;
}

export { orchestrateAIAgent };
