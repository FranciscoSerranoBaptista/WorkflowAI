import { promises as fs } from "fs";
import { join } from "path";

async function readAndOutputFile(filePath: string): Promise<void> {
  try {
    // Read the file contents
    const content = await fs.readFile(filePath, "utf8");

    // Output the file contents
    console.log("File contents:");
    console.log(content);
  } catch (error) {
    console.error("Error reading file:", error);
  }
}

// The path to the file
const filePath =
  "/Users/franciscobaptista/Development/WorkflowAI/workflows/data/target_audience.txt";

// Call the function to read and output the file
readAndOutputFile(filePath);
