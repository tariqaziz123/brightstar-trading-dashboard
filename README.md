# Brightstar Real-Time Market Watch

A real-time market monitoring dashboard built as a take-home assignment for **Brightstar Research Pvt. Ltd.**

The application simulates high-frequency market data on the backend, streams updates to the frontend over WebSockets, performs in-flight market calculations, and renders the latest state efficiently using React and Redux Toolkit.

---

## Overview

The application provides a real-time market watch and momentum scanner for six instruments:

* NIFTY
* BANKNIFTY
* RELIANCE
* HDFCBANK
* INFY
* TCS

The backend generates deterministic market ticks approximately every **100ms per instrument**, resulting in approximately:

```text
6 instruments × 10 ticks/sec = 60 ticks/sec
```

Each market event contains the latest price, bid/ask information, quantities, sequence number, timestamp, and calculated momentum metrics.

The frontend consumes the stream over WebSocket and updates the UI using **50ms batching** to avoid unnecessary React renders.

---

## Key Features

* Real-time WebSocket market streaming
* Deterministic market data simulator
* 6 configurable financial instruments
* Approximately 60 market events/sec
* Redux Toolkit state management
* Normalized state by instrument symbol
* 50ms frontend event batching
* Memoized market rows
* Selective row-level Redux subscriptions
* Top gainers and top losers
* Momentum scanner
* Rolling 10-tick return
* Rolling average price
* Change and change percentage
* Bid/ask spread
* Traded quantity
* Sequence-number ordering protection
* Duplicate event protection
* Out-of-order event protection
* Malformed event validation
* Unknown-symbol validation
* WebSocket automatic reconnect
* Exponential reconnect backoff
* REST snapshot recovery
* Stale-data detection
* Connection status monitoring
* Backend unit tests with Vitest
* TypeScript strict mode
* Scalable architecture documentation

---

# Architecture

```text
                         ┌──────────────────────────┐
                         │       Market Simulator    │
                         │                          │
                         │  Deterministic PRNG      │
                         │  GBM-style price model   │
                         └────────────┬─────────────┘
                                      │
                                      │ MarketTick
                                      ▼
                         ┌──────────────────────────┐
                         │     Market Processor      │
                         │                          │
                         │ Validation               │
                         │ Ordering checks          │
                         │ Change calculation       │
                         │ Rolling metrics          │
                         │ Latest state per symbol  │
                         └────────────┬─────────────┘
                                      │
                                      │ Processed state
                                      ▼
                         ┌──────────────────────────┐
                         │      WebSocket Server    │
                         │                          │
                         │ /stream                  │
                         │ Broadcast to clients     │
                         └────────────┬─────────────┘
                                      │
                                      │ MARKET_TICK
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                         │
│                                                                 │
│  WebSocket Client                                               │
│        │                                                        │
│        ▼                                                        │
│  50ms Event Batching                                            │
│        │                                                        │
│        ▼                                                        │
│  Redux Toolkit Store                                            │
│        │                                                        │
│        ├───────────────┐                                        │
│        │               │                                        │
│        ▼               ▼                                        │
│  Market Table     Top Movers / Momentum                         │
│                                                                 │
│  Memoized rows + symbol-level subscriptions                     │
└─────────────────────────────────────────────────────────────────┘
```

---

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Redux Toolkit
* WebSocket API
* CSS

## Backend

* Node.js
* Express
* TypeScript
* WebSocket (`ws`)
* Vitest

## Shared

* TypeScript shared package
* Shared market/event types
* Shared instrument configuration

---

# Project Structure

```text
brightstar-trading-dashboard/
│
├── apps/
│   │
│   ├── server/
│   │   ├── src/
│   │   │   ├── processor/
│   │   │   │   ├── calculations.ts
│   │   │   │   ├── MarketProcessor.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── validation.ts
│   │   │   │
│   │   │   ├── simulator/
│   │   │   │   └── MarketSimulator.ts
│   │   │   │
│   │   │   ├── websocket/
│   │   │   │   └── MarketWebSocket.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/
│       ├── app/
│       │
│       ├── features/
│       │   └── market/
│       │       ├── components/
│       │       ├── marketConfig.ts
│       │       ├── marketSelectors.ts
│       │       ├── marketSlice.ts
│       │       ├── marketWebSocket.ts
│       │       └── useMarketStream.ts
│       │
│       ├── app/
│       │   ├── hooks.ts
│       │   └── store.ts
│       │
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/
│       └── src/
│           ├── instruments.ts
│           ├── types.ts
│           └── index.ts
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# Getting Started

## Prerequisites

* Node.js 20+
* npm 10+

Check your versions:

```bash
node --version
npm --version
```

---

# Installation

Clone the repository and install dependencies from the root directory:

```bash
npm install
```

The project uses **npm workspaces**.

---

# Environment Variables

Create a `.env` file if environment-specific configuration is required.

Example:

```env
SERVER_PORT=4000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000/stream
```

The frontend defaults to:

```text
REST:
http://localhost:4000

