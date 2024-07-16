export interface ConfigSection {
  id: string;
  type: string;
  dependencies?: string[];
  config: {
    [key: string]: any;
    outputs?: { [key: string]: string };
  };
}

export interface YamlWorkflow {
  settings: { [key: string]: any };
  tasks: ConfigSection[];
}
