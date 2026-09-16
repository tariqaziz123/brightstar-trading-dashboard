export type InstrumentSymbol =
  | "NIFTY"
  | "BANKNIFTY"
  | "RELIANCE"
  | "HDFCBANK"
  | "INFY"
  | "TCS";

  export interface InstrumentConfig {
  symbol: InstrumentSymbol;
  seedPrice: number;
  maxStdDev: number;
  volatility: number;
  tickIntervalMs: number;
}

export interface MarketTick {
  symbol: InstrumentSymbol;
  timestamp: number;
  sequence: number;

  ltp: number;

  bid: number;
  ask: number;

  bidQuantity: number;
  askQuantity: number;

  tradedQuantity: number;
}

export interface MarketTickEvent {
  type: "MARKET_TICK";
  timestamp: number;
  payload: MarketTick;
}