"use client";

import { useEffect, useRef } from "react";

import type {
  InstrumentSymbol,
  MarketStateEvent,
} from "@brightstar/shared";

import {
  upsertInstruments,
} from "./marketSlice";

import { MarketWebSocketClient } from "./marketWebSocket";
import {
  useAppDispatch,
} from "../../app/hooks";

const BATCH_INTERVAL_MS = 50;

export function useMarketStream(): void {
  const dispatch = useAppDispatch();

  const pendingTicks =
    useRef(
      new Map<
        InstrumentSymbol,
        MarketStateEvent["payload"]
      >()
    );

  const clientRef =
    useRef<MarketWebSocketClient | null>(null);

  useEffect(() => {
    let mounted = true;

    const flushPendingTicks = () => {
      if (!mounted) {
        return;
      }

      const ticks =
        Array.from(
          pendingTicks.current.values()
        );

      pendingTicks.current.clear();

      if (ticks.length > 0) {
  dispatch(
    upsertInstruments(ticks)
  );
}
    };

    const client =
      new MarketWebSocketClient(
        dispatch,
        (event) => {
          pendingTicks.current.set(
            event.payload.symbol,
            event.payload
          );
        }
      );

    clientRef.current = client;

    const batchTimer =
      setInterval(
        flushPendingTicks,
        BATCH_INTERVAL_MS
      );

    client.connect();

    return () => {
      mounted = false;

      clearInterval(batchTimer);

      pendingTicks.current.clear();

      client.disconnect();

      clientRef.current = null;
    };
  }, [dispatch]);
}