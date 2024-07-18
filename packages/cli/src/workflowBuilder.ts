import fs from "fs";
import type { IWorkflow } from "workflowai.common";
import { ApplicationError, getLogger } from "workflowai.common";
import { ConnectionBuilder } from "./ConnectionBuilder";
import { NodeBuilder } from "./NodeBuilder";
import { PromptManager } from "./PromptManager";
import { SchemaValidator } from "./SchemaValidator";
import { YamlParser } from "./YamlParser";
import { getGlobalWorkflowId } from "workflowai.common";

export class WorkflowBuilder {
  private yamlParser: YamlParser;
  private schemaValidator: SchemaValidator;
  private nodeBuilder: NodeBuilder;
  private connectionBuilder: ConnectionBuilder;
  private promptManager: PromptManager;
  private logger: ReturnType<typeof getLogger>;

  constructor(filePath: string) {
    this.logger = getLogger({ module: "WorkflowBuilder" });
    this.logger.debug(`Initializing WorkflowBuilder with file: ${filePath}`);

    this.validateFilePath(filePath);

    this.yamlParser = new YamlParser(filePath);
    const yamlData = this.yamlParser.parse();

    this.schemaValidator = new SchemaValidator();
    this.schemaValidator.validate(yamlData);

    this.promptManager = new PromptManager();
    const prompts = this.promptManager.loadPrompts();

    this.nodeBuilder = new NodeBuilder(yamlData.tasks, prompts);
    this.connectionBuilder = new ConnectionBuilder(yamlData.tasks);
  }

  private validateFilePath(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      this.logger.error(`File not found: ${filePath}`);
      throw new ApplicationError(`File not found: ${filePath}`);
    }
    if (!fs.lstatSync(filePath).isFile()) {
      this.logger.error(`Not a file: ${filePath}`);
      throw new ApplicationError(`Not a file: ${filePath}`);
    }
  }

  public buildWorkflow(): IWorkflow {
    const nodes = this.nodeBuilder.buildNodes();
    const connections = this.connectionBuilder.buildConnections();

    const startNodeId = this.nodeBuilder.findStartNodeId(nodes, connections);
    const endNodeId = this.nodeBuilder.findEndNodeId(nodes, connections);

    this.logger.debug(`Start Node ID: ${startNodeId}`);
    this.logger.debug(`End Node ID: ${endNodeId}`);

    return {
      id: getGlobalWorkflowId(),
      name: "auto-generated-workflow",
      nodes,
      connections: {
        connectionsBySourceNode:
          this.connectionBuilder.groupConnectionsBySourceNode(connections),
        connectionsByDestinationNode:
          this.connectionBuilder.groupConnectionsByDestinationNode(connections),
      },
      active: true,
      startNodeId: startNodeId || "",
    };
  }

}
