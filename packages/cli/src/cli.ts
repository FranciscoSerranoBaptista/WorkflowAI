import { Command } from "commander";
import { WorkflowEngine } from "workflowai.core";
import nodeTypesRegistry from "../../core/src/nodes/nodeTypeRegistry";
import { loadPrompts } from "./utils";
import { WorkflowBuilder } from "./workflowBuilder";

const program = new Command();

program
  .version("1.0.0")
  .description("Workflow CLI to manage and execute AI-driven workflows");

program
  .command("execute <file>")
  .description("Execute the given workflow described in the YAML file")
  .action(async (file) => {
    try {
      // Parse and build the workflow
      const builder = new WorkflowBuilder(file);
      const workflow = builder.buildWorkflow();

      // Load prompts metadata
      const prompts = loadPrompts();

      // Create the workflow engine
      const engine = new WorkflowEngine(nodeTypesRegistry, prompts);
      engine.setWorkflow(workflow);

      // Execute the workflow
      const result = await engine.executeWorkflow();
      console.log("Workflow executed successfully:", result);
    } catch (error) {
      console.error("Failed to execute workflow:", error);
    }
  });

program.parse(process.argv);
