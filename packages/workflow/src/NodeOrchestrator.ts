// NodeOrchestrator.ts
import type { INode, INodeExecutionData, IWorkflow } from "workflowai.common";
import { WorkflowError } from "workflowai.common";
import { getLogger } from "workflowai.common";

export class NodeOrchestrator {
  private workflow: IWorkflow;
  private nodeExecutionData: { [nodeId: string]: INodeExecutionData[] } = {};
  private logger: ReturnType<typeof getLogger>;

  constructor(workflow: IWorkflow) {
    this.workflow = workflow;
    this.logger = getLogger();
  }

  getNode(nodeId: string): INode | undefined {
    return this.workflow.nodes.find((node) => node.id === nodeId);
  }

  setNodeExecutionData(nodeId: string, data: INodeExecutionData[]): void {
    this.nodeExecutionData[nodeId] = data;
  }

  getNodeExecutionData(nodeId: string): INodeExecutionData[] {
    return this.nodeExecutionData[nodeId] || [];
  }

  getNodeParameter(nodeId: string, name: string, defaultValue?: any): any {
    const node = this.getNode(nodeId);
    if (!node) {
      throw new WorkflowError(`Node with id ${nodeId} not found.`);
    }
    return node.parameters[name] ?? defaultValue;
  }

  getInputDataForNode(nodeId: string): INodeExecutionData[] {
    const incomingConnections = this.workflow.connections.connectionsByDestinationNode[nodeId] || [];

    if (incomingConnections.length === 0) {
      const node = this.getNode(nodeId);
      if (node) {
        return [{ json: node.parameters }];
      }
      return [];
    }

    const inputData: INodeExecutionData[] = [];
    for (const conn of incomingConnections) {
      const sourceNodeOutput = this.nodeExecutionData[conn.sourceNodeId];
      if (sourceNodeOutput) {
        inputData.push(...sourceNodeOutput);
      }
    }
    return inputData;
  }

  getWorkflow(): IWorkflow {
    return this.workflow;
  }
}
