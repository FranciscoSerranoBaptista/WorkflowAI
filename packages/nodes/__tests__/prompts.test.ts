import { describe, expect, test, mock } from "bun:test";
import {
  loadPrompts,
  parsePrompt,
  interpolatePrompt,
} from "../src/utils/prompts";
import { getLogger } from "workflowai.common";
import { join } from "path";

const logger = getLogger();

describe("Prompt loading and parsing", () => {
  const promptsDir = join(__dirname, "../../nodes/prompts");

  test("loadPrompts loads all valid prompts", () => {
    const prompts = loadPrompts();
    expect(Object.keys(prompts).length).toBeGreaterThan(0);

    // Check if each loaded prompt has the required fields
    Object.values(prompts).forEach((prompt) => {
      expect(prompt).toHaveProperty("id");
      expect(prompt).toHaveProperty("description");
      expect(prompt).toHaveProperty("content");
    });
  });

  test("parsePrompt correctly parses valid prompts", () => {
    const validPromptContent = `---
id: test_prompt
description: This is a test prompt
---
This is the content of the test prompt.`;

    const result = parsePrompt(validPromptContent);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.id).toBe("test_prompt");
      expect(result.description).toBe("This is a test prompt");
      expect(result.content).toBe("This is the content of the test prompt.");
    }
  });

  test("parsePrompt returns null for invalid prompts", () => {
    const invalidPromptContent = `This is an invalid prompt without frontmatter.`;
    const result = parsePrompt(invalidPromptContent);
    expect(result).toBeNull();
  });

  test("loadPrompts skips invalid prompts", () => {
    // This test assumes you have a mix of valid and invalid prompts in your directory
    const prompts = loadPrompts();

    // Check that no loaded prompt is null or undefined
    Object.values(prompts).forEach((prompt) => {
      expect(prompt).not.toBeNull();
      expect(prompt).not.toBeUndefined();

      // Check that at least some prompts were loaded
      expect(Object.keys(prompts).length).toBeGreaterThan(0);
    });
  });
});