WebSocket:
ws://localhost:4000/stream
```

---

# Running the Application

Start both frontend and backend:

```bash
npm run dev
```

The development setup starts:

```text
Frontend → Next.js
Backend  → Express + WebSocket
```

The frontend will normally be available at:

```text
http://localhost:3000
```

The backend will normally be available at:

```text
http://localhost:4000
```

---

# Useful Commands

## Development

```bash
npm run dev
```

## Type Check

```bash
npm run typecheck
```

## Run Backend Tests

```bash
npm run test -w @brightstar/server
```

## Production Build

```bash
npm run build
```

## Start Backend

```bash
npm run start -w @brightstar/server
```

## Start Frontend

```bash
npm run start -w @brightstar/web
```

---

# Market Simulator

The backend does not depend on a real stock market API.

Instead, it uses a deterministic market simulator.

Each instrument has its own configuration:

```ts
{
  symbol: "NIFTY",
  seedPrice: 25180.5,
  maxStdDev: 0.0025,
  volatility: 0.0008,
  tickIntervalMs: 100
}
```

The simulator generates a new price approximately every 100ms.

---

# Price Simulation

The simulator uses a simplified geometric Brownian motion style model.

The basic price movement is:

```text
S(t + dt) = S(t) × exp(volatility × √dt × Z)
```

Where:

* `S` = current price
* `dt` = tick interval in seconds
* `volatility` = configured volatility
* `Z` = standard normal random variable

A deterministic seeded pseudo-random number generator is used so that simulations are reproducible.

A standard normal distribution is generated using the Box-Muller transform.

The generated price is also bounded by the instrument's configured maximum movement.

This keeps the simulator realistic enough for UI and architecture testing without depending on an external market data provider.

---

# Market Event Model

The main streaming event is:

```ts
interface MarketStateEvent {
  type: "MARKET_TICK";
  timestamp: number;
  payload: InstrumentState;
}
```

The instrument state contains:

```ts
interface InstrumentState {
  symbol: InstrumentSymbol;
  sequence: number;
  ltp: number;
  previousLtp: number;
  bid: number;
  ask: number;
  bidQuantity: number;
  askQuantity: number;
  tradedQuantity: number;
  change: number;
  changePercent: number;
  rolling10Return: number;
  rollingAveragePrice: number;
  lastUpdated: number;
  status: "LIVE" | "STALE";
}
```

Example:

```json
{
  "type": "MARKET_TICK",
  "timestamp": 1726500000000,
  "payload": {
    "symbol": "NIFTY",
    "sequence": 125,
    "ltp": 25192.45,
    "previousLtp": 25190.12,
    "bid": 25192.40,
    "ask": 25192.50,
    "bidQuantity": 120,
    "askQuantity": 95,
    "tradedQuantity": 48200,
    "change": 11.95,
    "changePercent": 0.0475,
    "rolling10Return": 0.18,
    "rollingAveragePrice": 25189.74,
    "lastUpdated": 1726500000000,
    "status": "LIVE"
  }
}
```

---

# Backend Processing

The backend processes every generated tick before broadcasting it.

The processing pipeline is:

```text
Generated Tick
      │
      ▼
Validate Event
      │
      ▼
Validate Symbol
      │
      ▼
Validate Sequence
      │
      ▼
Validate Timestamp
      │
      ▼
Update Price History
      │
      ▼
Calculate Derived Metrics
      │
      ▼
Update Latest Instrument State
      │
      ▼
Broadcast via WebSocket
```

---

# In-Flight Calculations

The backend calculates derived values before sending data to the frontend.

This avoids repeatedly calculating market metrics inside React render cycles.

## Change

```text
change = currentPrice - previousPrice
```

## Change Percentage

```text
changePercent =
  ((currentPrice - previousPrice) / previousPrice) × 100
