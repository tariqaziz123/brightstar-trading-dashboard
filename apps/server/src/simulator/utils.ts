/**
 * Rounds a number to a specified number of decimal places.
 * @param value 
 * @param decimals 
 * @returns 
 */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
}