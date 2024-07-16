import { Command } from "commander";
import dotenv from "dotenv";
import path from "path";
import { getLogger } from "workflowai.common";
import { nodeRegistry } from "workflowai.nodes";
import { WorkflowEngine } from "workflowai.workflow";
import { loadPrompts } from "./utils";
import { WorkflowBuilder } from "./WorkflowBuilder";

const program = new Command();
const logger = getLogger();

program
  .version("1.0.0")
  .description("Workflow CLI to manage and execute AI-driven workflows");

program
  .command("execute <file>")
  .description("Execute the given workflow described in the YAML file")
  .option("-d, --base-dir <path>", "Set the base directory for file operations")
  .action(async (file, options) => {
    try {
      // Load environment variables
      dotenv.config();

      // Set the WORKFLOW_BASE_DIR
      if (options.baseDir) {
        process.env.WORKFLOW_BASE_DIR = path.resolve(options.baseDir);
      } else if (!process.env.WORKFLOW_BASE_DIR) {
        process.env.WORKFLOW_BASE_DIR = path.resolve("./");
      }

      logger.info(`Using base directory: ${process.env.WORKFLOW_BASE_DIR}`);

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
  });

program.parse(process.argv);
