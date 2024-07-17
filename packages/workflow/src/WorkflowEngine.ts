import type {
  IConnectionDetails,
  IExecuteFunctions,
  INode,
  INodeExecutionData,
  INodeType,
  INodeTypes,
  IWorkflow,
  PromptMetaData,
} from "workflowai.common";
import { nodeRegistry } from "workflowai.nodes";
import { getLogger } from "workflowai.common";
import { WorkflowValidator } from "./WorkflowValidator";
import { NodeExecutor } from "./NodeExecutor";
import { createGetNodeFunction } from "./utils";

export class WorkflowEngine implements IExecuteFunctions {
  private nodeTypesRegistry: INodeTypes;
  private workflow: IWorkflow;
  private logger: ReturnType<typeof getLogger>;
  public nodeOutputs: { [nodeId: string]: INodeExecutionData[] } = {};
  private validator: WorkflowValidator;
  private executor: NodeExecutor;
  private currentNodeId: string | null = null;

  constructor(nodeTypesRegistry: INodeTypes = nodeRegistry) {
    this.nodeTypesRegistry = nodeTypesRegistry;
    this.workflow = this.initializeEmptyWorkflow();
    this.logger = getLogger();
    this.validator = new WorkflowValidator(this.workflow, this.logger);
    this.executor = new NodeExecutor(
      this.nodeTypesRegistry,
      this.logger,
      this.getNode.bind(this),
    );
  }

  private initializeEmptyWorkflow(): IWorkflow {
    return {
      id: "",
      name: "",
      nodes: [],
      connections: {
        connectionsBySourceNode: {},
        connectionsByDestinationNode: {},
      },
      active: false,
      startNodeId: "",
    };
  }

  setWorkflow(workflow: IWorkflow): void {
    this.workflow = workflow;
    this.logger = getLogger(this.workflow.id);
    this.validator.setWorkflow(this.workflow);
  }

  getWorkflow(): IWorkflow {
    return this.workflow;
  }

  addNode(node: INode): void {
    if (this.workflow.nodes.some((n) => n.id === node.id)) {
      throw new Error(`Node with id ${node.id} already exists in the workflow`);
    }
    this.workflow.nodes.push(node);
  }

  removeNode(nodeId: string): void {
    const index = this.workflow.nodes.findIndex((n) => n.id === nodeId);
    if (index === -1) {
      throw new Error(`Node with id ${nodeId} not found in the workflow`);
    }
    this.workflow.nodes.splice(index, 1);
    this.removeNodeConnections(nodeId);
  }

  private removeNodeConnections(nodeId: string): void {
    delete this.workflow.connections.connectionsBySourceNode[nodeId];
    delete this.workflow.connections.connectionsByDestinationNode[nodeId];

    Object.keys(this.workflow.connections.connectionsBySourceNode).forEach(
      (sourceId) => {
        this.workflow.connections.connectionsBySourceNode[sourceId] =
          this.workflow.connections.connectionsBySourceNode[sourceId].filter(
            (conn) => conn.destinationNodeId !== nodeId,
          );
      },
    );

    Object.keys(this.workflow.connections.connectionsByDestinationNode).forEach(
      (destId) => {
        this.workflow.connections.connectionsByDestinationNode[destId] =
          this.workflow.connections.connectionsByDestinationNode[destId].filter(
            (conn) => conn.sourceNodeId !== nodeId,
          );
      },
    );
  }

  addConnection(connection: IConnectionDetails): void {
    this.validator.validateConnectionNames(connection);
    if (
      !this.workflow.nodes.some((n) => n.id === connection.sourceNodeId) ||
      !this.workflow.nodes.some((n) => n.id === connection.destinationNodeId)
    ) {
      throw new Error("Source or destination node not found in the workflow");
    }

    this.addConnectionToSourceNode(connection);
    this.addConnectionToDestinationNode(connection);
  }

  private addConnectionToSourceNode(connection: IConnectionDetails): void {
    if (
      !this.workflow.connections.connectionsBySourceNode[
        connection.sourceNodeId
      ]
    ) {
      this.workflow.connections.connectionsBySourceNode[
        connection.sourceNodeId
      ] = [];
    }
    this.workflow.connections.connectionsBySourceNode[
      connection.sourceNodeId
    ].push(connection);
  }

  private addConnectionToDestinationNode(connection: IConnectionDetails): void {
    if (
      !this.workflow.connections.connectionsByDestinationNode[
        connection.destinationNodeId
      ]
    ) {
      this.workflow.connections.connectionsByDestinationNode[
        connection.destinationNodeId
      ] = [];
    }
    this.workflow.connections.connectionsByDestinationNode[
      connection.destinationNodeId
    ].push(connection);
  }

  removeConnection(connection: IConnectionDetails): void {
    this.validator.validateConnectionNames(connection);
    this.removeConnectionFromSourceNode(connection);
    this.removeConnectionFromDestinationNode(connection);
  }

  private removeConnectionFromSourceNode(connection: IConnectionDetails): void {
    this.workflow.connections.connectionsBySourceNode[connection.sourceNodeId] =
      this.workflow.connections.connectionsBySourceNode[
        connection.sourceNodeId
      ].filter(
        (conn) =>
          !(
            conn.destinationNodeId === connection.destinationNodeId &&
            conn.sourceOutputName === connection.sourceOutputName &&
            conn.destinationInputName === connection.destinationInputName
          ),
      );
  }

