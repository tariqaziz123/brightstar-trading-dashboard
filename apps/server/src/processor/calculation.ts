export function calculateChange(
  currentPrice: number,
  previousPrice: number
): number {
  return currentPrice - previousPrice;
}

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