import fs from "fs";
import { join, extname } from "path";
import yaml from "js-yaml";
import { getLogger } from "workflowai.common";
import type { PromptMetaData } from "workflowai.common";
import Ajv from "ajv";
import schema from "../../schema/prompt.schema.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

const logger = getLogger();

// The output JSON structure of the loadPrompts functions is as follows:
// ```json
// {
//   "analyze_intentions": {
//     "id": "analyze_intentions",
//     "description": "Analyze intentions behind behaviours",
//     "temperature": 1,
//     "maxTokens": 2048,
//     "content": "... full content of the markdown file ..."
//   },
//   "create_monthly_themes": {
//     "id": "create_monthly_themes",
//     "description": "Generate for a given audience and community a lis of 12 monthly themes that will engage the community throughout the year.",
//     "temperature": 0.7,
//     "maxTokens": 4096,
//     "content": "... full content of the markdown file ..."
//   },
// ...
// }

export function loadPrompts(): { [key: string]: PromptMetaData } {
  const promptsDir = join(__dirname, "../../prompts"); // Adjust path as needed
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
      if (metadata) {
        prompts[metadata.id] = metadata;
      } else {
        logger.warn(`Skipped invalid prompt file: ${file}`);
      }
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

export function parsePrompt(content: string): PromptMetaData | null {
  const parts = content.split("---");

  if (parts.length < 3) {
    logger.warn("Skipping prompt due to invalid frontmatter structure");
    return null;
  }

  const metadataSection = parts[1].trim();
  logger.debug(`Extracted metadata section: ${metadataSection}`);

  try {
    const metadata = yaml.load(metadataSection) as Omit<
      PromptMetaData,
      "content"
    >;
    logger.debug(`Parsed metadata: ${JSON.stringify(metadata)}`);

    const promptData = {
      ...metadata,
      content: parts.slice(2).join("---").trim(),
    };

    // Validate the parsed metadata against the schema
    if (validate(promptData)) {
      return promptData;
    } else {
      logger.warn(
        `Invalid metadata structure: ${JSON.stringify(validate.errors)}`,
      );
      return null;
    }
  } catch (error) {
    logger.error(`Error parsing prompt metadata: ${error}`);
    return null;
  }
}

/**
 * Utility function to replace variables in the prompt with actual values.
 * @param variables An object with variable names as keys and their corresponding values.
 * @returns The prompt with variables replaced by actual values.
 */
export function interpolatePrompt(
  template: string,
  variables: { [key: string]: string },
): string {
  return template.replace(/{{(\w+)}}/g, (match, variable) => {
    return variables[variable] || match;
  });
}
