import type {
  InstrumentConfig,
  InstrumentSymbol,
  MarketTick
} from "@brightstar/shared";

import { mulberry32 } from "./random";
import { standardNormal } from "./distribution";
import { roundTo } from "./utils";
import type { SimulatorState } from "./types";

const MIN_SPREAD = 0.05;
const SPREAD_BPS = 2;
const BASE_QUANTITY = 100;

export class MarketSimulator {
  private readonly states = new Map<
    InstrumentSymbol,
    SimulatorState
  >();

  constructor(
    private readonly configs: InstrumentConfig[]
  ) {
    for (const config of configs) {
      this.states.set(config.symbol, {
        symbol: config.symbol,
        price: config.seedPrice,
        sequence: 0,
        tradedQuantity: 0,
        random: mulberry32(this.seedFor(config.symbol))
      });
    }
  }

  generateTick(config: InstrumentConfig): MarketTick {
    const state = this.states.get(config.symbol);

    if (!state) {
      throw new Error(`Missing simulator state for ${config.symbol}`);
    }

    const dt = config.tickIntervalMs / 1000;

    const z = standardNormal(state.random);

    const drift = 0;

    const diffusion =
      config.volatility *
      Math.sqrt(dt) *
      z;

    let nextPrice =
      state.price *
      Math.exp(drift + diffusion);

    const maxMove =
      state.price * config.maxStdDev;

    const minimumPrice =
      state.price - maxMove;

    const maximumPrice =
      state.price + maxMove;

    nextPrice = Math.min(
      Math.max(nextPrice, minimumPrice),
      maximumPrice
    );

    nextPrice = roundTo(nextPrice, 2);

    const spread = Math.max(
      MIN_SPREAD,
      (nextPrice * SPREAD_BPS) / 10000
    );

    const bid = roundTo(
      nextPrice - spread / 2,
      2
    );

    const ask = roundTo(
      nextPrice + spread / 2,
      2
    );

    const bidQuantity = this.randomQuantity(
      state.random
    );

    const askQuantity = this.randomQuantity(
      state.random
    );

    const tradedQuantity = this.randomQuantity(
      state.random,
      true
    );

    state.price = nextPrice;

    state.sequence += 1;

    state.tradedQuantity += tradedQuantity;

    return {
      symbol: config.symbol,
      timestamp: Date.now(),
      sequence: state.sequence,

      ltp: nextPrice,

      bid,
      ask,

      bidQuantity,
      askQuantity,

      tradedQuantity
    };
  }

  getSnapshot(): MarketTick[] {
    return this.configs.map((config) =>
      this.generateTick(config)
    );
  }

  private randomQuantity(
    random: () => number,
    smaller = false
  ): number {
    const multiplier = smaller
      ? random()
      : 0.5 + random();

    return Math.round(
      BASE_QUANTITY * multiplier
    );
  }

  private seedFor(symbol: string): number {
    return [...symbol].reduce(
      (seed, char) =>
        seed * 31 + char.charCodeAt(0),
      7
    );
  }
}