import type {
  INode,
  PromptMetaData,
  IConnectionDetails,
} from "workflowai.common";
import { WorkflowError } from "workflowai.common";
import type { ConfigSection } from "./types";
import { getLogger } from "workflowai.common";

export class NodeBuilder {
  constructor(
    private tasks: ConfigSection[],
    private prompts: { [key: string]: PromptMetaData },
    private logger: ReturnType<typeof getLogger> = getLogger(),
  ) {}

  public buildNodes(): INode[] {
    return this.tasks.map((task) => {
      const node = this.createNode(task);
      this.processTaskType(task, node);
      return node;
    });
  }

  private createNode(task: ConfigSection): INode {
    return {
      id: task.id,
      name: task.id,
      type: task.type,
      typeVersion: 1,
      parameters: task.config,
    };
  }

  private processTaskType(task: ConfigSection, node: INode): void {
    this.logger.debug(`Processing task: ${task.id} of type: ${task.type}`);
    switch (task.type) {
      case "read_write_file":
        node.type = "read_write_file";
        break;
      case "ai_agent":
        this.processAiAgentTask(task, node);
        break;
      case "search_request":
        node.type = "searchRequest";
        break;
      default:
        this.logger.error(`Unknown task type: ${task.type}`);
        throw new WorkflowError(`Unknown task type: ${task.type}`);
    }
  }

  private processAiAgentTask(task: ConfigSection, node: INode): void {
    node.type = "ai_agent";
    const promptId = task.config.promptId;
    this.logger.debug(`Building task: ${task.id} with promptId: ${promptId}`);

    if (promptId) {
      const prompt = this.prompts[promptId];
      if (prompt) {
        node.parameters.promptId = promptId;
        node.parameters.promptTemplate = prompt.content;
      } else {
        this.logger.error(`Unknown promptId ${promptId} for task: ${task.id}`);
        throw new WorkflowError(`Unknown promptId: ${promptId}`);
      }
    } else {
      this.logger.error(
        `Missing promptId in configuration for task: ${task.id}`,
      );
      throw new WorkflowError(
        `Missing promptId in configuration for task: ${task.id}`,
      );
    }
  }

  public findStartNodeId(
    nodes: INode[],
    connections: IConnectionDetails[],
  ): string | undefined {
    return nodes.find((node) =>
      connections.every((conn) => conn.destinationNodeId !== node.id),
    )?.id;
  }

  public findEndNodeId(
    nodes: INode[],
    connections: IConnectionDetails[],
  ): string | undefined {
    return nodes.find((node) =>
      connections.every((conn) => conn.sourceNodeId !== node.id),
    )?.id;
  }
}
