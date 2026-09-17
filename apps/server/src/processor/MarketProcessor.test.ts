import { describe, expect, it } from "vitest";

import type {
  MarketTick,
} from "@brightstar/shared";

import { instruments } from "@brightstar/shared";

import { MarketProcessor } from "./MarketProcessor";

function createTick(
  overrides: Partial<MarketTick> = {}
): MarketTick {
  return {
    symbol: "NIFTY",
    timestamp: 1000,
    sequence: 1,
    ltp: 25190,
    bid: 25189.5,
    ask: 25190.5,
    bidQuantity: 100,
    askQuantity: 120,
    tradedQuantity: 80,
    ...overrides,
  };
}

describe("MarketProcessor", () => {
  it("accepts a valid tick", () => {
    const processor = new MarketProcessor(instruments);

    const state = processor.processTick(createTick());

    expect(state).not.toBeNull();
    expect(state?.symbol).toBe("NIFTY");
    expect(state?.ltp).toBe(25190);
    expect(state?.change).toBeCloseTo(9.5);
  });

  it("rejects duplicate sequences", () => {
    const processor = new MarketProcessor(instruments);

    processor.processTick(
      createTick({
        sequence: 1,
        timestamp: 1000,
      })
    );

    const duplicate = processor.processTick(
      createTick({
        sequence: 1,
        timestamp: 1001,
        ltp: 25191,
      })
    );

    expect(duplicate).toBeNull();
  });

  it("rejects out-of-order sequences", () => {
    const processor = new MarketProcessor(instruments);

    processor.processTick(
      createTick({
        sequence: 2,
        timestamp: 1000,
      })
    );

    const olderSequence = processor.processTick(
      createTick({
        sequence: 1,
        timestamp: 1001,
      })
    );

    expect(olderSequence).toBeNull();
  });

  it("rejects out-of-order timestamps", () => {
    const processor = new MarketProcessor(instruments);

    processor.processTick(
      createTick({
        sequence: 1,
        timestamp: 2000,
      })
    );

    const olderTimestamp = processor.processTick(
      createTick({
        sequence: 2,
        timestamp: 1500,
      })
    );

    expect(olderTimestamp).toBeNull();
  });

  it("calculates rolling metrics", () => {
    const processor = new MarketProcessor(instruments);

    for (let i = 1; i <= 10; i++) {
      processor.processTick(
        createTick({
          sequence: i,
          timestamp: 1000 + i,
          ltp: 25180 + i,
          bid: 25179.5 + i,
          ask: 25180.5 + i,
        })
      );
    }

    const state = processor.getState("NIFTY");

    expect(state).toBeDefined();
    expect(state?.rolling10Return).toBeGreaterThan(0);
    expect(state?.rollingAveragePrice).toBeGreaterThan(0);
  });

  it("rejects invalid market data", () => {
    const processor = new MarketProcessor(instruments);

    const invalidTick = createTick({
      ltp: -100,
    });

    const result = processor.processTick(invalidTick);

    expect(result).toBeNull();
  });
});