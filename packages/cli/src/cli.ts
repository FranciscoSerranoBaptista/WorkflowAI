import { command, run, string, option, positional, subcommands } from "cmd-ts";
import dotenv from "dotenv";
import path from "path";
import { nodeRegistry } from "workflowai.nodes";
import { WorkflowEngine } from "workflowai.workflow";
import { loadPrompts } from "./utils";
import { WorkflowBuilder } from "./WorkflowBuilder";
import { v4 as uuidv4 } from 'uuid'; // Using uuid for unique ID generation
import { getLogger } from "workflowai.common";

const executeCommand = command({
  name: "execute",
  description: "Execute the given workflow described in the YAML file",
  args: {
    file: positional({
      type: string,
      displayName: "file",
      description: "The YAML file describing the workflow",
    }),
    baseDir: option({
      type: string,
      long: "base-dir",
      short: "d",
      description: "Set the base directory for file operations",
      defaultValue: () => process.cwd(),
    }),
  },
  handler: async ({ file, baseDir }) => {
    try {

      // Load environment variables
      dotenv.config();

      // Set the WORKFLOW_BASE_DIR
      process.env.WORKFLOW_BASE_DIR = path.resolve(baseDir);

      // Parse and build the workflow
      const builder = new WorkflowBuilder(file);
      const workflow = builder.buildWorkflow();

      // Load prompts metadata
      const prompts = loadPrompts();

      // Create the workflow engine
      const engine = new WorkflowEngine(nodeRegistry);
      engine.setWorkflow(workflow);

      // Execute the workflow
      const result = await engine.executeWorkflow();
      console.log("Workflow executed successfully:", result);
    } catch (error) {
      console.error("Failed to execute workflow:", error);
    }
  },
});

const cli = subcommands({
  name: "workflow-cli",
  description: "Workflow CLI to manage and execute AI-driven workflows",
  version: "1.0.0",
  cmds: { execute: executeCommand },
});

run(cli, process.argv.slice(2));
