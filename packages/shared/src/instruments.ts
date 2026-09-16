import type { InstrumentConfig } from "./types.js";

export const instruments: InstrumentConfig[] = [
  {
    symbol: "NIFTY",
    seedPrice: 25180.5,
    maxStdDev: 0.0025,
    volatility: 0.0008,
    tickIntervalMs: 100
  },
  {
    symbol: "BANKNIFTY",
    seedPrice: 54200,
    maxStdDev: 0.004,
    volatility: 0.0012,
    tickIntervalMs: 100
  },
  {
    symbol: "RELIANCE",
    seedPrice: 2845.2,
    maxStdDev: 0.003,
    volatility: 0.001,
    tickIntervalMs: 100
  },
  {
    symbol: "HDFCBANK",
    seedPrice: 1765.4,
    maxStdDev: 0.0025,
    volatility: 0.0009,
    tickIntervalMs: 100
  },
  {
    symbol: "INFY",
    seedPrice: 1522.1,
    maxStdDev: 0.0035,
    volatility: 0.0011,
    tickIntervalMs: 100
  },
  {
    symbol: "TCS",
    seedPrice: 3210.4,
    maxStdDev: 0.0025,
    volatility: 0.0008,
    tickIntervalMs: 100
  }
];