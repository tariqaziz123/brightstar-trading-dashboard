import type {
  MarketStateEvent,
  InstrumentState,
} from "@brightstar/shared";

import {
  setConnectionStatus,
  upsertInstruments,
} from "./marketSlice";

import type { AppDispatch } from "../../app/store";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ??
  "ws://localhost:4000/stream";

const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 8000;

export class MarketWebSocketClient {
  private socket: WebSocket | null = null;

  private reconnectTimer:
    ReturnType<typeof setTimeout> | null = null;

  private reconnectDelay =
    INITIAL_RECONNECT_DELAY;

  private stopped = false;

  constructor(
    private readonly dispatch: AppDispatch,
    private readonly onTick: (
      event: MarketStateEvent
    ) => void
  ) {}

  connect(): void {
    this.stopped = false;

    if (
      this.socket?.readyState ===
      WebSocket.OPEN
    ) {
      return;
    }

    this.dispatch(
      setConnectionStatus("RECONNECTING")
    );

    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      console.log(
        "[WebSocket] Connected"
      );

      this.reconnectDelay =
        INITIAL_RECONNECT_DELAY;

      this.dispatch(
        setConnectionStatus("CONNECTED")
      );

      void this.fetchSnapshot();
    };

    this.socket.onmessage = (message) => {
      this.handleMessage(message.data);
    };

    this.socket.onerror = () => {
      console.warn(
        "[WebSocket] Connection error"
      );
    };

    this.socket.onclose = () => {
      console.log(
        "[WebSocket] Disconnected"
      );

      this.socket = null;

      this.dispatch(
        setConnectionStatus("DISCONNECTED")
      );

      if (!this.stopped) {
        this.scheduleReconnect();
      }
    };
  }

  disconnect(): void {
    this.stopped = true;

    if (this.reconnectTimer) {
      clearTimeout(
        this.reconnectTimer
      );

      this.reconnectTimer = null;
    }

    this.socket?.close();
    this.socket = null;

    this.dispatch(
      setConnectionStatus("DISCONNECTED")
    );
  }

  private handleMessage(
    rawMessage: string
  ): void {
    try {
      const event: unknown =
        JSON.parse(rawMessage);

      if (!this.isMarketTickEvent(event)) {
        console.warn(
          "[WebSocket] Ignoring malformed event"
        );

        return;
      }

      this.onTick(event);
    } catch (error) {
      console.error(
        "[WebSocket] Failed to parse message",
        error
      );
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.dispatch(
      setConnectionStatus("RECONNECTING")
    );

    this.reconnectTimer =
      setTimeout(() => {
        this.reconnectTimer = null;

        this.connect();

        this.reconnectDelay =
          Math.min(
            this.reconnectDelay * 2,
            MAX_RECONNECT_DELAY
          );
      }, this.reconnectDelay);
  }

  private isMarketTickEvent(
    value: unknown
  ): value is MarketStateEvent {
    if (
      typeof value !== "object" ||
      value === null
    ) {
      return false;
    }

    const event =
      value as Record<string, unknown>;

    if (event.type !== "MARKET_TICK") {
      return false;
    }

    if (
      typeof event.timestamp !== "number"
    ) {
      return false;
    }

    if (
      typeof event.payload !== "object" ||
      event.payload === null
    ) {
      return false;
    }

    const payload =
      event.payload as Record<string, unknown>;

    return (
      typeof payload.symbol === "string" &&
      typeof payload.sequence === "number" &&
      typeof payload.ltp === "number" &&
      typeof payload.previousLtp === "number" &&
      typeof payload.bid === "number" &&
      typeof payload.ask === "number" &&
      typeof payload.bidQuantity === "number" &&
      typeof payload.askQuantity === "number" &&
      typeof payload.tradedQuantity === "number" &&
      typeof payload.change === "number" &&
      typeof payload.changePercent === "number" &&
      typeof payload.rolling10Return === "number" &&
      typeof payload.rollingAveragePrice ===
        "number" &&
      typeof payload.lastUpdated === "number" &&
      typeof payload.status === "string"
    );
  }

  private async fetchSnapshot(): Promise<void> {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

      const response = await fetch(
        `${baseUrl}/snapshot`
      );

      if (!response.ok) {
        throw new Error(
          `Snapshot request failed: ${response.status}`
        );
      }

      const data: unknown =
        await response.json();

      if (
        typeof data !== "object" ||
        data === null ||
        !(
          "instruments" in data
        ) ||
        !Array.isArray(
          data.instruments
        )
      ) {
        throw new Error(
          "Invalid snapshot response"
        );
      }

      this.dispatch(
        upsertInstruments(
          data.instruments as InstrumentState[]
        )
      );
    } catch (error) {
      console.warn(
        "[WebSocket] Snapshot recovery failed",
        error
      );
    }
  }
}