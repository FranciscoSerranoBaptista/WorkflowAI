import fs from "fs";
import yaml from "js-yaml";
import { join } from "path";
import type {
  IConnectionDetails,
  INode,
  IWorkflow,
  PromptMetaData,
} from "workflowai.core";
import { interpolatePrompt } from "workflowai.core";
import { loadPrompts } from "./utils";

interface ConfigSection {
  id: string;
  type: string;
  dependencies?: string[];
  config: {
    [key: string]: any;
    outputs?: { [key: string]: string };
  };
}

interface YamlWorkflow {
  settings: { [key: string]: any };
  tasks: ConfigSection[];
}

export class WorkflowBuilder {
  private yamlData: YamlWorkflow;
  private prompts: { [key: string]: PromptMetaData };

  constructor(filePath: string) {
    const fileContents = fs.readFileSync(filePath, "utf8");
    this.yamlData = yaml.load(fileContents) as YamlWorkflow;
    this.prompts = loadPrompts();
  }

  public buildWorkflow(): IWorkflow {
    const nodes: INode[] = [];
    const connections: IConnectionDetails[] = [];

    const uniqueId = () => "_" + Math.random().toString(36).substr(2, 9);

    this.yamlData.tasks.forEach((task) => {
      const node: INode = {
        id: task.id,
        name: task.id,
        type: task.type,
        typeVersion: 1,
        parameters: task.config,
      };

      // Set the correct node type based on the task type in the YAML
      switch (task.type) {
        case "fileRead":
          node.type = "fileRead";
          break;
        case "fileWrite":
          node.type = "fileWrite";
          break;
        default:
          if (this.prompts[task.type]) {
            const prompt = this.prompts[task.type];
            node.type = "openaiTool"; // Assuming this is the type for OpenAI nodes
            node.parameters.prompt = interpolatePrompt(
              prompt.content,
              task.config,
            );
          } else {
            throw new Error(`Unknown task type: ${task.type}`);
          }
      }

      nodes.push(node);

      if (task.dependencies) {
        task.dependencies.forEach((depId) => {
          connections.push({
            sourceNodeId: depId,
            destinationNodeId: task.id,
          });
        });
      }
    });

    const startNodeId = nodes.find((node) =>
      connections.every((conn) => conn.destinationNodeId !== node.id),
    )?.id;
    const endNodeId = nodes.find((node) =>
      connections.every((conn) => conn.sourceNodeId !== node.id),
    )?.id;

    return {
      id: uniqueId(),
      name: "auto-generated-workflow",
      nodes: nodes,
      connections: {
        connectionsBySourceNode: this.groupConnectionsBySourceNode(connections),
        connectionsByDestinationNode:
          this.groupConnectionsByDestinationNode(connections),
      },
      active: true,
      startNodeId: startNodeId || "",
    };
  }

  private groupConnectionsBySourceNode(connections: IConnectionDetails[]) {
    return connections.reduce(
      (acc, conn) => {
        if (!acc[conn.sourceNodeId]) {
          acc[conn.sourceNodeId] = [];
        }
        acc[conn.sourceNodeId].push(conn);
        return acc;
      },
      {} as { [key: string]: IConnectionDetails[] },
    );
  }

  private groupConnectionsByDestinationNode(connections: IConnectionDetails[]) {
    return connections.reduce(
      (acc, conn) => {
        if (!acc[conn.destinationNodeId]) {
          acc[conn.destinationNodeId] = [];
        }
        acc[conn.destinationNodeId].push(conn);
        return acc;
      },
      {} as { [key: string]: IConnectionDetails[] },
    );
  }
}
