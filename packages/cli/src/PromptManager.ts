import { loadPrompts } from "./utils";
import { getLogger } from "workflowai.common";
import type { PromptMetaData } from "workflowai.common";

export class PromptManager {
  constructor(private logger: ReturnType<typeof getLogger> = getLogger()) {}

  public loadPrompts(): { [key: string]: PromptMetaData } {
    const prompts = loadPrompts();
    this.logger.debug(`Prompts loaded successfully`);
    return prompts;
  }
}
