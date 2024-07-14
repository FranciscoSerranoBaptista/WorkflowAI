import type { PromptMetaData } from "workflowai.core";
import { join } from "path";
import fs from "fs";
import yaml from "js-yaml";

export function loadPrompts(): { [key: string]: PromptMetaData } {
  const promptsDir = join(__dirname, "../../core/prompts"); // Adjust path as needed
  const promptFiles = fs.readdirSync(promptsDir);
  const prompts: { [key: string]: PromptMetaData } = {};

  promptFiles.forEach((file) => {
    const filePath = join(promptsDir, file);
    const content = fs.readFileSync(filePath, "utf8");
    const metadata = parsePrompt(content);
    prompts[metadata.id] = metadata;
  });
  return prompts;
}

export function parsePrompt(content: string): PromptMetaData {
  const metadataSection = content.split("---")[1].trim();
  const metadata = yaml.load(metadataSection) as Omit<
    PromptMetaData,
    "content"
  >;
  return { ...metadata, content };
}
