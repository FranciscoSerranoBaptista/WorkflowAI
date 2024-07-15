---
id: automation_create_workflow
description: Create a workflow for a coaching application
temperature: 0.7
maxTokens: 4096
---

You are an AI assistant tasked with creating a structured tree representation of a workflow for a specific purpose. Your goal is to determine the best course of action to breakdown the purpose into individual steps and individual components into a unified universal tree that can accommodate various thought patterns.

Here are the possible thought patterns.

### Skeleton of Thoughts

**Description:**
- The Skeleton of Thoughts is a linear structure that outlines a clear sequence of tasks or sections. It serves as a fundamental framework, ensuring that all necessary components are addressed in a logical and organized manner.

**Intention:**
- To provide a straightforward, linear workflow that ensures each necessary step is addressed in a clear sequence.

**Data Roll-Up:**
- Each section’s output is passed directly to the next section in sequence, creating a cumulative and coherent result.

**Characteristics:**
- **Linear Flow:** Tasks or sections are arranged in a straightforward, linear order.
- **Clear Path:** Each section follows logically from the previous one, ensuring a smooth progression.
- **Basic Framework:** Provides a high-level outline that can be further detailed as needed.

**Example:**
In the example workflow below, we start with an introduction, followed by the extraction of goals, and then analyze the data.

```yaml
workflows:
  skeleton_report:
    id: skeleton_report
    type: composite
    description: A structured report with predefined sections.
    sections:
      - id: introduction
        type: fixed_text
        description: Introduction section
        content: |
          This is the introduction to the report.
      - id: goals
        type: analysis
        description: Extracting goals from the provided data.
        method: identify_goals
      - id: analysis
        type: analysis
        description: Analyzing the data to provide insights.
        method: analyze_data
```

**Usage:**
- **Reports and Documents:** Establishes a clear structure for creating comprehensive reports or documents.
- **Basic Workflows:** Suitable for workflows that require a simple, linear sequence of steps.

---

### Tree of Thoughts

**Description:**
- The Tree of Thoughts is a hierarchical structure where each node (task or section) branches out into sub-nodes. This structure allows for a detailed exploration of ideas, breaking down complex tasks into more manageable components.

**Intention:**
- To enable detailed analysis by breaking down complex tasks into smaller, focused components, allowing for thorough exploration.

**Data Roll-Up:**
- Outputs from branches are combined at higher levels, with each branch contributing to a comprehensive view of the central idea.

**Characteristics:**
- **Hierarchical:** Central nodes branch out into sub-nodes, creating a tree-like structure.
- **Detailed Exploration:** Allows for in-depth analysis by breaking down tasks into smaller, focused components.
- **Parent-Child Relationship:** Each branch is dependent on its parent node.

**Example:**
In the example workflow below, we start with an introduction as the root node, which then branches out into two sequences for identifying goals and behaviors.

```yaml
workflows:
  tree_of_thoughts:
    id: tree_of_thoughts
    type: composite
    description: A hierarchical structure to explore ideas.
    sections:
      - id: introduction
        type: composite
        description: Root section for introduction
        sections:
          - id: goals
            type: analysis
            description: Extracting goals from the provided data.
            method: identify_goals
          - id: behaviours
            type: analysis
            description: Identifying behaviours from the provided data.
            method: identify_behaviours
```

**Usage:**
- **Detailed Analysis:** Ideal for breaking down complex tasks or ideas into more detailed, manageable parts.
- **Exploratory Workflows:** Useful for workflows that require exploring various aspects of a central idea.

---

### Chain of Thoughts

**Description:**
- The Chain of Thoughts is a linear sequence of dependent tasks, where each task must be completed before moving on to the next. This structure ensures a step-by-step approach to achieving a specific goal or completing a process.

**Intention:**
- To facilitate a methodical, step-by-step approach to complex processes, ensuring each step logically follows from the previous one.

**Data Roll-Up:**
- Each task’s output is used as the input for the next task, ensuring a smooth and logical progression from start to finish.

**Characteristics:**
- **Sequential:** Tasks are executed in a strict order, with each task dependent on the completion of the previous one.
- **Clear Dependencies:** The linear progression ensures that each step logically follows from the previous one.
- **Step-by-Step Execution:** Facilitates a methodical approach to complex processes.

**Example:**
In the example workflow below, we follow a linear sequence starting from an introduction, followed by goal identification, and then behavior analysis.

```yaml
workflows:
  chain_of_thoughts:
    id: chain_of_thoughts
    type: composite
    description: A linear sequence of tasks.
    sections:
      - id: introduction
        type: fixed_text
        description: Introduction section
        content: |
          This is the introduction to the report.
      - id: goals
        type: analysis
        description: Extracting goals from the provided data.
        method: identify_goals
      - id: behaviours
        type: analysis
        description: Identifying behaviours from the provided data.
        method: identify_behaviours
```

**Usage:**
- **Processes and Procedures:** Perfect for workflows that require a strict sequence of steps, such as standard operating procedures or training programs.
- **Goal-Oriented Tasks:** Useful for tasks that require a clear path to achieve a specific goal.

---

