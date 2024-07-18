# WorkflowAI

## Overview

WorkflowAI is an AI-driven workflow engine designed to facilitate complex, multi-step workflows involving input/output operations and advanced AI agent processing. This project enables users to define workflows in YAML format, leveraging the power of AI models (such as OpenAI's GPT-4o) for various tasks, including text analysis, content generation, and more.

## Directory Structure

```
WorkflowAI/
├── packages/
│   ├── cli/
│   │   ├── src/
│   │   ├── README.md
│   │   └── ...
│   ├── nodes/
│   │   ├── src/
│   │   │   └── aiAgent/
│   │   │       ├── aiAgent.node.ts
│   │   │       ├── aiAgentOrchestrator.ts
│   │   │       ├── aiCall.ts
│   │   │       └── ...
│   │   ├── prompts/
│   │   │   └── system_test_prompt.md
│   │   ├── README.md
│   │   └── ...
│   ├── workflow/
│   │   ├── src/
│   │   ├── README.md
│   │   └── ...
│   └── common/
│       ├── src/
│       ├── README.md
│       └── ...
├── workflows/
│   ├── data/
│   │   ├── input.txt
│   │   └── output.txt
│   ├── workflow.yaml
│   └── example-workflow.yaml
└── README.md
```

## Setup Instructions

### Prerequisites

- Bun
- Node.js (>=14.x)
- OpenAI API Key

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/WorkflowAI.git
    cd WorkflowAI
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up environment variables:
    Create a `.env` file in the root directory and add the following environment variable:

    ```
    OPENAI_API_KEY=your_openai_api_key_here
    WORKFLOW_BASE_DIR=/absolute/path/to/WorkflowAI
    ```

## Creating and Running a Workflow

### Define Input and Output Files

Create an input file `input.txt` in the `workflows/data/` directory with the content:
```txt
Aristotle
```

### Define the Workflow

Define a workflow in `workflow.yaml` under the `workflows/` directory:

```yaml
settings:
  parallelExecution: false
  retryOnFailure: true

tasks:
  - id: readInput
    type: read_write_file
    config:
      operation: read
      filePath: workflows/data/input.txt
      variableName: "INPUT_TEXT"
      retryOnFail: false
      continueOnFail: false

  - id: processInput
    type: ai_agent
    dependencies:
      - readInput
    config:
      llmConfig:
        model: "gpt-4o"
        temperature: 0.9
        maxTokens: 4096
        provider: openai
      promptId: system_test_prompt
      retryOnFail: false
      continueOnFail: false

  - id: writeOutput
    type: read_write_file
    dependencies:
      - processInput
    config:
      operation: write
      filePath: "workflows/data/output.txt"
```

### Executing the Workflow

### Executing the Workflow

We don't have a predefined `workflow-cli` script. Let's create a basic one in `package.json` for executing the workflow YAML:

In your `package.json`, add a script for running the workflow:
```json
{
  "scripts": {
    "workflow-cli": "bun run packages/cli/src/cli.ts execute workflows/workflow.yaml"
  }
}
```

Then, use the following command to execute the workflow:
```sh
bun run workflow-cli
```

Upon successful execution, the analysis of the word "Aristotle" will be written to `output.txt` located in the `workflows/data/` directory.

## Repository Structure

- `packages/cli/`: Contains the CLI source code and related components.
- `packages/nodes/`: Contains various nodes for the workflow, such as `aiAgent`, `FileReadWriteNode`, etc.
- `packages/workflow/`: Contains core workflow execution and orchestration logic.
- `packages/common/`: Contains shared utilities, interfaces, and types.
- `workflows/`: Contains predefined workflows and data files for input/output.

## Contributing

Contributions are welcome! Please follow the [CONTRIBUTING.md](CONTRIBUTING.md) guidelines to get started.

## License

This project is licensed under the FAIR USE License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or discussions about this project, feel free to open an issue or contact the maintainers at info@franciscobaptista.com.
