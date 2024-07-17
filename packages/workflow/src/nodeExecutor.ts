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
  private getNode: (nodeId: string) => INode | undefined;

  constructor(
    nodeTypesRegistry: INodeTypes,
    logger: Logger,
    getNode: (nodeId: string) => INode | undefined,
  ) {
    this.nodeTypesRegistry = nodeTypesRegistry;
    this.logger = logger;
    this.getNode = getNode;
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
    const retryOnFail =
      node.parameters.retryOnFail ?? nodeType.retryOnFail ?? false;
    const continueOnFail =
      node.parameters.continueOnFail ?? nodeType.continueOnFail ?? false;
    const waitBetweenRetries =
      node.parameters.waitBetweenRetries ?? nodeType.waitBetweenRetries ?? 1000;

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
          (item) => item.json && item.json[node.id]?.status === "error",
        );
        if (hasError) {
          const errorMessage = outputData.find(
            (item) => item.json && item.json[node.id]?.error,
          )?.json[node.id]?.error;
          throw new WorkflowError(`Node execution failed: ${errorMessage}`, {
            tags: { nodeId: node.id, nodeType: node.type },
          });
        }

        // Check if the output contains success
        const hasSuccess = outputData.some(
          (item) => item.json && item.json[node.id]?.status === "success",
        );
        if (hasSuccess) {
          return this.wrapOutputData(node.id, outputData);
        }
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

          if (continueOnFail) {
            this.logger.warn(
              `Node ${node.id} failed, but continuing due to continueOnFail setting`,
            );
            return this.wrapOutputData(node.id, [
              {
                json: {
                  [node.id]: {
                    status: "error",
                    error: errorMessage,
                    source: node.id,
                  },
                },
              },
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
    // Wrap output data by merging with the node ID context
    return outputData.map((item) => ({
      ...item,
      json: {
        ...item.json,
        source: nodeId, // Ensure source is set
      },
    }));
  }
}
