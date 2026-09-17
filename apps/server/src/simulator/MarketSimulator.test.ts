import { describe, expect, it } from "vitest";

import { instruments } from "@brightstar/shared";

import { MarketSimulator } from "./MarketSimulator";

describe("MarketSimulator", () => {
  it("generates a valid market tick", () => {
    const simulator = new MarketSimulator(instruments);

    const config = instruments[0];
    const tick = simulator.generateTick(config);

    expect(tick.symbol).toBe(config.symbol);
    expect(tick.ltp).toBeGreaterThan(0);
    expect(tick.bid).toBeLessThan(tick.ask);
    expect(tick.bidQuantity).toBeGreaterThan(0);
    expect(tick.askQuantity).toBeGreaterThan(0);
    expect(tick.tradedQuantity).toBeGreaterThan(0);
  });

  it("increments sequence numbers", () => {
    const simulator = new MarketSimulator(instruments);

    const config = instruments[0];

    const first = simulator.generateTick(config);
    const second = simulator.generateTick(config);

    expect(second.sequence).toBe(first.sequence + 1);
  });

  it("keeps price movement within the configured bound", () => {
    const simulator = new MarketSimulator(instruments);

    const config = instruments[0];

    const first = simulator.generateTick(config);

    const maxMove = first.ltp * config.maxStdDev;

    const second = simulator.generateTick(config);

    expect(
      Math.abs(second.ltp - first.ltp)
    ).toBeLessThanOrEqual(
      maxMove + 0.01
    );
  });

  it("produces deterministic ticks for the same instrument", () => {
    const firstSimulator =
      new MarketSimulator(instruments);

    const secondSimulator =
      new MarketSimulator(instruments);

    const config = instruments[0];

    const firstTick =
      firstSimulator.generateTick(config);

    const secondTick =
      secondSimulator.generateTick(config);

    expect(firstTick.ltp).toBe(secondTick.ltp);
    expect(firstTick.bid).toBe(secondTick.bid);
    expect(firstTick.ask).toBe(secondTick.ask);
    expect(firstTick.sequence).toBe(
      secondTick.sequence
    );
  });
});