import {
  createSelector,
} from "@reduxjs/toolkit";

import type {
  InstrumentState,
  InstrumentSymbol,
} from "@brightstar/shared";

import type { RootState } from "../../app/store";

export const selectMarketState = (
  state: RootState
) => state.market;

export const selectConnectionStatus = (
  state: RootState
) => state.market.connectionStatus;

export const selectLastEventAt = (
  state: RootState
) => state.market.lastEventAt;

export const selectInstrumentBySymbol =
  (
    symbol: InstrumentSymbol
  ) =>
  (state: RootState) =>
    state.market.bySymbol[symbol];

export const selectAllInstruments =
  createSelector(
    [
      (state: RootState) =>
        state.market.bySymbol,
    ],
    (bySymbol): InstrumentState[] =>
      Object.values(bySymbol).filter(
        (
          instrument
        ): instrument is InstrumentState =>
          instrument !== undefined
      )
  );

export const selectInstrumentSymbols = (
  state: RootState
) =>
  Object.keys(
    state.market.bySymbol
  ) as InstrumentSymbol[];

export const instrumentSymbols: InstrumentSymbol[] = [
  "NIFTY",
  "BANKNIFTY",
  "RELIANCE",
  "HDFCBANK",
  "INFY",
  "TCS",
];