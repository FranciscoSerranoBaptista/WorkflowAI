import type { INodeExecutionData, INode, INodeTypes } from "./interfaces";
import { interpolatePrompt } from "./utils";

async function executeLLMNode(
  nodeId: string,
  input: INodeExecutionData[],
  getNode: (nodeId: string) => INode | undefined,
  nodeTypesRegistry: INodeTypes,
): Promise<INodeExecutionData[]> {
  const node = getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found in workflow`);
  }

  const nodeType = nodeTypesRegistry[node.type];
  if (!nodeType) {
    throw new Error(`Node type ${node.type} not found in registry`);
  }

  if (node.type !== "LLMNode") {
    throw new Error(`Node type ${node.type} is not an LLMNode`);
  }

  return await nodeType.execute.call(node, input);
}

async function executeClusterNode(
  nodeId: string,
  clusterConfiguration: {
    promptTemplate: string;
    variables: { [key: string]: string };
  },
  getNode: (nodeId: string) => INode | undefined,
  nodeTypesRegistry: INodeTypes,
): Promise<INodeExecutionData[]> {
  const nodeOutputs: { [nodeId: string]: INodeExecutionData[] } = {};

  const node = getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found in workflow`);
  }

  // Extract the input data based on variables configuration
  const inputVariables = Object.keys(clusterConfiguration.variables).reduce(
    (acc, varName) => {
      // Assuming input data is provided within `parameters` property of node
      acc[varName] = node.parameters[varName];
      return acc;
    },
    {} as { [key: string]: string },
  );

  const finalPrompt = interpolatePrompt(
    clusterConfiguration.promptTemplate,
    inputVariables,
  );

  const llmInputData: INodeExecutionData[] = [
    {
      json: {
        prompt: finalPrompt,
      },
    },
  ];

  const outputData = await executeLLMNode(
    nodeId,
    llmInputData,
    getNode,
    nodeTypesRegistry,
  );
  nodeOutputs[nodeId] = outputData;

  return outputData;
}

// Example function to orchestrate LLM node execution
async function orchestrateLLMExecution(
  nodeId: string,
  getNode: (nodeId: string) => INode | undefined,
  nodeTypesRegistry: INodeTypes,
): Promise<void> {
  const clusterConfig = {
    promptTemplate: `
      You are tasked with creating a framework to identify and describe people in transition within a given target audience, based on a specific problem. This framework will help uncover potential ideal members for a community or product focused on addressing the given problem.
      Here is the problem you need to address:
      <problem>{{PROBLEM}}</problem>
      And here is the target audience:
      <target_audience>{{TARGET_AUDIENCE}}</target_audience>
    `,
    variables: {
      PROBLEM: "Define the problem here",
      TARGET_AUDIENCE: "Define the target audience here",
    },
  };

  await executeClusterNode(nodeId, clusterConfig, getNode, nodeTypesRegistry);
}

export { executeClusterNode, orchestrateLLMExecution };
