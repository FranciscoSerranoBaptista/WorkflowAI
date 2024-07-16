import type { PromptMetaData } from "workflowai.common";
import { join, extname } from "path";
import fs from "fs";
import yaml from "js-yaml";
import { getLogger } from "workflowai.common";

let logger = getLogger();

export function loadPrompts(): { [key: string]: PromptMetaData } {
  const promptsDir = join(__dirname, "../../nodes/prompts"); // Adjust path as needed
  logger.debug(`Loading prompts from directory: ${promptsDir}`);

  const promptFiles = fs.readdirSync(promptsDir);
  logger.debug(`Prompt files found: ${promptFiles.join(", ")}`);

  const prompts: { [key: string]: PromptMetaData } = {};

  promptFiles.forEach((file) => {
    if (extname(file) === ".md") {
      const filePath = join(promptsDir, file);

      logger.debug(`Reading file: ${filePath}`);
      const content = fs.readFileSync(filePath, "utf8");
      logger.debug(`File read successfully: ${filePath}`);

      const metadata = parsePrompt(content);
      prompts[metadata.id] = metadata;
    } else {
      logger.debug(`Skipped non-markdown file: ${file}`);
    }
  });

  // Output the catalog of available prompts
  const catalog = Object.keys(prompts).map((id) => {
    const { description } = prompts[id];
    return `ID: ${id}, Description: ${description}`;
  });
  logger.info("Available prompts:\n" + catalog.join("\n"));

  logger.debug(
    `Prompts loaded successfully: ${Object.keys(prompts).join(", ")}`,
  );
  return prompts;
}

export function parsePrompt(content: string): PromptMetaData {
  const metadataSection = content.split("---")[1].trim();
  logger.debug(`Extracted metadata section: ${metadataSection}`);

  const metadata = yaml.load(metadataSection) as Omit<
    PromptMetaData,
    "content"
  >;
  logger.debug(`Parsed metadata: ${JSON.stringify(metadata)}`);
  return { ...metadata, content };
}
