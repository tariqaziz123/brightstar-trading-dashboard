import express from "express";
import cors from "cors";
import { createServer } from "http";

import {
  instruments
} from "@brightstar/shared";

import { MarketSimulator } from "./simulator/MarketSimulator";
import { MarketProcessor } from "./processor/MarketProcessor";
import { MarketWebSocket } from "./websocket/MarketWebSocket";

const PORT = Number(
  process.env.SERVER_PORT ?? 4000
);

const app = express();

app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const simulator =
  new MarketSimulator(instruments);

const processor =
  new MarketProcessor(instruments);
  
for (const config of instruments) {
  const initialTick =
    simulator.generateTick(config);

  processor.processTick(initialTick);
}

const marketWebSocket =
  new MarketWebSocket(httpServer);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: Date.now()
  });
});

app.get("/instruments", (_req, res) => {
  res.json(instruments);
});

app.get("/snapshot", (_req, res) => {
  res.json({
    timestamp: Date.now(),
    instruments: processor.getAllStates()
  });
});

httpServer.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );

  startMarketSimulation();
});

function startMarketSimulation(): void {
  for (const config of instruments) {
    setInterval(() => {
      const tick =
        simulator.generateTick(config);

      const state =
        processor.processTick(tick);

      if (!state) {
        return;
      }

      marketWebSocket.broadcastState(
        state,
        tick.sequence
      );
    }, config.tickIntervalMs);
  }
}