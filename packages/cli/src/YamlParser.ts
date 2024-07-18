import fs from "fs";
import yaml from "js-yaml";
import { getLogger } from "workflowai.common";
import type { YamlWorkflow } from "./types";

export class YamlParser {
  constructor(
    private filePath: string,
    private logger: ReturnType<typeof getLogger> = getLogger({ module: "YamlParser" })
  ) { }

  public parse(): YamlWorkflow {
    const fileContents = fs.readFileSync(this.filePath, "utf8");
    this.logger.debug(`File contents loaded: ${this.filePath}`);
    return yaml.load(fileContents) as YamlWorkflow;
  }
}
