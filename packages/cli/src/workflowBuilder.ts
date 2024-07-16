import Ajv from "ajv";
import fs from "fs";
import yaml from "js-yaml";
import { getLogger } from "workflowai.common";
import type {
  IConnectionDetails,
  INode,
  IWorkflow,
  PromptMetaData,
} from "workflowai.common";
import schema from "../schema/workflow.schema.json";
import { loadPrompts } from "./utils";
import {
  WorkflowError,
  ValidationError,
  ApplicationError,
} from "workflowai.common";

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
  private logger: ReturnType<typeof getLogger>;

  constructor(filePath: string) {
    const workflowId = this.generateUniqueId();
    this.logger = getLogger(workflowId);

    this.logger.debug(`Initializing WorkflowBuilder with file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      this.logger.error(`File not found: ${filePath}`);
      throw new ApplicationError(`File not found: ${filePath}`);
    }
    if (!fs.lstatSync(filePath).isFile()) {
      this.logger.error(`Not a file: ${filePath}`);
      throw new ApplicationError(`Not a file: ${filePath}`);
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    this.logger.debug(`File contents loaded: ${filePath}`);

    this.yamlData = yaml.load(fileContents) as YamlWorkflow;

    // Validate YAML content against schema before proceeding
    this.validateAgainstSchema(this.yamlData);

    this.prompts = loadPrompts();
    this.logger.debug(`Prompts loaded successfully`);
  }

  private validateAgainstSchema(data: any): void {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid && validate.errors) {
      const validationErrors = validate.errors
        .map((error) => `${error.instancePath} ${error.message}`)
        .join("; ");
      this.logger.error("Schema validation errors:", validationErrors);
      throw new ValidationError(validationErrors);
    } else if (!valid) {
      this.logger.error(
        "Schema validation failed, but no errors provided by Ajv.",
      );
      throw new ValidationError(
        "Schema validation failed with an unknown error.",
      );
    }
    this.logger.debug(`YAML content validated against schema successfully`);
  }

  public buildWorkflow(): IWorkflow {
    const nodes: INode[] = [];
    const connections: IConnectionDetails[] = [];

    this.yamlData.tasks.forEach((task) => {
      const node: INode = {
        id: task.id,
        name: task.id,
        type: task.type,
        typeVersion: 1,
        parameters: task.config,
      };

      this.logger.debug(`Processing task: ${task.id} of type: ${task.type}`);

      switch (task.type) {
        case "read_file":
          node.type = "fileRead";
          break;
        case "write_file":
          node.type = "fileWrite";
          break;
        case "ai_agent":
          node.type = "LLMClusterNode";
          const promptId = task.config.promptId;
          this.logger.debug(
            `Processing task: ${task.id} with promptId: ${promptId}`,
          );

          if (promptId) {
            const prompt = this.prompts[promptId];
            if (prompt) {
              // Instead of interpolating here, we'll just store the promptId
              node.parameters.promptId = promptId;
              // We'll also store the original prompt content for later use
              node.parameters.promptTemplate = prompt.content;
            } else {
              this.logger.error(
                `Unknown promptId ${promptId} for task: ${task.id}`,
              );
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
          break;
        case "search_request":
          // Handle search_request type
          node.type = "searchRequest";
          break;
        default:
          this.logger.error(`Unknown task type: ${task.type}`);
          throw new WorkflowError(`Unknown task type: ${task.type}`);
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

    this.logger.debug(`Start Node ID: ${startNodeId}`);
    this.logger.debug(`End Node ID: ${endNodeId}`);

    return {
      id: this.generateUniqueId(),
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

  private generateUniqueId() {
    return "_" + Math.random().toString(36).substr(2, 9);
  }
}
