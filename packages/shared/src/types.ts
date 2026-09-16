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

export type ConnectionStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "RECONNECTING";

export interface InstrumentState {
  symbol: InstrumentSymbol;

  ltp: number;
  previousLtp: number;

  bid: number;
  ask: number;

  bidQuantity: number;
  askQuantity: number;
  tradedQuantity: number;

  change: number;
  changePercent: number;

  rolling10Return: number;
  rollingAveragePrice: number;

  lastUpdated: number;
  status: "LIVE" | "STALE";
}

export interface MarketState {
  bySymbol: Record<InstrumentSymbol, InstrumentState>;

  connectionStatus: ConnectionStatus;

  lastEventAt: number | null;
}

export interface MarketSnapshot {
  timestamp: number;
  instruments: InstrumentState[];
}

export interface HealthResponse {
  status: "ok";
  timestamp: number;
}