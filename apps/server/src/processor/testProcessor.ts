import {
  instruments,
  type MarketTick
} from "@brightstar/shared";

import { MarketProcessor } from "./MarketProcessor";

const processor =
  new MarketProcessor(instruments);

const tick: MarketTick = {
  symbol: "NIFTY",
  timestamp: Date.now(),
  sequence: 1,

  ltp: 25200,

  bid: 25199.95,
  ask: 25200.05,

  bidQuantity: 100,
  askQuantity: 150,
  tradedQuantity: 200
};
const olderTick: MarketTick = {
  ...tick,
  sequence: 2,
  timestamp: tick.timestamp - 1000,
  ltp: 25190
};

processor.processTick(olderTick);


const result =
  processor.processTick(tick);

console.log(result);