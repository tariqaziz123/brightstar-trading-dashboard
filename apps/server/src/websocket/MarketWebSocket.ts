import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";

import type {
  InstrumentState,
  MarketStateEvent,
} from "@brightstar/shared";

export class MarketWebSocket {
  private readonly clients = new Set<WebSocket>();

  private readonly wss: WebSocketServer;

  /**
   * Creates an instance of MarketWebSocket.
   * @param server 
   */
  constructor(server: Server) {
    this.wss = new WebSocketServer({
      server,
      path: "/stream"
    });

    this.setup();
  }

  /**
   * Broadcasts the current state of an instrument to all connected clients.
   * @param state 
   * @param sequence 
   */
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

/**   * Closes the WebSocket server and all connected clients.
   */
  close(): void {
    for (const client of this.clients) {
      client.close();
    }

    this.wss.close();
  }

  /**
   * Sets up the WebSocket server and event listeners.
   */
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