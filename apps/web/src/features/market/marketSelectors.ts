import { createSelector } from "@reduxjs/toolkit";
import {
  instruments,
  type InstrumentState,
  type InstrumentSymbol,
} from "@brightstar/shared";

import type { RootState } from "../../app/store";

/**
 * selectMarketState returns the market state from the root state.
 * @param state 
 * @returns 
 */
export const selectMarketState = (state: RootState) =>
  state.market;

/**
 * selectConnectionStatus returns the connection status from the market state.
 * @param state 
 * @returns 
 */
export const selectConnectionStatus = (state: RootState) =>
  state.market.connectionStatus;

/**
 * selectLastEventAt returns the timestamp of the last event from the market state.
 * @param state 
 * @returns 
 */
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

/**
 * selectInstrumentSymbols returns the list of instrument symbols that are present in the market state.
 * @param state 
 * @returns 
 */
export const selectInstrumentSymbols = (
  state: RootState
): InstrumentSymbol[] => {
  return instrumentSymbols.filter(
    (symbol) => state.market.bySymbol[symbol] !== undefined
  );
};