```

## Rolling 10-Tick Return

```text
rolling10Return =
  ((latestPrice - price10TicksAgo) / price10TicksAgo) × 100
```

## Rolling Average

The processor maintains a maximum of the latest 10 prices:

```text
rollingAveragePrice =
  sum(last 10 prices) / number of prices
```

The rolling history is maintained independently for each instrument.

---

# Sequence Numbers

Every generated market tick contains a monotonically increasing sequence number per instrument.

Example:

```text
NIFTY

sequence 101
sequence 102
sequence 103
sequence 104
...
```

Sequence numbers provide protection against:

* Duplicate events
* Out-of-order events
* Replayed events
* Delayed network messages

The backend rejects an event when:

```text
incomingSequence <= lastProcessedSequence
```

The frontend also performs the same protection before updating Redux state.

This provides ordering protection on both sides of the system.

---

# Timestamp Ordering

In addition to sequence numbers, the backend tracks the latest accepted timestamp.

An event is rejected when:

```text
incomingTimestamp < lastProcessedTimestamp
```

This provides an additional safeguard against stale events arriving after newer market data.

---

# Validation

The backend validates incoming/generated market events before processing them.

Validation includes:

* Known instrument symbol
* Finite timestamp
* Positive integer sequence
* Positive LTP
* Positive bid
* Positive ask
* `bid < ask`
* Valid bid quantity
* Valid ask quantity
* Valid traded quantity

Malformed or invalid events are rejected instead of corrupting the current market state.

---

# Frontend State Management

Redux Toolkit is used for market state management.

The state is normalized by instrument symbol:

```ts
{
  bySymbol: {
    NIFTY: {...},
    BANKNIFTY: {...},
    RELIANCE: {...},
    HDFCBANK: {...},
    INFY: {...},
    TCS: {...}
  },

  connectionStatus: "CONNECTED",

  lastEventAt: 1726500000000
}
```

This makes instrument updates O(1) by symbol.

For example:

```ts
state.bySymbol[instrument.symbol] = instrument;
```

---

# Why Normalize by Symbol?

The stream continuously updates individual instruments.

Instead of replacing an entire array:

```ts
[
  nifty,
  bankNifty,
  reliance,
  ...
]
```

the application stores instruments by key:

```ts
bySymbol[symbol]
```

This provides:

* Fast lookup
* Targeted updates
* Easier selector design
* Less unnecessary work
* Better scalability for larger instrument sets

---

# WebSocket Streaming

The backend exposes:

```text
GET /stream
```

using WebSocket.

The frontend establishes a persistent connection:

```text
Browser
   │
   │ WebSocket
   ▼
Server
   │
   ├── NIFTY
   ├── BANKNIFTY
   ├── RELIANCE
   ├── HDFCBANK
   ├── INFY
   └── TCS
```

Each accepted market update is broadcast to connected clients.

---

# Frontend Batching

The backend can generate approximately 60 events per second.

Dispatching every event independently into Redux would create unnecessary update pressure.

The frontend therefore batches events over a **50ms window**.

The flow is:

```text
WebSocket events
      │
      ▼
Pending Map<Symbol, LatestEvent>
      │
      │ 50ms
      ▼
Flush latest event per symbol
      │
      ▼
Redux
      │
      ▼
React
```

If multiple events for the same symbol arrive during the same batch window, only the latest event is retained.

For example:

```text
NIFTY seq 101
NIFTY seq 102
NIFTY seq 103
NIFTY seq 104
```

Instead of dispatching four updates, the batch can dispatch:

```text
NIFTY seq 104
```

This reduces unnecessary Redux and React work while preserving the latest state.

---

# React Rendering Strategy

The market table is designed so that an update to one instrument does not require every row to perform the same subscription work.

Each market row is memoized:

```text
MarketTable
   │
   ├── Memoized MarketRow(NIFTY)
   ├── Memoized MarketRow(BANKNIFTY)
   ├── Memoized MarketRow(RELIANCE)
   ├── Memoized MarketRow(HDFCBANK)
   ├── Memoized MarketRow(INFY)
   └── Memoized MarketRow(TCS)
