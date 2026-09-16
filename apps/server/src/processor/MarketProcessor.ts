import type {
  InstrumentConfig,
  InstrumentState,
  InstrumentSymbol,
  MarketTick
} from "@brightstar/shared";

import {
  calculateChange,
  calculateChangePercent,
  calculateRollingAverage,
  calculateRollingReturn
} from "./calculation";

import {
  validateTick
} from "./validation";

import type {
  InstrumentRuntime,
  RuntimeState
} from "./types";

const ROLLING_WINDOW_SIZE = 10;

export class MarketProcessor {
  private readonly runtime: RuntimeState =
    new Map();

  private readonly knownSymbols: Set<InstrumentSymbol>;

  constructor(
    private readonly configs: InstrumentConfig[]
  ) {
    this.knownSymbols = new Set(
      configs.map((config) => config.symbol)
    );

    for (const config of configs) {
      this.runtime.set(
        config.symbol,
        this.createInitialRuntime(config)
      );
    }
  }

  processTick(
    tick: MarketTick
  ): InstrumentState | null {
    const validation = validateTick(
      tick,
      this.knownSymbols
    );

    if (!validation.valid) {
      console.warn(
        `[Tick rejected] ${validation.reason}`
      );

      return null;
    }

    const runtime =
      this.runtime.get(tick.symbol);

    if (!runtime) {
      return null;
    }

    if (
      tick.sequence <= runtime.lastSequence
    ) {
      console.warn(
        `[Tick rejected] ${tick.symbol} sequence ${tick.sequence} <= ${runtime.lastSequence}`
      );

      return null;
    }

    if (
      tick.timestamp < runtime.lastTimestamp
    ) {
      console.warn(
        `[Tick rejected] ${tick.symbol} timestamp out of order`
      );

      return null;
    }

    const previousLtp =
      runtime.state.ltp;

    runtime.priceHistory.push(tick.ltp);

    if (
      runtime.priceHistory.length >
      ROLLING_WINDOW_SIZE
    ) {
      runtime.priceHistory.shift();
    }

    const change = calculateChange(
      tick.ltp,
      previousLtp
    );

    const changePercent =
      calculateChangePercent(
        tick.ltp,
        previousLtp
      );

    const rolling10Return =
      calculateRollingReturn(
        runtime.priceHistory
      );

    const rollingAveragePrice =
      calculateRollingAverage(
        runtime.priceHistory
      );

    const nextState: InstrumentState = {
      symbol: tick.symbol,

      ltp: tick.ltp,
      previousLtp,

      bid: tick.bid,
      ask: tick.ask,

      bidQuantity: tick.bidQuantity,
      askQuantity: tick.askQuantity,
      tradedQuantity: tick.tradedQuantity,

      change,
      changePercent,

      rolling10Return,
      rollingAveragePrice,

      lastUpdated: tick.timestamp,

      status: "LIVE"
    };

    runtime.state = nextState;
    runtime.lastSequence =
      tick.sequence;
    runtime.lastTimestamp =
      tick.timestamp;

    return nextState;
  }

  getState(
    symbol: InstrumentSymbol
  ): InstrumentState | null {
    return (
      this.runtime.get(symbol)?.state ??
      null
    );
  }

  getAllStates(): InstrumentState[] {
    return Array.from(
      this.runtime.values()
    ).map((runtime) => runtime.state);
  }

  private createInitialRuntime(
    config: InstrumentConfig
  ): InstrumentRuntime {
    const initialState: InstrumentState = {
      symbol: config.symbol,

      ltp: config.seedPrice,
      previousLtp: config.seedPrice,

      bid: config.seedPrice,
      ask: config.seedPrice,

      bidQuantity: 0,
      askQuantity: 0,
      tradedQuantity: 0,

      change: 0,
      changePercent: 0,

      rolling10Return: 0,
      rollingAveragePrice: config.seedPrice,

      lastUpdated: 0,

      status: "STALE"
    };

    return {
      state: initialState,

      priceHistory: [config.seedPrice],

      lastSequence: 0,

      lastTimestamp: 0
    };
  }

  getSequence(
  symbol: InstrumentSymbol
): number {
  return (
    this.runtime.get(symbol)?.lastSequence ??
    0
  );
}
}