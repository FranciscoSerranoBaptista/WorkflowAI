import axios from "axios";
import type { INode, INodeTypes } from "workflowai.common";

/**
 * Function to execute the LLM node with the provided configuration.
 * @param nodeId
 * @param getNode
 * @param prompts
 */
export async function aiCall(
  nodeId: string,
  getNode: (nodeId: string) => INode | undefined,
): Promise<void> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    throw new Error(`OpenAI API key is not set.`);
  }

  const node = getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  const { provider, model, prompt, maxTokens, temperature, messages } =
    node.parameters.llmConfig;

  if (provider.toLowerCase() !== "openai") {
    throw new Error(`Provider ${provider} not supported.`);
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      },
    );

    // Simulate storing or processing the response
    console.log(`Response from OpenAI: `, response.data);

    node.parameters.llmConfig.output = response.data;
  } catch (error) {
    console.error(`Error during OpenAI API call: `, error);

    if (error instanceof Error) {
      throw new Error(`AI call failed: ${error.message}`);
    } else {
      throw new Error(`AI call failed: ${JSON.stringify(error)}`);
    }
  }
}
