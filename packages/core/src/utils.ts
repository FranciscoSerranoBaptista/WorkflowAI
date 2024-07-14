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
