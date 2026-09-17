import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type {
  ConnectionStatus,
  InstrumentState,
  InstrumentSymbol,
  MarketStateEvent,
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

  connectionStatus:
    "DISCONNECTED",

  lastEventAt: null,
};

const marketSlice = createSlice({
  name: "market",

  initialState,

  reducers: {
    upsertInstrument(
      state,
      action: PayloadAction<
        MarketStateEvent["payload"]
      >
    ) {
      const instrument =
        action.payload;

      const current =
        state.bySymbol[
          instrument.symbol
        ];

      if (
        current &&
        instrument.sequence <=
          current.sequence
      ) {
        return;
      }

      state.bySymbol[
        instrument.symbol
      ] = instrument;

      state.lastEventAt = Math.max(
        state.lastEventAt ?? 0,
        instrument.lastUpdated
      );
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
      action: PayloadAction<
        InstrumentState[]
      >
    ) {
      for (const instrument of
        action.payload) {
        const current =
          state.bySymbol[
            instrument.symbol
          ];

        if (
          current &&
          instrument.sequence <=
            current.sequence
        ) {
          continue;
        }

        state.bySymbol[
          instrument.symbol
        ] = instrument;
      }

      if (
        action.payload.length > 0
      ) {
        state.lastEventAt =
          Math.max(
            state.lastEventAt ?? 0,
            ...action.payload.map(
              (instrument) =>
                instrument.lastUpdated
            )
          );
      }
    },

    upsertInstruments(
      state,
      action: PayloadAction<
        MarketStateEvent["payload"][]
      >
    ) {
      for (const instrument of
        action.payload) {
        const current =
          state.bySymbol[
            instrument.symbol
          ];

        if (
          current &&
          instrument.sequence <=
            current.sequence
        ) {
          continue;
        }

        state.bySymbol[
          instrument.symbol
        ] = instrument;
      }

      if (
        action.payload.length > 0
      ) {
        state.lastEventAt =
          Math.max(
            state.lastEventAt ?? 0,
            ...action.payload.map(
              (instrument) =>
                instrument.lastUpdated
            )
          );
      }
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