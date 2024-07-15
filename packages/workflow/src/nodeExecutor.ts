import type {
  INodeType,
  INode,
  INodeExecutionData,
  INodeTypes,
  IExecuteFunctions,
} from "workflowai.common";
import type { Logger } from "winston";

interface NodeExecutionOptions {
  maxRetries: number;
  retryOnFail: boolean;
  retryDelay: number;
  maxTries: number;
  waitBetweenRetries: number;
}

export class NodeExecutor {
  private nodeTypesRegistry: INodeTypes;
  private logger: Logger;

  constructor(nodeTypesRegistry: INodeTypes, logger: Logger) {
    this.nodeTypesRegistry = nodeTypesRegistry;
    this.logger = logger;
  }

  async executeNode(
    nodeType: INodeType,
    node: INode,
    inputData: INodeExecutionData[],
    executeFunctions: IExecuteFunctions,
  ): Promise<INodeExecutionData[]> {
    if (!nodeType.execute) {
      throw new Error(`Node type ${node.type} does not implement execute`);
    }

    this.logger.info(`Executing node ${node.id} of type ${node.type}`);

    const maxTries = nodeType.maxTries || 1;

    for (let trial = 0; trial < maxTries; trial++) {
      try {
        // Create a custom context that combines the executeFunctions with the current inputData
        const context = {
          ...executeFunctions,
          getInputData: () => inputData,
        };

        const outputData = await nodeType.execute.call(context);
        return outputData;
      } catch (error) {
        if (nodeType.retryOnFail && trial < (nodeType.maxTries || 1) - 1) {
          this.logger.warn(
            `Execution error on node ${node.id}, retrying... (${trial + 1}/${nodeType.maxTries})`,
          );
          if (nodeType.waitBetweenRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, nodeType.waitBetweenRetries),
            );
          }
        } else {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          this.logger.error(
            `Execution error on node ${node.id}: ${errorMessage}`,
          );
          throw error;
        }
      }
    }

    throw new Error(`All retry attempts failed for node ${node.id}`);
  }
}
