import type { INodeTypes } from "../interfaces";
import NoOpNode from "./noOpNode";
import { LLMNode } from "./llmNode";
import { fileReadNode } from "./fileReadNode";
import { fileWriteNode } from "./fileWriteNode";

const nodeTypesRegistry: INodeTypes = {
  NoOpNode,
  LLMNode,
  fileReadNode,
  fileWriteNode,
  // Add other node types here
};

export default nodeTypesRegistry;
