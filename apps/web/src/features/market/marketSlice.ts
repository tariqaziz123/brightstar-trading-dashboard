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
    /**
     * upsertInstrument updates or inserts a single instrument's state in the market store.
     * @param state - The current market store state.
     * @param action - The action containing the instrument state to be upserted.
     */
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

    /**
     * setConnectionStatus updates the connection status in the market store.
     * @param state - The current market store state.
     * @param action - The action containing the new connection status.
     */
    setConnectionStatus(
      state,
      action: PayloadAction<ConnectionStatus>
    ) {
      state.connectionStatus =
        action.payload;
    },

    /**
     * setSnapshot updates the market store with a snapshot of instrument states.
     * @param state - The current market store state.
     * @param action - The action containing the snapshot of instrument states.
     */
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

    /**
     * upsertInstruments updates or inserts multiple instruments' states in the market store.
     * @param state - The current market store state.
     * @param action - The action containing the array of instrument states to be upserted.
     */
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

    /**
     * clearMarket resets the market store state to its initial state.
     * @param state - The current market store state.
     */
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