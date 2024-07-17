import { FileReadWriteNode } from "./Files/ReadWriteFile/ReadWriteFile.node";
import { AiAgentNode } from "./aiAgent/aiAgent.node";
import { NoOpNode } from "./NoOp/NoOp.node";
import { DataTransformerNode } from "./DataTransformer/DataTransformer.node";

export const nodeRegistry = {
  read_write_file: new FileReadWriteNode(),
  ai_agent: new AiAgentNode(),
  noop: new NoOpNode(),
  data_transformer: new DataTransformerNode(),
  // Add other nodes here...
};