```

Each row selects its own instrument state using its symbol.

This reduces unnecessary rerenders as market updates arrive continuously.

---

# Selectors

Stable selectors are used for:

* Individual instrument
* All instruments
* Top gainers
* Top losers
* Momentum leaders

Top movers are calculated using memoized selectors rather than repeatedly sorting data inside render functions.

---

# Momentum Scanner

The dashboard exposes momentum information using the rolling 10-tick return.

Example:

```text
Symbol       Momentum
---------------------
RELIANCE     +0.42%
NIFTY        +0.31%
INFY         -0.08%
```

The top-mover selectors derive:

* Top gainers
* Top losers
* Momentum leaders

---

# Change Visualization

The UI follows the requested change thresholds:

```text
> +1%             Strong Positive

+0.25% to +1%     Positive

-0.25% to +0.25%  Neutral

-1% to -0.25%     Negative

< -1%             Strong Negative
```

These thresholds are applied consistently to change/momentum presentation.

---

# Connection State

The application tracks the WebSocket lifecycle.

Supported connection states include:

```text
CONNECTED
DISCONNECTED
RECONNECTING
```

The UI also derives:

```text
STALE DATA
```

when the connection exists but market updates have not arrived within the configured stale threshold.

---

# Reconnection

The frontend automatically attempts to reconnect when the WebSocket connection is lost.

The reconnect strategy uses exponential backoff:

```text
1s
2s
4s
8s
```

The delay is capped at 8 seconds.

After a successful connection, the backoff is reset.

This prevents aggressive reconnect loops when the backend is unavailable.

---

# Snapshot Recovery

When the WebSocket reconnects successfully, the frontend requests:

```text
GET /snapshot
```

The backend returns the latest state maintained by the `MarketProcessor`.

The recovery flow is:

```text
WebSocket disconnect
        │
        ▼
Automatic reconnect
        │
        ▼
WebSocket connected
        │
        ▼
GET /snapshot
        │
        ▼
Restore latest backend state
```

Snapshot data is also protected by sequence-number checks.

Therefore, an older snapshot cannot overwrite a newer live WebSocket event that has already reached Redux.

---

# Stale Data Detection

The frontend monitors the timestamp of the latest received market event.

The stale threshold is currently:

```text
1000ms
```

If:

```text
currentTime - lastEventAt > staleThreshold
```

the UI reports:

```text
STALE DATA
```

This is separate from the WebSocket connection state.

For example:

```text
WebSocket: CONNECTED
Market updates: not received for > threshold

Result:
STALE DATA
```

This distinction is important because an open TCP/WebSocket connection does not necessarily mean that fresh market data is flowing.

---

# REST APIs

## Health

```http
GET /health
```

Example:

```json
{
  "status": "ok",
  "timestamp": 1726500000000
}
```

Used to verify backend availability.

---

## Instruments

```http
GET /instruments
```

Returns the configured instrument definitions.

Example:

```json
[
  {
    "symbol": "NIFTY",
    "seedPrice": 25180.5,
    "maxStdDev": 0.0025,
    "volatility": 0.0008,
    "tickIntervalMs": 100
  }
]
```

---

## Snapshot

```http
GET /snapshot
```

Returns the latest processed state for every instrument.

Example:

```json
{
  "timestamp": 1726500000000,
  "instruments": [
    {
      "symbol": "NIFTY",
      "sequence": 120,
      "ltp": 25191.2
    }
  ]
}
```

The snapshot is used for reconnect recovery.

---

# WebSocket API

## Endpoint

```text
ws://localhost:4000/stream
```

## Event

```text
MARKET_TICK
```

Example structure:

```json
{
  "type": "MARKET_TICK",
  "timestamp": 1726500000000,
  "payload": {
    "symbol": "NIFTY",
    "sequence": 125,
    "ltp": 25192.45,
    "previousLtp": 25190.12,
    "bid": 25192.40,
    "ask": 25192.50,
    "bidQuantity": 120,
    "askQuantity": 95,
    "tradedQuantity": 48200,
    "change": 11.95,
    "changePercent": 0.0475,
    "rolling10Return": 0.18,
    "rollingAveragePrice": 25189.74,
    "lastUpdated": 1726500000000,
    "status": "LIVE"
  }
}
```

---

# Fault Tolerance

The application handles several failure scenarios.

## Malformed Events

Malformed WebSocket events are ignored by the frontend.

The backend validates market events before processing.

---

## Unknown Symbols

Events containing an unknown symbol are rejected.

This prevents unexpected data from entering the market state.

---

## Duplicate Events

Sequence numbers prevent duplicate events from overwriting current state.

Example:

```text
Current: sequence 105

