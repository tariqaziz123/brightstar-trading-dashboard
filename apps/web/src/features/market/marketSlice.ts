import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type {
  ConnectionStatus,
  InstrumentState,
  InstrumentSymbol,
} from "@brightstar/shared";

interface MarketStoreState {
  bySymbol: Partial<
    Record<InstrumentSymbol, InstrumentState>
  >;
  connectionStatus: ConnectionStatus;
  lastEventAt: number | null;
}

const initialState: MarketStoreState = {
  bySymbol: {},
  connectionStatus: "DISCONNECTED",
  lastEventAt: null,
};

const marketSlice = createSlice({
  name: "market",

  initialState,

  reducers: {
    upsertInstrument(
      state,
      action: PayloadAction<InstrumentState>
    ) {
      const instrument = action.payload;

      state.bySymbol[instrument.symbol] =
        instrument;

      state.lastEventAt =
        instrument.lastUpdated;
    },

    setConnectionStatus(
      state,
      action: PayloadAction<ConnectionStatus>
    ) {
      state.connectionStatus =
        action.payload;
    },

    setSnapshot(
      state,
      action: PayloadAction<InstrumentState[]>
    ) {
      for (const instrument of action.payload) {
        state.bySymbol[instrument.symbol] =
          instrument;
      }

      state.lastEventAt =
        action.payload.length > 0
          ? Math.max(
              ...action.payload.map(
                (instrument) =>
                  instrument.lastUpdated
              )
            )
          : null;
    },

    upsertInstruments(
  state,
  action: PayloadAction<InstrumentState[]>
) {
  for (const instrument of action.payload) {
    state.bySymbol[instrument.symbol] =
      instrument;
  }

  state.lastEventAt =
    action.payload.length > 0
      ? Math.max(
          ...action.payload.map(
            (instrument) =>
              instrument.lastUpdated
          )
        )
      : state.lastEventAt;
},

    clearMarket(state) {
      state.bySymbol = {};
      state.lastEventAt = null;
    },
  },
});

export const {
  upsertInstrument,
  setConnectionStatus,
  setSnapshot,
  upsertInstruments,
  clearMarket,
} = marketSlice.actions;

export default marketSlice.reducer;