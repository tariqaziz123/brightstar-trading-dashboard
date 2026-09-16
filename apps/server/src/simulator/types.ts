import type { InstrumentSymbol } from "@brightstar/shared";

export interface SimulatorState {
  symbol: InstrumentSymbol;
  price: number;
  sequence: number;
  tradedQuantity: number;
  random: () => number;
}