Incoming: sequence 105

Result:
Ignored
```

---

## Out-of-Order Events

Example:

```text
Current sequence: 105

Incoming sequence: 103
```

Result:

```text
Ignored
```

---

## Backend Restart

When the backend goes down:

```text
CONNECTED
    ↓
DISCONNECTED
    ↓
RECONNECTING
```

When the backend returns:

```text
RECONNECTING
    ↓
CONNECTED
    ↓
GET /snapshot
    ↓
Restore latest state
```

The user does not need to refresh the page.

---

# Performance Design

The primary performance goal is to keep high-frequency market updates from causing unnecessary rendering work.

The implementation uses several techniques.

## 1. Event Batching

Updates are grouped within a 50ms window.

```text
60 events/sec
      ↓
50ms batching
      ↓
fewer Redux dispatches
```

---

## 2. Latest-Value Deduplication

The pending batch uses:

```ts
Map<InstrumentSymbol, InstrumentState>
```

Only the latest event for a symbol is retained during the batch.

---

## 3. Normalized State

Market state is stored by symbol.

This avoids searching through arrays for every update.

---

## 4. Row-Level Subscriptions

Each market row subscribes to its own instrument.

Therefore, an update to:

```text
NIFTY
```

does not require unrelated rows to recompute their selected state.

---

## 5. Memoized Rows

Market rows use `React.memo`.

This prevents rerendering when their relevant props/state have not changed.

---

## 6. Memoized Selectors

Derived values such as top movers are calculated through memoized selectors.

---

## 7. Backend Calculations

Derived market metrics are calculated before data reaches React.

This keeps repeated calculations out of render logic.

---

# Complexity

For a single market event:

```text
Symbol lookup: O(1)

State update: O(1)

Rolling history update: O(1) amortized

Rolling average: O(10)
```

Because the rolling window is limited to 10 ticks, the calculation remains effectively constant for the current design.

Top movers require sorting the instrument collection.

With `N` instruments:

```text
O(N log N)
```

For the current six instruments this is negligible.

At larger scale, top movers can be optimized using heaps, partitioning, or server-side aggregation.

---

# Scaling to 10,000 Instruments

The current implementation intentionally keeps the architecture simple for a local take-home assignment.

For approximately 10,000 instruments, I would separate market ingestion, processing, state storage, and WebSocket delivery.

A possible architecture:

```text
Market Feed
    │
    ▼
Kafka / Event Stream
    │
    ├── Partition 1
    ├── Partition 2
    ├── Partition 3
    └── ...
    │
    ▼
Market Processing Workers
    │
    ├── Validation
    ├── Ordering
    ├── Rolling calculations
    └── Latest state
    │
    ▼
Distributed State Store
    │
    ▼
WebSocket Gateway
    │
    ▼
Clients
```

---

# Scaling to 50,000 Ticks/sec

At 50,000 ticks/sec, a single Node.js process should not be responsible for every stage of ingestion and fan-out.

I would introduce:

### Event Streaming

Use Kafka or another durable partitioned event stream.

Partitioning can be based on:

```text
instrument symbol
```

This preserves ordering for a given instrument while allowing parallel processing across partitions.

### Processing Workers

Multiple worker instances process different partitions.

### Shared State

Use a distributed state store for latest instrument state.

### WebSocket Gateway

Separate WebSocket connection handling from market processing.

This allows WebSocket gateways to scale horizontally based on the number of connected clients.

---

# Multiple Backend Instances

For five backend instances:

```text
                  Load Balancer
                       │
          ┌────────────┼────────────┐
          │            │            │
       Server 1     Server 2     Server 3
          │            │            │
          └────────────┼────────────┘
                       │
                 Shared Stream
                       │
                  Shared State
