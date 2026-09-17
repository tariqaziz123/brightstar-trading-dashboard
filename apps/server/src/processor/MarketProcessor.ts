import type {
  InstrumentConfig,
  InstrumentState,
  InstrumentSymbol,
  MarketTick,
} from "@brightstar/shared";

import { validateTick } from "./validation";
import {
  calculateChange,
  calculateChangePercent,
  calculateRollingAverage,
  calculateRollingReturn,
} from "./calculation";
import type {
  InstrumentRuntime,
  RuntimeState,
} from "./types";

const ROLLING_WINDOW_SIZE = 10;

export class MarketProcessor {
  private readonly runtime: RuntimeState;

  private readonly knownSymbols: Set<InstrumentSymbol>;

  constructor(
    private readonly instruments: InstrumentConfig[]
  ) {
    this.knownSymbols = new Set(
      instruments.map(
        (instrument) => instrument.symbol
      )
    );

    this.runtime = new Map();

    for (const instrument of instruments) {
      const initialState: InstrumentState = {
        symbol: instrument.symbol,
        sequence: 0,
        ltp: instrument.seedPrice,
        previousLtp: instrument.seedPrice,
        bid: instrument.seedPrice,
        ask: instrument.seedPrice,
        bidQuantity: 0,
        askQuantity: 0,
        tradedQuantity: 0,
        change: 0,
        changePercent: 0,
        rolling10Return: 0,
        rollingAveragePrice:
          instrument.seedPrice,
        lastUpdated: 0,
        status: "STALE",
      };

      this.runtime.set(
        instrument.symbol,
        {
          state: initialState,
          priceHistory: [
            instrument.seedPrice,
          ],
          lastSequence: 0,
          lastTimestamp: 0,
        }
      );
    }
  }

  processTick(
    tick: MarketTick
  ): InstrumentState | null {
    const validation =
      validateTick(
        tick,
        this.knownSymbols
      );

    if (!validation.valid) {
      console.warn(
        `[Processor] Rejected ${tick.symbol}: ${validation.reason}`
      );

      return null;
    }

    const runtime =
      this.runtime.get(tick.symbol);

    if (!runtime) {
      console.warn(
        `[Processor] Missing runtime for ${tick.symbol}`
      );

      return null;
    }

    if (
      tick.sequence <=
      runtime.lastSequence
    ) {
      console.warn(
        `[Processor] Rejected ${tick.symbol}: duplicate/out-of-order sequence ${tick.sequence}`
      );

      return null;
    }

    if (
      tick.timestamp <
      runtime.lastTimestamp
    ) {
      console.warn(
        `[Processor] Rejected ${tick.symbol}: out-of-order timestamp`
      );

      return null;
    }

    const previousLtp =
      runtime.state.ltp;

    runtime.priceHistory.push(
      tick.ltp
    );

    if (
      runtime.priceHistory.length >
      ROLLING_WINDOW_SIZE
    ) {
      runtime.priceHistory.shift();
    }

    const change =
      calculateChange(
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
      sequence: tick.sequence,
      ltp: tick.ltp,
      previousLtp,
      bid: tick.bid,
      ask: tick.ask,
      bidQuantity: tick.bidQuantity,
      askQuantity: tick.askQuantity,
      tradedQuantity:
        tick.tradedQuantity,
      change,
      changePercent,
      rolling10Return,
      rollingAveragePrice,
      lastUpdated:
        tick.timestamp,
      status: "LIVE",
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
  ): InstrumentState | undefined {
    return this.runtime.get(symbol)?.state;
  }

  getAllStates(): InstrumentState[] {
    return this.instruments.map(
      (instrument) =>
        this.runtime.get(
          instrument.symbol
        )!.state
    );
  }

  getSequence(
    symbol: InstrumentSymbol
  ): number {
    return (
      this.runtime.get(symbol)
        ?.lastSequence ?? 0
    );
  }
}