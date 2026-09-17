/**
 * Calculates the absolute change between two prices.
 * @param currentPrice 
 * @param previousPrice 
 * @returns 
 */
export function calculateChange(
  currentPrice: number,
  previousPrice: number
): number {
  return currentPrice - previousPrice;
}

/**
 * Calculates the percentage change between two prices. 
 * @param currentPrice 
 * @param previousPrice 
 * @returns 
 */
export function calculateChangePercent(
  currentPrice: number,
  previousPrice: number
): number {
  if (previousPrice === 0) {
    return 0;
  }

  return (
    ((currentPrice - previousPrice) /
      previousPrice) *
    100
  );
}

/**
 * Calculates the rolling return based on an array of prices.
 * @param prices 
 * @returns 
 */ 
export function calculateRollingReturn(
  prices: number[]
): number {
  if (prices.length < 2) {
    return 0;
  }

  const firstPrice = prices[0];
  const latestPrice = prices.at(-1)!;

  if (firstPrice === 0) {
    return 0;
  }

  return (
    ((latestPrice - firstPrice) /
      firstPrice) *
    100
  );
}

/**
 * Calculates the rolling average price based on an array of prices.
 * @param prices 
 * @returns 
 */
export function calculateRollingAverage(
  prices: number[]
): number {
  if (prices.length === 0) {
    return 0;
  }

  const total = prices.reduce(
    (sum, price) => sum + price,
    0
  );

  return total / prices.length;
}