### Network of Thoughts

**Description:**
- The Network of Thoughts is a complex, non-linear structure that represents tasks or sections as interconnected nodes. This structure is suitable for multifaceted workflows where tasks have multiple dependencies and relationships.

**Intention:**
- To capture the complexity of tasks with multiple interdependencies, allowing for flexible navigation and parallel processing.

**Data Roll-Up:**
- Outputs are integrated from multiple interconnected nodes, creating a comprehensive and cohesive result from various pathways.

**Characteristics:**
- **Non-Linear:** Tasks are interconnected in a web-like structure, allowing for multiple paths and dependencies.
- **Complex Relationships:** Captures the complexity of tasks that have interdependencies and require parallel processing.
- **Flexibility:** Provides flexibility to navigate through tasks in various sequences as needed.

**Example:**
In the example workflow below, tasks are interconnected with multiple dependencies, creating a network of related activities.

```yaml
workflows:
  network_of_thoughts:
    id: network_of_thoughts
    type: composite
    description: A network of interconnected tasks.
    sections:
      - id: introduction
        type: composite
        description: Root section for introduction
        sections:
          - id: goals
            type: analysis
            description: Extracting goals from the provided data.
            method: identify_goals
            dependencies: [introduction]
          - id: behaviours
            type: analysis
            description: Identifying behaviours from the provided data.
            method: identify_behaviours
            dependencies: [introduction]
      - id: quality_of_supervision
        type: analysis
        description: Analyzing the quality of supervision
        method: analyze_supervision
        dependencies: [goals]
      - id: intentions
        type: analysis
        description: Identifying intentions from behaviours
        method: analyze_intentions
        dependencies: [behaviours]
      - id: outlook
        type: analysis
        description: Providing an outlook based on supervision quality
        method: analyze_outlook
        dependencies: [quality_of_supervision]
```

**Usage:**
- **Complex Systems:** Suitable for workflows that involve complex systems with multiple interdependencies.
- **Research and Development:** Ideal for projects that require exploring various pathways and iterations, such as R&D projects or innovation initiatives.

+++

You will have at your disposal different node types to structure your workflow:

### 1. Fixed Text Node
**Analogy:** Think of this as a sticky note on your monitor. It’s always there with the same message, providing a static piece of information.

**Description:**
- **Purpose:** Provides static text content that does not change.
- **Fields:**
  - `id`: A unique identifier for the node.
  - `type`: `fixed_text`
  - `description`: A brief description of the node.
  - `content`: The static text content.

**Example:**
```yaml
id: introduction
type: fixed_text
description: Introduction to the report
content: |
  This is the introduction to the comprehensive report.
```

### 2. Extract Node
**Analogy:** Imagine you are extracting juice from an orange. Here, you extract specific data from a larger set of information.

**Description:**
- **Purpose:** Extracts specific data from the provided input.
- **Fields:**
  - `id`: A unique identifier for the node.
  - `type`: `extract`
  - `description`: A brief description of the node.
  - `from`: The source of the data extraction.
  - `field`: The specific field to be extracted.

**Example:**
```yaml
id: extract_name
type: extract
description: Extract the client's name
from: user_data
field: name
```

### 3. Analysis Node
**Analogy:** Similar to a detective analyzing clues to solve a mystery, this node analyzes data to provide insights.

**Description:**
- **Purpose:** Performs analysis based on the provided data.
- **Fields:**
  - `id`: A unique identifier for the node.
  - `type`: `analysis`
  - `description`: A brief description of the node.
  - `method`: The method or task to be executed for analysis.

**Example:**
```yaml
id: analyze_behavior
type: analysis
description: Analyze the client's behavior patterns
method: behavior_analysis
```

### 4. Macro Node
**Analogy:** Imagine a chef who has a recipe (macro) that combines multiple cooking steps (tasks) to create a dish. This node executes a predefined set of tasks.

**Description:**
- **Purpose:** Executes a predefined set of tasks (macro).
- **Fields:**
  - `id`: A unique identifier for the node.
  - `type`: `macro`
  - `description`: A brief description of the node.
  - `macro`: The identifier of the macro to be executed.

**Example:**
```yaml
id: perform_macro_analysis
type: macro
description: Execute macro for complex analysis
macro: complex_analysis_macro
```

### 5. Summarize Node
**Analogy:** Think of this as a book summary. It condenses the main points from different chapters into a concise overview.

**Description:**
- **Purpose:** Summarizes data from multiple sections.
- **Fields:**
  - `id`: A unique identifier for the node.
  - `type`: `summarize`
  - `description`: A brief description of the node.
  - `sections`: List of sections to be summarized.

**Example:**
```yaml
id: summary_report
type: summarize
description: Summarize the report sections
sections:
  - introduction
  - analysis
  - conclusions
```

### 6. Composite Node
**Analogy:** Picture a puzzle where each piece (section) is part of a larger picture (composite). This node combines multiple sections or tasks into a comprehensive result.

**Description:**
- **Purpose:** Combines multiple sections or tasks into one.
- **Fields:**
  - `id`: A unique identifier for the node.
  - `type`: `composite`
  - `description`: A brief description of the node.
  - `sections`: List of sections or tasks to be combined.

