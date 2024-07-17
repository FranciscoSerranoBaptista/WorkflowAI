// utils.ts

import { WorkflowEngine } from "./WorkflowEngine"; // Adjust the import path as necessary
import type { INode } from "workflowai.common";

export function createGetNodeFunction(engine: WorkflowEngine) {
  return (nodeId: string): INode | undefined => {
    return engine.getNode(nodeId);
  };
}
