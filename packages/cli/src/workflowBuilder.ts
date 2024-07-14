import fs from "fs";
import yaml from "js-yaml";
import {
  IWorkflow,
  INode,
  INodeTypes,
  IConnectionDetails,
} from "workspace:packages/core";

interface ConfigSection {
  id: string;
  type: string;
  config: {
    provider: string;
    [key: string]: any;
  };
  sections?: ConfigSection[];
}

interface YamlWorkflow {
  workflow: {
    startNode: string;
    endNode: string;
  };
  workflows: {
    main: {
      sections: ConfigSection[];
    };
  };
}

export class WorkflowBuilder {
  private yamlData: YamlWorkflow;

  constructor(filePath: string) {
    const fileContents = fs.readFileSync(filePath, "utf8");
    this.yamlData = yaml.load(fileContents) as YamlWorkflow;
  }

  public buildWorkflow(): IWorkflow {
    const nodes: INode[] = [];
    const connections: IConnectionDetails[] = [];

    const traverseSections = (sections: ConfigSection[], parentId?: string) => {
      sections.forEach((section) => {
        const node: INode = {
          id: section.id,
          name: section.id,
          type: section.type,
          typeVersion: 1,
          parameters: section.config,
        };

        nodes.push(node);

        if (parentId) {
          // Create connection from parent to current node
          connections.push({
            sourceNodeId: parentId,
            destinationNodeId: section.id,
          });
        }

        if (section.sections) {
          traverseSections(section.sections, section.id);
        }
      });
    };

    traverseSections(this.yamlData.workflows.main.sections);

    return {
      id: "auto-generated-id", // Generate a unique ID for the workflow
      name: "auto-generated-workflow", // Provide a meaningful name for the workflow
      nodes: nodes,
      connections: {
        connectionsBySourceNode: this.groupConnectionsBySourceNode(connections),
        connectionsByDestinationNode:
          this.groupConnectionsByDestinationNode(connections),
      },
      active: true,
      startNodeId: this.yamlData.workflow.startNode,
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
