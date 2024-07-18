import type { IConnectionDetails } from "workflowai.common";
import { getLogger } from "workflowai.common";
import type { ConfigSection } from "./types";

export class ConnectionBuilder {
  constructor(
    private tasks: ConfigSection[],
    private logger: ReturnType<typeof getLogger> = getLogger({ module: "ConnectionBuilder" })
  ) { }

  public buildConnections(): IConnectionDetails[] {
    const connections: IConnectionDetails[] = [];
    this.tasks.forEach((task) => {
      if (task.dependencies) {
        task.dependencies.forEach((depId) => {
          connections.push({
            sourceNodeId: depId,
            destinationNodeId: task.id,
          });
        });
      }
    });
    return connections;
  }

  public groupConnectionsBySourceNode(connections: IConnectionDetails[]) {
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

  public groupConnectionsByDestinationNode(connections: IConnectionDetails[]) {
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
