import { FileReadWriteNode } from "./Files/ReadWriteFile/ReadWriteFile.node";
import { AiAgentNode } from "./aiAgent/aiAgent.node";
import { NoOpNode } from "./NoOp/NoOp.node";

export const nodeRegistry = {
  fileReadWrite: new FileReadWriteNode(),
  aiAgent: new AiAgentNode(),
  noop: new NoOpNode(),
  // Add other nodes here...
};
