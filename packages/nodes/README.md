# Node Data Conventions

This document outlines the common data conventions for nodes within the workflow system. These conventions ensure consistency and compatibility across different node types and facilitate easier integration and troubleshooting.

## General Conventions

- Each node output should include the node ID to identify the source of the data.
- Data should be wrapped in a JSON object with a key corresponding to the node ID.
- Both success and error states should be clearly indicated within the output data.
- Each output should include a `source` key indicating the node ID.

## Data Structure

### Success Output

When a node successfully processes data, the output should follow this structure:

```json
{
  "nodeId": {
    "status": "success",
    "data": {
      // Result data here
    },
    "source": "nodeId"
  }
}
```

### Error Output

When an error occurs, the output should follow this structure:

```json
{
  "nodeId": {
    "status": "error",
    "error": "Error message here",
    "source": "nodeId"
  }
}
```

## Example Data Structrues

### Example for FileReadWrite Node

#### Read Operation

```json
{
  "readNodeId": {
    "status": "success",
    "data": "file content here",
    "source": "readNodeId"
  }
}
```

#### Read Operation

```json
{
  "writeNodeId": {
    "status": "success",
    "source": "writeNodeId"
  }
}

```

### Example for AiAgentNode Node

#### Successful Output

```json
{
  "aiAgentNodeId": {
    "status": "success",
    "data": {
      "result": "AI response here"
    },
    "source": "aiAgentNodeId"
  }
}

```

#### Error Output

```json
{
  "aiAgentNodeId": {
    "status": "error",
    "error": "Error message here",
    "source": "aiAgentNodeId"
  }
}

```
