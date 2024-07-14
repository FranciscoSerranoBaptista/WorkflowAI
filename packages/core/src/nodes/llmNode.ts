import type {
  INodeType,
  INodeExecutionData,
  ILLMNode,
  INode,
  ILLMConfig,
} from "../interfaces";
import OpenAI from "openai";
import { interpolatePrompt } from "../utils";

/**
 * Type guard to ensure the node is of type ILLMNode.
 * @param node - The node to check.
 * @returns True if the node is an ILLMNode, otherwise false.
 */
function isLLMNode(node: INode): node is ILLMNode {
  return (node as ILLMNode).llmConfig !== undefined;
}

/**
 * LLMNode type definition.
 * This node performs an LLM call using the OpenAI API.
 */
export const LLMNode: INodeType = {
  type: "LLMNode",
  displayName: "LLM Call Node",
  description: "A node that makes an LLM call using the OpenAI API",
  version: 1,
  execute: async function (
    this: INode,
    input: INodeExecutionData[],
  ): Promise<INodeExecutionData[]> {
    if (!isLLMNode(this)) {
      throw new Error("The node is not of type ILLMNode");
    }

    // Sensitive parameters such as API Key should come from environment variables or configurations.
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key is not provided");
    }

    const { model, temperature, maxTokens, prompt } = this.llmConfig;

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Concatenate all inputs to form the prompt input
    const inputVariables = input.reduce((acc, data) => {
      return { ...acc, ...data.json };
    }, {});

    const finalPrompt = interpolatePrompt(prompt, inputVariables);

    try {
      const params: OpenAI.Chat.ChatCompletionCreateParams = {
        messages: [{ role: "user", content: finalPrompt }],
        model: model,
        temperature: temperature,
        max_tokens: maxTokens,
      };

      const chatCompletion: OpenAI.Chat.ChatCompletion =
        await openai.chat.completions.create(params);

      // Assuming the response contains an array of completion choices
      const output = chatCompletion.choices.map((choice) => ({
        json: {
          output: choice.message?.content,
          ...this.parameters,
        },
      }));

      return output;
    } catch (err) {
      // Handle specific API error responses
      if (err instanceof OpenAI.APIError) {
        console.log(`Error Type: ${err.name}, Status: ${err.status}`);
        console.log(`Error Message: ${err.message}`);
      } else {
        throw err;
      }

      // Return an error message in the output
      return [
        {
          json: {
            error: true,
            errorType: err.name,
            errorMessage: err.message,
          },
        },
      ];
    }
  },
};