```

A shared event stream prevents each server from independently generating or processing conflicting market state.

A shared state store provides a consistent latest-state view for snapshot requests.

---

# Distributed Consistency

Sequence numbers remain important when scaling horizontally.

For a given instrument:

```text
NIFTY sequence 100
NIFTY sequence 101
NIFTY sequence 102
```

The processing system must ensure that sequence ownership remains ordered.

One approach is to partition the event stream by instrument:

```text
hash(symbol) → partition
```

Therefore, all events for:

```text
NIFTY
```

are routed to the same partition.

This allows processing workers to preserve per-instrument ordering while processing different instruments in parallel.

---

# Failure Handling at Scale

Potential failures include:

* Worker crash
* WebSocket gateway crash
* Kafka broker failure
* Network partition
* Delayed events
* Duplicate events
* Consumer restart
* State-store failure

Possible mitigations include:

* Consumer group rebalancing
* Event replay
* Sequence-number validation
* Idempotent state updates
* Replicated state storage
* WebSocket reconnect
* Snapshot recovery
* Health checks
* Load balancing

---

# Why Kafka Would Be Added Later

Kafka is intentionally not required for this local implementation.

The assignment's simulator only produces approximately:

```text
60 ticks/sec
```

A single Node.js process can comfortably handle this workload.

Introducing Kafka locally would add operational complexity without providing meaningful benefits for the assignment's current scale.

At production scale, however, partitioned streaming becomes useful for:

* Horizontal processing
* Durable event delivery
* Replay
* Consumer groups
* Backpressure
* Failure recovery

---

# Backpressure

At higher event rates, the system must prevent producers from overwhelming consumers.

Possible strategies include:

* Bounded queues
* Batch processing
* Consumer lag monitoring
* Partition-based parallelism
* Dropping obsolete intermediate updates when only latest state matters
* WebSocket fan-out throttling

For a market watch UI, the latest state is generally more important than rendering every intermediate tick.

That is why the frontend keeps the latest event per symbol inside each batching window.

---

# Testing

Backend tests use **Vitest**.

The test suite covers the market processor and simulator.

## Market Processor Tests

The processor tests include:

### Valid Tick

A valid market event is accepted and produces updated instrument state.

### Duplicate Sequence

A duplicate sequence number is rejected.

### Out-of-Order Sequence

An older sequence number is rejected.

### Out-of-Order Timestamp

An older timestamp is rejected.

### Rolling Metrics

Rolling return and rolling average are calculated correctly.

### Invalid Market Data

Invalid market events are rejected.

---

# Market Simulator Tests

The simulator tests include:

### Valid Tick Generation

Generated ticks contain valid market data.

### Sequence Increment

Sequence numbers increase for each instrument.

### Price Bounds

Generated price movements remain within the configured maximum movement.

### Determinism

Two simulators initialized with the same configuration produce the same sequence of values.

This makes the simulator predictable and easier to test.

---

# Type Safety

The project uses TypeScript across the frontend, backend, and shared package.

Shared market types are defined once in:

```text
packages/shared
```

This avoids duplicating event contracts between the backend and frontend.

The project is configured with strict TypeScript checking.

Run:

```bash
npm run typecheck
```

---

# Design Decisions

## Why WebSocket?

Market data is continuously changing.

Polling would introduce:

* Request overhead
* Higher latency
* Unnecessary repeated HTTP requests

WebSocket provides a persistent connection and server-to-client streaming.

---

## Why Redux Toolkit?

Redux Toolkit provides:

* Predictable state updates
* Centralized market state
* Good developer tooling
* Efficient immutable update handling
* Clear separation between streaming data and UI components

It also makes normalized state management straightforward.

---

## Why Batch on the Frontend?

The backend produces data faster than a human can visually consume it.

There is little value in forcing React to render every single intermediate tick.

A 50ms batch provides a balance between:

```text
Freshness
```

and:

```text
Rendering efficiency
```

---

## Why Calculate Metrics on the Backend?

Market calculations are data-processing concerns.

Keeping them on the backend:

* Centralizes business logic
* Avoids duplicated calculations
* Keeps React components simpler
* Reduces render-time computation

---

## Why Keep Latest State Per Instrument?

The dashboard primarily displays the latest market state.

Keeping every historical tick in Redux would unnecessarily increase memory usage and state-update overhead.

Only the small rolling history required for calculations is maintained by the processor.

---

# Tradeoffs

## In-Memory State

The current backend keeps state in memory.

### Advantage

Simple and fast for the assignment.

### Limitation

State is lost when the backend process terminates.

### Production Improvement

Use a durable/shared state store if persistence or horizontal scaling is required.

---

## Local Simulator

### Advantage

No external API dependency.

### Limitation

It does not represent actual exchange-market behavior.

### Production Improvement

Replace the simulator with a real market data feed adapter.

---

## Single WebSocket Process

### Advantage

Simple deployment and easy local testing.

### Limitation

Not sufficient for very large client counts.

### Production Improvement

Use horizontally scalable WebSocket gateways behind a load balancer with shared streaming infrastructure.

---

## 50ms Frontend Batch

### Advantage

Reduces render pressure.

### Limitation

Introduces a small amount of display latency.

### Tradeoff

For a visual monitoring dashboard, reducing unnecessary renders is generally more valuable than rendering every intermediate tick.

---

# Security Considerations

The current assignment does not require authentication.

For a production deployment, I would add:

* Authentication
* Authorization
* TLS/WSS
* Origin validation
* Rate limiting
* Connection limits
* Input validation
* Structured logging
* Audit logging
* API gateway protection

The WebSocket layer should also enforce maximum message sizes and connection policies.

---

# Observability

For production deployment, useful metrics would include:

```text
ticks_received_total
ticks_rejected_total
ticks_out_of_order_total
websocket_connections
websocket_reconnects
processing_latency_ms
snapshot_latency_ms
consumer_lag
events_per_second
stale_instruments
```

Structured logs should include:

```text
symbol
sequence
timestamp
event type
processing result
error reason
```

This would make debugging high-frequency event issues significantly easier.

---

# Potential Future Improvements

Possible extensions include:

* Real market-data provider integration
* Kafka-based event ingestion
* Redis or another distributed state store
* Historical charts
* Candlestick charts
* Volume analytics
* More sophisticated momentum indicators
* User-configurable watchlists
* Alert rules
* Server-side aggregation
* WebSocket authentication
* Persistent market history
* Worker-thread based calculations
* Virtualized instrument tables
* Performance telemetry
* OpenTelemetry tracing

---

# Local Data Flow Summary

The complete flow is:

```text
1. Simulator generates tick

