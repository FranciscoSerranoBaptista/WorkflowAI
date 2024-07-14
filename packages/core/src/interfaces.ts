// Interfaces.ts

/**
 * Generic interface representing JSON-compatible data payload.
 * All keys are strings and values can be any JSON-compatible type.
 */
export interface IDataObject {
  [key: string]: any;
}

/**
 * Interface representing the structure for binary data.
 * Each key is a string and values should contain metadata or references for binary data.
 */
export interface IBinaryKeyData {
  [key: string]: {
    data: Buffer | string; // Actual binary data, could be Buffer or a base64 string
    mimeType: string; // Mime type of the data
    fileName?: string; // Optional file name
  };
}

/**
 * Interface representing the execution data passed to and from nodes.
 * Contains the main payload in JSON format and optional binary data.
 */
export interface INodeExecutionData {
  json: IDataObject; // The main JSON data payload
  binary?: IBinaryKeyData; // Optional binary data
}

/**
 * Interface representing a workflow node.
 * Contains various attributes defining the node's configuration and behavior.
 */
export interface INode {
  id: string; // Unique identifier for the node
  name: string; // Name of the node
  typeVersion: number; // Version of the node type
  type: string; // The type of node (e.g., "HTTP Request", "LLM Call")
  retryOnFail?: boolean; // Whether the node should retry on failure
  maxTries?: number; // Maximum number of retry attempts
  waitBetweenRetries?: number; // Time to wait between retries (in milliseconds)
  executeOnce?: boolean; // Whether the node should execute only once
  onError?: "stop" | "continue"; // Error handling strategy on node error
  continueOnFail?: boolean; // Whether to continue workflow execution on failure
  parameters: IDataObject; // Parameters specific to the node
  credentials?: IDataObject; // Optional credentials for the node
}

/**
 * Interface representing the execute function which nodes will implement.
 * This method is called when the node executes.
 */
export interface IExecuteFunction {
  (this: INode, input: INodeExecutionData[]): Promise<INodeExecutionData[]>;
}

/**
 * Interface representing a node type definition.
 * Contains metadata about the node type and its execute function.
 */
export interface INodeType {
  type: string; // The type identifier of the node (e.g., "HTTP Request", "LLM Call")
  displayName: string; // Human readable name for the node type
  description: string; // Description of what the node type does
  version: number; // Version number of the node type
  execute: IExecuteFunction; // Function that contains the node execution logic
}

// Extend INode to include input and output names
export interface IExtendedNode extends INode {
  outputNames?: string[]; // List of possible output names
  inputNames?: string[]; // List of possible input names
}

/**
 * Interface representing the collection of all available node types.
 * Indexed by node type identifier.
 */
export interface INodeTypes {
  [nodeType: string]: INodeType; // Holds the INodeType objects, indexed by their type string
}

/**
 * Represents a single connection between a source node and a destination node.
 */
export interface IConnectionDetails {
  sourceNodeId: string; // ID of the node where the connection starts
  sourceOutputName?: string; // Optional name of the output port on the source node
  destinationNodeId: string; // ID of the node where the connection ends
  destinationInputName?: string; // Optional name of the input port on the destination node
}

/**
 * Interface representing the connections between nodes.
 * Connections are indexed by source node name and destination node name.
 */
export interface IConnections {
  connectionsBySourceNode: {
    [sourceNodeId: string]: IConnectionDetails[]; // Connections indexed by source node ID
  };
  connectionsByDestinationNode: {
    [destinationNodeId: string]: IConnectionDetails[]; // Connections indexed by destination node ID
  };
}

/**
 * Interface representing a workflow.
 * Contains the overall configuration and structure of the workflow,
 * including nodes and connections.
 */
export interface IWorkflow {
  id: string; // Unique identifier for the workflow
  name: string; // Name of the workflow
  nodes: INode[]; // List of nodes in the workflow
  connections: IConnections; // Connections between nodes, indexed by source and destination
  active: boolean; // Indicates if the workflow is active
  startNodeId?: string; // Optional property for the start node ID
}

/**
 * Interface for holding LLM-specific configuration for a node.
 */
export interface ILLMConfig {
  provider: string; // The LLM provider (e.g., "OpenAI", "GPT-3", etc.)
  model: string; // The specific LLM model to use
  temperature?: number; // The temperature for the LLM's output (controls creativity)
  maxTokens?: number; // The maximum number of tokens to generate
  prompt: string; // The prompt template containing variables to be replaced
}

/**
 * Interface representing a node type definition for LLM calls.
 * Extends the base INodeType to include LLM-specific configuration.
 */
export interface ILLMNodeType extends INodeType {
  llmConfig: ILLMConfig; // LLM-specific configuration
}

/**
 * Extend INode to include LLM-specific properties if applicable.
 */
export interface ILLMNode extends INode {
  llmConfig: ILLMConfig; // LLM-specific configuration
}
