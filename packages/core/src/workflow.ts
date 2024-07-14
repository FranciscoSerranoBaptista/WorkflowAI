import type {
  IWorkflow,
  INodeTypes,
  INode,
  INodeExecutionData,
  IConnectionDetails,
  IExtendedNode,
  PromptMetaData,
} from "./interfaces";
import createWorkflowLogger from "./logger";
import { orchestrateLLMExecution } from "./agents";

export class WorkflowEngine {
  private nodeTypesRegistry: INodeTypes;
  private workflow: IWorkflow;
  private context: { [key: string]: any } = {};
  private logger: any;
  private prompts: { [key: string]: PromptMetaData };

  constructor(
    nodeTypesRegistry: INodeTypes,
    prompts: { [key: string]: PromptMetaData },
  ) {
    this.nodeTypesRegistry = nodeTypesRegistry;
    this.workflow = this.initializeEmptyWorkflow();
    this.logger = console; // Use console logger until workflow is set
    this.prompts = prompts;
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
    };
  }

  private getNodeInitialData(node: INode): INodeExecutionData[] {
    return [
      {
        json: node.parameters,
      },
    ];
  }

  // Set the workflow (e.g., after parsing YAML)
  setWorkflow(workflow: IWorkflow): void {
    this.workflow = workflow;
    this.logger = createWorkflowLogger(this.workflow.id);
  }

  // Get the current workflow
  getWorkflow(): IWorkflow {
    return this.workflow;
  }

  // Add a node to the workflow
  addNode(node: INode): void {
    if (this.workflow.nodes.some((n) => n.id === node.id)) {
      throw new Error(`Node with id ${node.id} already exists in the workflow`);
    }
    this.workflow.nodes.push(node);
  }

  // Remove a node from the workflow
  removeNode(nodeId: string): void {
    const index = this.workflow.nodes.findIndex((n) => n.id === nodeId);
    if (index === -1) {
      throw new Error(`Node with id ${nodeId} not found in the workflow`);
    }
    this.workflow.nodes.splice(index, 1);

    // Remove any connections involving this node
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

  // Validate a connection's input and output names (if provided)
  private validateConnectionNames(connection: IConnectionDetails) {
    const sourceNode = this.getNode(connection.sourceNodeId) as IExtendedNode;
    const destNode = this.getNode(
      connection.destinationNodeId,
    ) as IExtendedNode;

    if (
      connection.sourceOutputName &&
      !sourceNode.outputNames?.includes(connection.sourceOutputName)
    ) {
      throw new Error(
        `Invalid source output name: ${connection.sourceOutputName}`,
      );
    }

    if (
      connection.destinationInputName &&
      !destNode.inputNames?.includes(connection.destinationInputName)
    ) {
      throw new Error(
        `Invalid destination input name: ${connection.destinationInputName}`,
      );
    }
  }

  // Add a connection between nodes
  addConnection(connection: IConnectionDetails): void {
    this.validateConnectionNames(connection);
    if (
      !this.workflow.nodes.some((n) => n.id === connection.sourceNodeId) ||
      !this.workflow.nodes.some((n) => n.id === connection.destinationNodeId)
    ) {
      throw new Error("Source or destination node not found in the workflow");
    }

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

  // Remove a connection between nodes
  removeConnection(connection: IConnectionDetails): void {
    this.validateConnectionNames(connection);
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

  // Get a node by its ID
  getNode(nodeId: string): INode | undefined {
    return this.workflow.nodes.find((node) => node.id === nodeId);
  }

  // Update a node's properties
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

  // Set the start node of the workflow
  setStartNode(nodeId: string): void {
    if (!this.workflow.nodes.some((node) => node.id === nodeId)) {
      throw new Error(`Node with id ${nodeId} not found in the workflow`);
    }
    this.workflow.startNodeId = nodeId;
  }

  // Get all nodes without incoming connections (potential start nodes)
  getStartNodes(): INode[] {
    return this.workflow.nodes.filter(
      (node) =>
        !this.workflow.connections.connectionsByDestinationNode[node.id] ||
        this.workflow.connections.connectionsByDestinationNode[node.id]
          .length === 0,
    );
  }

  // Get all nodes without outgoing connections (potential end nodes)
  getEndNodes(): INode[] {
    return this.workflow.nodes.filter(
      (node) =>
        !this.workflow.connections.connectionsBySourceNode[node.id] ||
        this.workflow.connections.connectionsBySourceNode[node.id].length === 0,
    );
  }

  // Validate the workflow
  validateWorkflow(): string[] {
    const errors: string[] = [];

    // Check if there are any nodes
    if (this.workflow.nodes.length === 0) {
      errors.push("Workflow has no nodes");
    }

    // Check if all node types are registered
    for (const node of this.workflow.nodes) {
      if (!this.nodeTypesRegistry[node.type]) {
        errors.push(`Node type '${node.type}' is not registered`);
      }
    }

    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const detectCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const connections =
        this.workflow.connections.connectionsBySourceNode[nodeId] || [];
      for (const conn of connections) {
        if (detectCycle(conn.destinationNodeId)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of this.workflow.nodes) {
      if (detectCycle(node.id)) {
        errors.push("Workflow contains circular dependencies");
        break;
      }
    }

    // Check for disconnected nodes
    const connectedNodes = new Set<string>();
    const traverse = (nodeId: string) => {
      if (connectedNodes.has(nodeId)) return;
      connectedNodes.add(nodeId);
      const connections =
        this.workflow.connections.connectionsBySourceNode[nodeId] || [];
      for (const conn of connections) {
        traverse(conn.destinationNodeId);
      }
    };

    // Start traversal from all potential start nodes
    this.getStartNodes().forEach((node) => traverse(node.id));

    // Check if all nodes are connected
    for (const node of this.workflow.nodes) {
      if (!connectedNodes.has(node.id)) {
        errors.push(`Node '${node.id}' is disconnected from the workflow`);
      }
    }

    return errors;
  }

  // Execute the workflow, including clusters and LLM orchestration
  async executeWorkflow(): Promise<{ [nodeId: string]: INodeExecutionData[] }> {
    const errors = this.validateWorkflow();
    if (errors.length > 0) {
      throw new Error(`Cannot execute invalid workflow: ${errors.join(", ")}`);
    }

    const nodeOutputs: { [nodeId: string]: INodeExecutionData[] } = {};
    const executionOrder = this.getExecutionOrder();
    this.logger.info(`Execution order: ${executionOrder.join(", ")}`);

    for (const nodeId of executionOrder) {
      const node = this.getNode(nodeId);
      if (!node) {
        this.logger.error(`Node ${nodeId} not found in workflow`);
        continue; // Skip the execution of this node
      }

      const nodeType = this.nodeTypesRegistry[node.type];
      if (!nodeType) {
        this.logger.error(`Node type ${node.type} not found in registry`);
        continue; // Skip the execution of this node
      }

      if (node.type === "LLMClusterNode") {
        this.logger.info(`Executing LLM Cluster Node ${node.id}`);
        await orchestrateLLMExecution(
          nodeId,
          this.getNode.bind(this),
          this.nodeTypesRegistry,
        );
        continue; // Skip further normal execution of this node
      }

      this.logger.info(`Executing node ${node.id}`);
      for (let trial = 0; trial < (node.maxTries || 1); trial++) {
        try {
          const inputData = this.getInputDataForNode(nodeId, nodeOutputs);
          this.logger.info(
            `Node ${node.id} input data: ${JSON.stringify(inputData)}`,
          );
          const outputData = await nodeType.execute.call(node, inputData);
          this.logger.info(
            `Node ${node.id} produced output: ${JSON.stringify(outputData)}`,
          );
          nodeOutputs[nodeId] = outputData;
          break; // Break the retry loop
        } catch (error) {
          if (node.retryOnFail) {
            this.logger.warn(
              `Execution error on node ${node.id}, retrying... (${trial + 1}/${node.maxTries})`,
            );
            if (node.waitBetweenRetries) {
              await new Promise((resolve) =>
                setTimeout(resolve, node.waitBetweenRetries),
              );
            }
          } else {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            this.logger.error(
              `Execution error on node ${node.id}: ${errorMessage}`,
            );
            if (node.onError === "stop") {
              throw new Error(
                `Workflow halted due to failure in node ${node.id}`,
              );
            }
            if (!node.continueOnFail) break; // Exit retry loop if cannot continue on fail
          }
        }
      }
    }

    return nodeOutputs;
  }

  private getExecutionOrder(): string[] {
    const visited = new Set<string>();
    const executionOrder: string[] = [];

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const incomingConnections =
        this.workflow.connections.connectionsByDestinationNode[nodeId] || [];
      for (const conn of incomingConnections) {
        visit(conn.sourceNodeId);
      }

      executionOrder.push(nodeId);
    };

    // Start with nodes that have no incoming connections
    //this.getStartNodes().forEach((node) => visit(node.id));

    // Use a topological sort approach to determine execution order
    const topoSort = () => {
      const inDegree = new Map<string, number>();
      const queue: string[] = [];

      // Initialize in-degree of all nodes
      for (const node of this.workflow.nodes) {
        inDegree.set(node.id, 0);
      }

      // Compute in-degree of each node
      for (const nodeId of Object.keys(
        this.workflow.connections.connectionsBySourceNode,
      )) {
        for (const conn of this.workflow.connections.connectionsBySourceNode[
          nodeId
        ]) {
          inDegree.set(
            conn.destinationNodeId,
            (inDegree.get(conn.destinationNodeId) || 0) + 1,
          );
        }
      }

      // Collect nodes with zero in-degree
      for (const [nodeId, degree] of inDegree) {
        if (degree === 0) {
          queue.push(nodeId);
        }
      }

      while (queue.length > 0) {
        const nodeId = queue.shift()!;
        executionOrder.push(nodeId);

        // Reduce in-degree of neighboring nodes
        const connections =
          this.workflow.connections.connectionsBySourceNode[nodeId] || [];
        for (const conn of connections) {
          const destNodeId = conn.destinationNodeId;
          inDegree.set(destNodeId, (inDegree.get(destNodeId) || 0) - 1);
          if (inDegree.get(destNodeId) === 0) {
            queue.push(destNodeId);
          }
        }
      }
    };

    topoSort();

    return executionOrder;
  }

  private getInputDataForNode(
    nodeId: string,
    nodeOutputs: { [nodeId: string]: INodeExecutionData[] },
  ): INodeExecutionData[] {
    const incomingConnections =
      this.workflow.connections.connectionsByDestinationNode[nodeId] || [];

    if (incomingConnections.length === 0) {
      // If no incoming connections, use node's initial parameters as input data
      const node = this.getNode(nodeId);
      if (node) {
        return this.getNodeInitialData(node);
      }

      return [];
    }

    const inputData: INodeExecutionData[] = [];

    for (const conn of incomingConnections) {
      const sourceNodeOutput = nodeOutputs[conn.sourceNodeId];

      // Check if the source node has a defined output
      const sourceNode = this.getNode(conn.sourceNodeId);
      if (sourceNode && this.prompts[sourceNode.name]?.output) {
        const outputKey = this.prompts[sourceNode.name].output!;
        const specificOutput =
          sourceNodeOutput?.[0]?.json?.[outputKey] || "<Default Value>";
        inputData.push({
          json: {
            ...sourceNodeOutput[0]?.json,
            [conn.destinationInputName || ""]: specificOutput,
          },
        });
      } else {
        if (sourceNodeOutput) {
          if (conn.destinationInputName && conn.sourceOutputName) {
            inputData.push({
              json: {
                inputName: conn.destinationInputName,
                output: sourceNodeOutput,
              },
            });
          } else {
            inputData.push(...sourceNodeOutput);
          }
        } else {
          console.warn(`No output found for source node ${conn.sourceNodeId}`);
        }
      }
    }

    return inputData;
  }

  // Get all nodes of a specific type
  getNodesOfType(type: string): INode[] {
    return this.workflow.nodes.filter((node) => node.type === type);
  }

  // Get all connections for a specific node
  getNodeConnections(nodeId: string): {
    incoming: IConnectionDetails[];
    outgoing: IConnectionDetails[];
  } {
    return {
      incoming:
        this.workflow.connections.connectionsByDestinationNode[nodeId] || [],
      outgoing: this.workflow.connections.connectionsBySourceNode[nodeId] || [],
    };
  }

  // Clone the current workflow
  cloneWorkflow(): IWorkflow {
    return JSON.parse(JSON.stringify(this.workflow));
  }

  // Export the workflow to JSON
  exportWorkflow(): string {
    return JSON.stringify(this.workflow, null, 2);
  }

  // Import a workflow from JSON
  importWorkflow(json: string): void {
    try {
      const workflow = JSON.parse(json) as IWorkflow;
      // Validate the imported workflow structure
      if (
        !workflow.id ||
        !workflow.name ||
        !Array.isArray(workflow.nodes) ||
        !workflow.connections
      ) {
        throw new Error("Invalid workflow structure");
      }
      this.workflow = workflow;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to import workflow: ${error.message}`);
      } else {
        throw new Error(`Failed to import workflow: Unknown error`);
      }
    }
  }

  // Get a summary of the workflow
  getWorkflowSummary(): {
    nodeCount: number;
    connectionCount: number;
    nodeTypes: { [type: string]: number };
  } {
    const nodeTypes: { [type: string]: number } = {};
    this.workflow.nodes.forEach((node) => {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    });

    const connectionCount = Object.values(
      this.workflow.connections.connectionsBySourceNode,
    ).reduce((sum, conns) => sum + conns.length, 0);

    return {
      nodeCount: this.workflow.nodes.length,
      connectionCount,
      nodeTypes,
    };
  }

  // Check if the workflow is valid and ready to execute
  isWorkflowExecutable(): boolean {
    const errors = this.validateWorkflow();
    return errors.length === 0;
  }

  // Set the name of the workflow
  setWorkflowName(name: string): void {
    this.workflow.name = name;
  }

  // Set the ID of the workflow
  setWorkflowId(id: string): void {
    this.workflow.id = id;
  }

  // Set the active state of the workflow
  setWorkflowActive(active: boolean): void {
    this.workflow.active = active;
  }

  // Clear the current workflow
  clearWorkflow(): void {
    this.workflow = this.initializeEmptyWorkflow();
  }

  // Get a list of all node IDs in the workflow
  getNodeIds(): string[] {
    return this.workflow.nodes.map((node) => node.id);
  }

  // Check if a node with a given ID exists in the workflow
  hasNode(nodeId: string): boolean {
    return this.workflow.nodes.some((node) => node.id === nodeId);
  }

  // Get the total number of nodes in the workflow
  getNodeCount(): number {
    return this.workflow.nodes.length;
  }

  // Get the total number of connections in the workflow
  getConnectionCount(): number {
    return Object.values(
      this.workflow.connections.connectionsBySourceNode,
    ).reduce((sum, conns) => sum + conns.length, 0);
  }
}