2. Processor validates tick

3. Processor checks sequence/timestamp

4. Processor updates instrument runtime state

5. Processor calculates:
   - Change
   - Change %
   - Rolling return
   - Rolling average

6. WebSocket server broadcasts MARKET_TICK

7. Frontend receives event

8. Event is placed into pending symbol map

9. Every 50ms latest values are flushed

10. Redux Toolkit updates normalized state

11. Symbol-level selectors provide instrument state

12. Memoized MarketRow renders the updated instrument

13. Connection/stale monitoring continues independently
```

---

# API Summary

| Endpoint       | Method    | Purpose                       |
| -------------- | --------- | ----------------------------- |
| `/health`      | GET       | Backend health                |
| `/instruments` | GET       | Instrument configuration      |
| `/snapshot`    | GET       | Latest processed market state |
| `/stream`      | WebSocket | Real-time market events       |

---

# Performance Summary

Current local configuration:

```text
Instruments:       6
Tick interval:     100ms
Ticks/instrument:  10/sec
Total ticks:       ~60/sec
Frontend batch:    50ms
Rolling window:    10 ticks
```

The application is designed around the principle:

> Process every market event correctly, but render only the amount of information the UI can meaningfully consume.

---

# Validation Checklist

Before submission:

```bash
npm install

npm run typecheck

npm run test -w @brightstar/server

npm run build
```

Expected result:

```text
✓ TypeScript passes
✓ Backend tests pass
✓ Production build passes
```

Manual checks:

```text
✓ Dashboard loads
✓ Market prices update continuously
✓ Change values update
✓ Momentum updates
✓ Top movers update
✓ WebSocket shows CONNECTED
✓ Backend shutdown shows DISCONNECTED
✓ Reconnection shows RECONNECTING
✓ Backend restart reconnects automatically
✓ Snapshot restores latest state
✓ Stale data is detected
✓ No page refresh is required after backend recovery
```

---

# Conclusion

This implementation focuses on the core challenges of a real-time market dashboard:

* Reliable event streaming
* Correct event ordering
* Efficient in-flight computation
* Controlled React rendering
* Predictable state management
* Connection recovery
* Stale-data detection
* Testability
* Clear scalability boundaries

The local implementation intentionally avoids unnecessary infrastructure while keeping the architecture extensible toward a production system capable of handling substantially higher event volumes and multiple backend instances.
