import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, "../logs"); // Adjust this path if needed

async function cleanLogs() {
  console.log("Cleaning up logs...");

  try {
    await fs.access(logDir);
  } catch (error) {
    console.log("Logs directory does not exist. Nothing to clean.");
    return;
  }

  try {
    const files = await fs.readdir(logDir);

    for (const file of files) {
      if (file.startsWith("workflow_") && file.endsWith(".log")) {
        await fs.unlink(path.join(logDir, file));
        console.log(`Deleted ${file}`);
      }
    }

    console.log("Log cleanup completed.");
  } catch (error) {
    console.error("Error during log cleanup:", error);
  }
}

cleanLogs();
