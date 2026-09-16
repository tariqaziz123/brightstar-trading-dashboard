import type {
  InstrumentState,
  InstrumentSymbol
} from "@brightstar/shared";

export interface InstrumentRuntime {
  state: InstrumentState;

  priceHistory: number[];

  lastSequence: number;

  lastTimestamp: number;
}

export type RuntimeState = Map<
  InstrumentSymbol,
  InstrumentRuntime
>;