/**
 * Basic utility functions for DisciplineOS
 */

/**
 * Trim and limit input length
 */
export function cleanInput(input: string): string {
  if (!input) return "";
  return input.trim();
}