  private removeConnectionFromDestinationNode(
    connection: IConnectionDetails,
  ): void {
    this.workflow.connections.connectionsByDestinationNode[
      connection.destinationNodeId
    ] = this.workflow.connections.connectionsByDestinationNode[
      connection.destinationNodeId
    ].filter(
      (conn) =>
        !(
          conn.sourceNodeId === connection.sourceNodeId &&
          conn.sourceOutputName === connection.sourceOutputName &&
          conn.destinationInputName === connection.destinationInputName
        ),
    );
  }

  getNode(nodeId: string): INode | undefined {
    return this.workflow.nodes.find((node) => node.id === nodeId);
  }

  getGetNodeFunction() {
    return createGetNodeFunction(this);
  }

  updateNode(nodeId: string, updates: Partial<INode>): void {
    const nodeIndex = this.workflow.nodes.findIndex(
      (node) => node.id === nodeId,
    );
    if (nodeIndex === -1) {
      throw new Error(`Node with id ${nodeId} not found in the workflow`);
    }
    this.workflow.nodes[nodeIndex] = {
      ...this.workflow.nodes[nodeIndex],
      ...updates,
    };
  }

  setStartNode(nodeId: string): void {
    if (!this.workflow.nodes.some((node) => node.id === nodeId)) {
      throw new Error(`Node with id ${nodeId} not found in the workflow`);
    }
    this.workflow.startNodeId = nodeId;
  }

  getStartNodes(): INode[] {
    return this.workflow.nodes.filter(
      (node) =>
        !this.workflow.connections.connectionsByDestinationNode[node.id] ||
        this.workflow.connections.connectionsByDestinationNode[node.id]
          .length === 0,
    );
  }

  getEndNodes(): INode[] {
    return this.workflow.nodes.filter(
      (node) =>
        !this.workflow.connections.connectionsBySourceNode[node.id] ||
        this.workflow.connections.connectionsBySourceNode[node.id].length === 0,
    );
  }

  async executeWorkflow(): Promise<{ [nodeId: string]: INodeExecutionData[] }> {
    const errors = this.validator.validateWorkflow();
    if (errors.length > 0) {
      throw new Error(`Cannot execute invalid workflow: ${errors.join(", ")}`);
    }

    const executionOrder = this.validator.getExecutionOrder();
    this.logger.info(`Execution order: ${executionOrder.join(", ")}`);

    for (const nodeId of executionOrder) {
      this.currentNodeId = nodeId;
      const node = this.getNode(nodeId);
      if (!node) {
        this.logger.error(`Node ${nodeId} not found in workflow`);
        continue;
      }

      try {
        const nodeType = this.nodeTypesRegistry[node.type];
        if (!nodeType) {
          throw new Error(`Node type ${node.type} not found in registry`);
        }

        const inputData = this.getInputData();
        this.logger.info(
          `Node ${nodeId} input data: ${JSON.stringify(inputData)}`,
        );

        const outputData = await this.executor.executeNode(
          nodeType,
          node,
          inputData,
          this,
        );
        this.logger.info(
          `Node ${nodeId} produced output: ${JSON.stringify(outputData)}`,
        );
        this.nodeOutputs[nodeId] = outputData;
      } catch (error) {
        this.logger.error(
          `Execution error on node ${nodeId}: ${(error as Error).message}`,
        );
        if (node.onError === "stop") {
          throw new Error(`Workflow halted due to failure in node ${nodeId}`);
        }
        if (!node.continueOnFail) break;
      }
    }

    this.currentNodeId = null;
    return this.nodeOutputs;
  }

  getNodeOutput(nodeId: string): any {
    return this.nodeOutputs[nodeId];
  }

  getInputDataForNode(
    nodeId: string,
    nodeOutputs: { [nodeId: string]: INodeExecutionData[] },
  ): INodeExecutionData[] {
    const incomingConnections =
      this.workflow.connections.connectionsByDestinationNode[nodeId] || [];

    if (incomingConnections.length === 0) {
      const node = this.getNode(nodeId);
      if (node) {
        return [{ json: node.parameters }];
      }
      return [];
    }

    const inputData: INodeExecutionData[] = [];
    for (const conn of incomingConnections) {
      const sourceNodeOutput = nodeOutputs[conn.sourceNodeId];
      if (sourceNodeOutput) {
        inputData.push(...sourceNodeOutput);
      }
    }
    return inputData;
  }

  getNodeParameter(name: string, index: number, defaultValue?: any): any {
    if (this.currentNodeId === null) {
      throw new Error(
        "getNodeParameter called outside of node execution context",
      );
    }
    const node = this.getNode(this.currentNodeId);
    if (!node) {
      throw new Error(`Node with id ${this.currentNodeId} not found.`);
    }
    return node.parameters[name] ?? defaultValue;
  }

  getInputData(): INodeExecutionData[] {
    if (this.currentNodeId === null) {
      throw new Error("getInputData called outside of node execution context");
    }
    return this.getInputDataForNode(this.currentNodeId, this.nodeOutputs);
  }
}
