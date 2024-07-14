import { Command } from "commander";
import { WorkflowBuilder } from "./workflowBuilder";
import { WorkflowEngine } from "./workflow";

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

      // Create workflow engine and set the workflow
      const nodeTypesRegistry: NodeTypesRegistry = {
        // Define or load your node types here (e.g., HTTP nodes, OpenAI nodes, etc.)
        // For example, see the next section about setting up node types registry
      };

      const engine = new WorkflowEngine(nodeTypesRegistry);
      engine.setWorkflow(workflow);

      // Execute the workflow
      const result = await engine.executeWorkflow();
      console.log("Workflow executed successfully:", result);
    } catch (error) {
      console.error("Failed to execute workflow:", error);
    }
  });

program.parse(process.argv);
