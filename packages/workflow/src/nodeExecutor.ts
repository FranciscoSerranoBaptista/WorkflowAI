import type { Logger } from "winston";
import type {
  IExecuteFunctions,
  INode,
  INodeExecutionData,
  INodeType,
  INodeTypes,
} from "workflowai.common";
import { ApplicationError, WorkflowError } from "workflowai.common";

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
    const retryOnFail = node.retryOnFail ?? nodeType.retryOnFail ?? false;
    const waitBetweenRetries =
      node.waitBetweenRetries ?? nodeType.waitBetweenRetries ?? 1000;

    for (let trial = 0; trial < maxTries; trial++) {
      try {
        // Create a custom context that combines the executeFunctions with the current inputData
        const context = {
          ...executeFunctions,
          getInputData: () => this.prepareInputData(node.id, inputData),
          getNodeParameter: (
            name: string,
            index: number,
            defaultValue?: any,
          ) => {
            return node.parameters[name] ?? defaultValue;
          },
        };

        const outputData = await nodeType.execute.call(context);

        // Check if the output contains an error
        const hasError = outputData.some(
          (item) => item.json && item.json.error,
        );
        if (hasError) {
          const errorMessage = outputData.find(
            (item) => item.json && item.json.error,
          )?.json.error;
          throw new WorkflowError(`Node execution failed: ${errorMessage}`, {
            tags: { nodeId: node.id, nodeType: node.type },
          });
        }

        // Wrap the output data with the node ID
        return this.wrapOutputData(node.id, outputData);
      } catch (error) {
        if (retryOnFail && trial < maxTries - 1) {
          this.logger.warn(
            `Execution error on node ${node.id}, retrying... (${trial + 1}/${maxTries})`,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, waitBetweenRetries),
          );
        } else {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          this.logger.error(
            `Execution error on node ${node.id}: ${errorMessage}`,
          );

          if (node.continueOnFail) {
            this.logger.warn(
              `Node ${node.id} failed, but continuing due to continueOnFail setting`,
            );
            return this.wrapOutputData(node.id, [
              { json: { error: errorMessage } },
            ]);
          } else {
            throw error instanceof ApplicationError
              ? error
              : new WorkflowError(errorMessage, {
                  tags: { nodeId: node.id, nodeType: node.type },
                });
          }
        }
      }
    }

    throw new WorkflowError(`All retry attempts failed for node ${node.id}`, {
      tags: { nodeId: node.id, nodeType: node.type },
    });
  }

  private prepareInputData(
    nodeId: string,
    inputData: INodeExecutionData[],
  ): INodeExecutionData[] {
    // Prepare input data by ensuring each item has a 'source' property
    return inputData.map((item) => ({
      ...item,
      json: {
        ...item.json,
        source: item.json.source || nodeId,
      },
    }));
  }

  private wrapOutputData(
    nodeId: string,
    outputData: INodeExecutionData[],
  ): INodeExecutionData[] {
    // Wrap output data with the node ID
    return outputData.map((item) => ({
      ...item,
      json: {
        [nodeId]: item.json,
      },
    }));
  }
}
