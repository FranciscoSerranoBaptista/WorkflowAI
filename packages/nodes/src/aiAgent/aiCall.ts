import { OpenAI } from "openai";
import type { INode } from "workflowai.common";

/**
 * Function to execute the LLM node with the provided configuration.
 * @param nodeId
 * @param getNode
 * @param prompts
 */
export async function aiCall(
  nodeId: string,
  getNode: (nodeId: string) => INode | undefined,
): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    throw new Error(`OpenAI API key is not set.`);
  }

  const node = getNode(nodeId);
  if (!node || !node.parameters.llmConfig) {
    throw new Error(`Node ${nodeId} not found or missing configuration`);
  }

  const { provider, model, prompt, maxTokens, temperature } =
    node.parameters.llmConfig;

  if (provider.toLowerCase() !== "openai") {
    throw new Error(`Provider ${provider} not supported.`);
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    });

    console.log(`Response from OpenAI: `, response.choices[0].message.content);

    const content = response.choices[0].message?.content;

    if (!content) {
      throw new Error("AI response content is null or undefined");
    }

    return content;  // Return the obtained content

  } catch (error) {
    console.error(`Error during OpenAI API call: `, error);

    if (error instanceof Error) {
      throw new Error(`AI call failed: ${error.message}`);
    } else {
      throw new Error(`AI call failed: ${JSON.stringify(error)}`);
    }
  }
}
