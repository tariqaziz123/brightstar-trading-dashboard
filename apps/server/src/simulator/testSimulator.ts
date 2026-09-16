import { instruments } from "@brightstar/shared";
import { MarketSimulator } from "./MarketSimulator";

const simulator = new MarketSimulator(instruments);

for (let i = 0; i < 5; i++) {
  const ticks = simulator.getSnapshot();

  console.log(
    ticks.map((tick) => ({
      symbol: tick.symbol,
      sequence: tick.sequence,
      ltp: tick.ltp,
      bid: tick.bid,
      ask: tick.ask
    }))
  );
}