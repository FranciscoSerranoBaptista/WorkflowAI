import Ajv from "ajv";
import schema from "../schema/workflow.schema.json";
import { ValidationError } from "workflowai.common";
import { getLogger } from "workflowai.common";

export class SchemaValidator {
  private ajv: Ajv;
  private logger: ReturnType<typeof getLogger>;

  constructor() {
    this.ajv = new Ajv();
    this.logger = getLogger({ module: "SchemaValidator" });
  }

  public validate(data: any): void {
    const validate = this.ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      const errorMessage = this.formatSchemaErrors(validate.errors || []);
      this.logger.error(errorMessage);
      throw new ValidationError(errorMessage);
    }
    this.logger.debug(`YAML content validated against schema successfully`);
  }

  private formatSchemaErrors(errors: any[]): string {
    return errors
      .map((error) => {
        let message = `Path: ${error.instancePath} - ${error.message}`;
        if (error.params) {
          message += ` (${JSON.stringify(error.params)})`;
        }
        if (error.schemaPath) {
          message += `\n  Schema path: ${error.schemaPath}`;
        }
        return message;
      })
      .join("\n");
  }
}
