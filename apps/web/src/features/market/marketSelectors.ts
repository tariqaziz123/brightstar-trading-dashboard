import { createSelector } from "@reduxjs/toolkit";
import {
  instruments,
  type InstrumentState,
  type InstrumentSymbol,
} from "@brightstar/shared";

import type { RootState } from "../../app/store";

export const selectMarketState = (state: RootState) =>
  state.market;

export const selectConnectionStatus = (state: RootState) =>
  state.market.connectionStatus;

export const selectLastEventAt = (state: RootState) =>
  state.market.lastEventAt;

export const selectInstrumentBySymbol =
  (symbol: InstrumentSymbol) =>
  (state: RootState) =>
    state.market.bySymbol[symbol];

export const selectAllInstruments = createSelector(
  [(state: RootState) => state.market.bySymbol],
  (bySymbol): InstrumentState[] =>
    Object.values(bySymbol).filter(
      (instrument): instrument is InstrumentState =>
        instrument !== undefined
    )
);

/**
 * Single source of truth for the tracked instrument order.
 * The list comes from the shared instrument configuration.
 */
export const instrumentSymbols: InstrumentSymbol[] =
  instruments.map((instrument) => instrument.symbol);

export const selectInstrumentSymbols = (
  state: RootState
): InstrumentSymbol[] => {
  return instrumentSymbols.filter(
    (symbol) => state.market.bySymbol[symbol] !== undefined
  );
};