**Example:**
```yaml
id: comprehensive_analysis
type: composite
description: Comprehensive analysis combining multiple aspects
sections:
  - context_analysis
  - behavior_analysis
  - final_report
```

### 7. Skeleton Node
**Analogy:** Imagine the skeleton as the framework of a building, providing a basic structure that other elements can be built upon.

**Description:**
- **Purpose:** Establishes a basic, linear framework for a series of tasks or sections.
- **Fields:**
  - `id`: A unique identifier for the node.
  - `type`: `skeleton`
  - `description`: A brief description of the node.
  - `skeleton`: List of sections or tasks to be executed in sequence.

**Example:**
```yaml
workflows:
  skeleton_report:
    id: skeleton_report
    type: skeleton
    description: A structured report with predefined sections.
    skeleton:
      - id: introduction
        type: fixed_text
        content: |
          This is the introduction to the report.
      - id: goals
        type: analysis
        method: identify_goals
        description: Extracting goals from the provided data.
      - id: analysis
        type: analysis
        method: analyze_data
        description: Analyzing the data to provide insights.
```

### 8. Tree Node
**Analogy:** A tree starts with a trunk (root) and branches out into smaller limbs and leaves. This node structures tasks hierarchically.

**Description:**
- **Purpose:** Hierarchically organizes tasks or sections, branching out from a central idea.
- **Fields:**
  - `id`: A unique identifier for the node.
  - `type`: `tree`
  - `description`: A brief description of the node.
  - `tree`: The hierarchical structure, with root and branches.

**Example:**
```yaml
workflows:
  tree_of_thoughts:
    id: tree_of_thoughts
    type: tree
    description: A hierarchical structure to explore ideas.
    tree:
      - root: introduction
        branches:
          - sequence:
              - id: goals
                type: analysis
                method: identify_goals
          - sequence:
              - id: behaviours
                type: analysis
                method: identify_behaviours
```

### 9. Chain Node
**Analogy:** Think of a chain where each link is connected to the next in a specific order. This node structures tasks sequentially.

**Description:**
- **Purpose:** Organizes tasks or sections in a linear, sequential order.
- **Fields:**
  - `id`: A unique identifier for the node.
  - `type`: `chain`
  - `description`: A brief description of the node.
  - `chain`: The sequential structure of tasks.

**Example:**
```yaml
workflows:
  chain_of_thoughts:
    id: chain_of_thoughts
    type: chain
    description: A linear sequence of tasks.
    chain:
      - id: introduction
        type: fixed_text
        content: |
          This is the introduction to the report.
      - id: goals
        type: analysis
        method: identify_goals
      - id: behaviours
        type: analysis
        method: identify_behaviours
```

### 10. Graph Node
**Analogy:** Imagine a city map where various routes connect different locations. This node structures tasks in a complex, non-linear network.

**Description:**
- **Purpose:** Organizes tasks or sections in a non-linear, interconnected structure.
- **Fields:**
  - `id`: A unique identifier for the node.
  - `type`: `graph`
  - `description`: A brief description of the node.
  - `graph`: The network of interconnected tasks and their dependencies.

**Example:**
```yaml
workflows:
  network_of_thoughts:
    id: network_of_thoughts
    type: graph
    description: A network of interconnected tasks.
    graph:
      - root: introduction
        paths:
          - to: goals
          - to: behaviours
      - root: goals
        paths:
          - to: quality_of_supervision
      - root: behaviours
        paths:
          - to: intentions
      - root: quality_of_supervision
        paths:
          - to: outlook
```

+++

To determine the best course of action:
1. Analyze the task description and identify the main objectives.
2. Consider which thought pattern(s) would be most appropriate for addressing these objectives.
3. Review the available tasks and determine which ones align with the identified objectives and chosen thought pattern(s).
4. If there are any tasks that are missing, please make a suggestion

Break down the individual components into "nodes" that can be iterated in a unified universal tree. Each node can be one of the following types:
- root: The main container for the entire tree
- composite: A node that contains other nodes
- fixed_text: A node with predefined content
- analysis: A node that triggers a specific task to be run
- summarise: A node that summarizes information from other nodes
- extract: A node that extracts specific information from other nodes

Create a tree structure that represents the coaching analysis and plan. The tree should:
1. Have a logical hierarchy that reflects the chosen thought pattern(s)
2. Incorporate relevant tasks from the available list
3. Use appropriate node types for each component
4. Provide clear descriptions for each node

Present your tree structure using the following format:

<tree>
root_node:
  id: [unique_identifier]
  type: [node_type]
  description: [brief description of the node's purpose]
  sections:
    - id: [unique_identifier]
      type: [node_type]
      [additional_properties_if_needed]
      description: [brief description of the node's purpose]
      [sections: [if_composite_node]]
        [- nested_nodes]
</tree>

Ensure that your tree structure is comprehensive, covering all aspects of the coaching analysis and plan. Use clear and concise descriptions for each node, and make sure the structure is logical and easy to follow. Include all necessary components, such as introduction, goals, analyses, and recommendations.
