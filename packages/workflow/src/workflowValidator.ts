import type { IWorkflow, IConnectionDetails, INode } from "workflowai.common";
import type { Logger } from "winston";

export class WorkflowValidator {
  private workflow: IWorkflow;
  private logger: Logger;

  constructor(workflow: IWorkflow, logger: Logger) {
    this.workflow = workflow;
    this.logger = logger;
  }

  setWorkflow(workflow: IWorkflow): void {
    this.workflow = workflow;
  }

  validateConnectionNames(connection: IConnectionDetails): void {
    const sourceNode = this.workflow.nodes.find(
      (n) => n.id === connection.sourceNodeId,
    );
    const destNode = this.workflow.nodes.find(
      (n) => n.id === connection.destinationNodeId,
    );

    if (connection.sourceOutputName && sourceNode) {
      const sourceOutputs = sourceNode.parameters.outputs as
        | string[]
        | undefined;
      if (!sourceOutputs?.includes(connection.sourceOutputName)) {
        throw new Error(
          `Invalid source output name: ${connection.sourceOutputName}`,
        );
      }
    }

    if (connection.destinationInputName && destNode) {
      const destInputs = destNode.parameters.inputs as string[] | undefined;
      if (!destInputs?.includes(connection.destinationInputName)) {
        throw new Error(
          `Invalid destination input name: ${connection.destinationInputName}`,
        );
      }
    }
  }

  validateWorkflow(): string[] {
    const errors: string[] = [];

    if (this.workflow.nodes.length === 0) {
      errors.push("Workflow has no nodes");
    }

    this.checkForCircularDependencies(errors);
    this.checkForDisconnectedNodes(errors);

    return errors;
  }

  private checkForCircularDependencies(errors: string[]): void {
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
  }

  private checkForDisconnectedNodes(errors: string[]): void {
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
  }

  getExecutionOrder(): string[] {
    const executionOrder: string[] = [];
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

    return executionOrder;
  }

  private getStartNodes(): INode[] {
    return this.workflow.nodes.filter(
      (node) =>
        !this.workflow.connections.connectionsByDestinationNode[node.id] ||
        this.workflow.connections.connectionsByDestinationNode[node.id]
          .length === 0,
    );
  }
}
