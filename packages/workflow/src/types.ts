export interface NodeExecutionOptions {
  maxRetries: number;
  retryOnFail: boolean;
  retryDelay: number;
  maxTries: number;
  waitBetweenRetries: number;
}
