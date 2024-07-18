// NodeExecutor.ts
import { getLogger } from "workflowai.common";
import type {
  IExecuteFunctions,
  INode,
  INodeExecutionData,
  INodeType,
  INodeTypes,
} from "workflowai.common";
import { ApplicationError, WorkflowError } from "workflowai.common";
import { NodeOrchestrator } from "./NodeOrchestrator";

export class NodeExecutor {
  private nodeTypesRegistry: INodeTypes;
  private logger: ReturnType<typeof getLogger>;
  private orchestrator: NodeOrchestrator;

  constructor(
    nodeTypesRegistry: INodeTypes,
    logger: ReturnType<typeof getLogger>,
    orchestrator: NodeOrchestrator
  ) {
    this.nodeTypesRegistry = nodeTypesRegistry;
    this.logger = getLogger({ module: "NodeExecutor" });
    this.orchestrator = orchestrator;
  }

  async executeNode(
    nodeType: INodeType,
    node: INode,
    currentNodeId: string,
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
        const inputData = this.orchestrator.getInputDataForNode(currentNodeId);

        const context: IExecuteFunctions = {
          getInputData: () => inputData,
          getNodeParameter: (
            name: string,
            index: number,
            defaultValue?: any,
          ) => {
            return this.orchestrator.getNodeParameter(currentNodeId, name, defaultValue);
          },
          getWorkflow: () => this.orchestrator.getWorkflow(),
        };

        const outputData = await nodeType.execute.call(context);

        if (!outputData || outputData.length === 0) {
          continue;
        }

        return outputData;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        this.logger.error(`Execution error on node ${node.id}: ${errorMessage}`);

        if (continueOnFail) {
          return [{ json: { error: errorMessage } }];
        }

        if (retryOnFail && trial < maxTries - 1) {
          await new Promise((resolve) => setTimeout(resolve, waitBetweenRetries));
        } else {
          throw error instanceof ApplicationError
            ? error
            : new WorkflowError(errorMessage, {
              tags: { nodeId: node.id, nodeType: node.type },
            });
        }
      }
    }

    throw new WorkflowError(`All retry attempts failed for node ${node.id}`, {
      tags: { nodeId: node.id, nodeType: node.type },
    });
  }
}
