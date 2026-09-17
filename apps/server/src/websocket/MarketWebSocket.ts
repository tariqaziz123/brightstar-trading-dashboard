import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";

import type {
  InstrumentState,
  MarketStateEvent,
} from "@brightstar/shared";

export class MarketWebSocket {
  private readonly clients = new Set<WebSocket>();

  private readonly wss: WebSocketServer;

  constructor(server: Server) {
    this.wss = new WebSocketServer({
      server,
      path: "/stream"
    });

    this.setup();
  }

broadcastState(
  state: InstrumentState,
  sequence: number
): void {
  const event: MarketStateEvent = {
    type: "MARKET_TICK",
    timestamp: Date.now(),
    payload: {
      ...state,
      sequence,
    },
  };

  const message = JSON.stringify(event);

  for (const client of this.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

  close(): void {
    for (const client of this.clients) {
      client.close();
    }

    this.wss.close();
  }

  private setup(): void {
    this.wss.on("connection", (socket) => {
      this.clients.add(socket);

      console.log(
        `[WebSocket] Client connected. Clients: ${this.clients.size}`
      );

      socket.on("close", () => {
        this.clients.delete(socket);

        console.log(
          `[WebSocket] Client disconnected. Clients: ${this.clients.size}`
        );
      });

      socket.on("error", (error) => {
        console.error(
          "[WebSocket] Client error",
          error
        );

        this.clients.delete(socket);
      });
    });
  }
}