import {
  createSelector,
} from "@reduxjs/toolkit";

import type {
  InstrumentState,
} from "@brightstar/shared";

import {
  selectAllInstruments,
} from "./marketSelectors";

/**
 * Creates a selector that sorts instruments by a given metric.
 * @param metric 
 * @returns 
 */
const selectSortedBy =
  (
    metric: (
      instrument: InstrumentState
    ) => number
  ) =>
  createSelector(
    [selectAllInstruments],
    (instruments): InstrumentState[] =>
      [...instruments]
        .sort(
          (first, second) =>
            metric(second) - metric(first)
        )
        .slice(0, 3)
  );

export const selectTopGainers =
  selectSortedBy(
    (instrument) =>
      instrument.changePercent
  );

export const selectTopLosers =
  createSelector(
    [selectAllInstruments],
    (instruments): InstrumentState[] =>
      [...instruments]
        .sort(
          (first, second) =>
            first.changePercent -
            second.changePercent
        )
        .slice(0, 3)
  );
  
export const selectTopMomentum =
  selectSortedBy(
    (instrument) =>
      instrument.rolling10Return
  );