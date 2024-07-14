import { describe, it, expect } from "bun:test";
import { WorkflowEngine } from "../workflow";
import type { INode, INodeType, INodeExecutionData } from "../interfaces";
import nodeTypesRegistry from "../nodes/nodeTypeRegistry";

describe("WorkflowEngine Tests:", () => {
  it("create a simple workflow with a single node", () => {
    const engine = new WorkflowEngine(nodeTypesRegistry);
    const node: INode = {
      id: "1",
      name: "Test Node",
      type: "NoOpNode",
      typeVersion: 1,
      parameters: {},
    };
    engine.addNode(node);
    expect(engine.getNode("1")).toEqual(node);
  });

  it("create a workflow with a single node and check if the node is added correctly", () => {
    const engine = new WorkflowEngine(nodeTypesRegistry);
    const node: INode = {
      id: "1",
      name: "Test Node",
      type: "NoOpNode",
      typeVersion: 1,
      parameters: {},
    };
    engine.addNode(node);
    expect(engine.getNode("1")).toEqual(node);
  });

  it("create a workflow with multiple nodes and check if the nodes are added correctly", () => {
    const engine = new WorkflowEngine(nodeTypesRegistry);
    const nodes: INode[] = [
      {
        id: "1",
        name: "Test Node 1",
        type: "NoOpNode",
        typeVersion: 1,
        parameters: {},
      },
      {
        id: "2",
        name: "Test Node 2",
        type: "NoOpNode",
        typeVersion: 1,
        parameters: {},
      },
    ];
    nodes.forEach((node) => engine.addNode(node));
    expect(engine.getWorkflow().nodes.map((node) => node.id)).toEqual([
      "1",
      "2",
    ]);
  });

  it("create a workflow with multiple nodes and connections and check if the connections are added correctly", () => {
    const engine = new WorkflowEngine(nodeTypesRegistry);
    const nodes: INode[] = [
      {
        id: "1",
        name: "Test Node 1",
        type: "NoOpNode",
        typeVersion: 1,
        parameters: { input: "data1" },
      },
      {
        id: "2",
        name: "Test Node 2",
        type: "NoOpNode",
        typeVersion: 1,
        parameters: {},
      },
    ];
    nodes.forEach((node) => engine.addNode(node));
    engine.addConnection({ sourceNodeId: "1", destinationNodeId: "2" });
    const connections = engine.getNodeConnections("1");
    expect(connections.outgoing[0].destinationNodeId).toBe("2");
  });

  it("create a workflow with multiple nodes and connections and check if the execution order is correct", async () => {
    const engine = new WorkflowEngine(nodeTypesRegistry);
    const nodes: INode[] = [
      {
        id: "1",
        name: "Test Node 1",
        type: "NoOpNode",
        typeVersion: 1,
        parameters: { input: "data1" },
      },
      {
        id: "2",
        name: "Test Node 2",
        type: "NoOpNode",
        typeVersion: 1,
        parameters: {},
      },
    ];
    nodes.forEach((node) => engine.addNode(node));
    engine.addConnection({ sourceNodeId: "1", destinationNodeId: "2" });

    const workflowOutputs = await engine.executeWorkflow();
    const executionOrder = Object.keys(workflowOutputs);

    console.log("Execution order:", executionOrder);
    expect(executionOrder.length).toBe(2);
    expect(executionOrder).toEqual(["1", "2"]);
  });

  it("create a workflow with multiple nodes and connections and check if the node outputs are correct", async () => {
    const engine = new WorkflowEngine(nodeTypesRegistry);
    const nodes: INode[] = [
      {
        id: "1",
        name: "Test Node 1",
        type: "NoOpNode",
        typeVersion: 1,
        parameters: { input: "data1" },
      },
      {
        id: "2",
        name: "Test Node 2",
        type: "NoOpNode",
        typeVersion: 1,
        parameters: { input: "data2" },
      },
    ];
    nodes.forEach((node) => engine.addNode(node));
    engine.addConnection({ sourceNodeId: "1", destinationNodeId: "2" });

    const nodeOutputs = await engine.executeWorkflow();
    console.log("Node Outputs:", nodeOutputs);

    expect(nodeOutputs["1"]).toBeDefined();
    expect(nodeOutputs["1"][0].json["input"]).toBe("data1");

    expect(nodeOutputs["2"]).toBeDefined();
    // Assuming Node 2 receives the full output of Node 1, it should have the same 'input' parameter
    expect(nodeOutputs["2"][0].json["input"]).toBe("data1");
  });

  it("create a workflow with multiple nodes and connections and check if the input data for a node is correct through execution", async () => {
    const engine = new WorkflowEngine(nodeTypesRegistry);
    const nodes: INode[] = [
      {
        id: "1",
        name: "Test Node 1",
        type: "NoOpNode",
        typeVersion: 1,
        parameters: { input: "data1" },
      },
      {
        id: "2",
        name: "Test Node 2",
        type: "NoOpNode",
        typeVersion: 1,
        parameters: {},
      },
    ];
    nodes.forEach((node) => engine.addNode(node));
    engine.addConnection({ sourceNodeId: "1", destinationNodeId: "2" });

    const nodeOutputs = await engine.executeWorkflow();
    console.log("Node Outputs for Input Data Check:", nodeOutputs);

    // Verify node 2's input was processed from node 1's output
    expect(nodeOutputs["2"][0].json["input"]).toBe("data1"); // Checking input passed correctly
  });
});
