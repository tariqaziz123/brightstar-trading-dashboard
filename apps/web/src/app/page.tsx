"use client";

import { useMarketStream } from "../features/market/useMarketStream";
import { MarketTable } from "../components/MarketTable/MarketTable";
import { TopMovers } from "../components/TopMovers/TopMovers";
import { ConnectionStatus } from "../components/ConnectionStatus/ConnectionStatus";
import { PriceChart } from "../components/PriceChart/PriceChart";
import { useMarketStale } from "../features/market/useMarketStale";

import {
  selectAllInstruments,
  selectConnectionStatus,
} from "../features/market/marketSelectors";

import {
  selectTopGainers,
  selectTopLosers,
  selectTopMomentum,
} from "../features/market/topMoversSelectors";

import { useAppSelector } from "../app/hooks";

export default function HomePage() {
  useMarketStream();

  const instruments = useAppSelector(selectAllInstruments);
  const connectionStatus = useAppSelector(selectConnectionStatus);

  const topGainers = useAppSelector(selectTopGainers);
  const topLosers = useAppSelector(selectTopLosers);
  const topMomentum = useAppSelector(selectTopMomentum);

  const isMarketStale = useMarketStale();

  const activeInstruments = instruments.filter(
    (instrument) => instrument.status === "LIVE"
  ).length;

  const totalTradedQuantity = instruments.reduce(
    (total, instrument) => total + instrument.tradedQuantity,
    0
  );

  // Each instrument generates one tick every 100ms = 10 ticks/sec.
  // The value stays dynamic if the tracked instrument count changes.
  const estimatedTicksPerSecond = instruments.length * 10;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-950">
                  B
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Brightstar Research
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Real-Time Market Watch
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Live market prices, momentum and market activity
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <ConnectionStatus
                status={connectionStatus}
                isStale={isMarketStale}
              />

              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Streaming Market Data
              </div>
            </div>
          </div>
        </header>

        {/* Market Metrics */}
        <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Tracked Instruments"
            value={String(instruments.length)}
            detail={`${activeInstruments} currently live`}
          />

          <MetricCard
            label="Market Stream"
            value={`~${estimatedTicksPerSecond}`}
            detail="ticks / second"
          />

          <MetricCard
            label="Traded Quantity"
            value={formatCompactNumber(totalTradedQuantity)}
            detail="across tracked instruments"
          />

          <MetricCard
            label="Stream Status"
            value={connectionStatus}
            detail={
              isMarketStale
                ? "Market data is stale"
                : "Receiving live updates"
            }
            status={connectionStatus === "CONNECTED" && !isMarketStale}
          />
        </section>

        {/* Price Chart */}
        <section className="mb-6">
          <PriceChart instruments={instruments} />
        </section>

        {/* Momentum Scanner */}
        <section className="mb-6">
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Market Overview
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              Momentum Scanner
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <TopMovers
              title="Top 3 Gainers"
              instruments={topGainers}
              metric={(instrument) => instrument.changePercent}
            />

            <TopMovers
              title="Top 3 Losers"
              instruments={topLosers}
              metric={(instrument) => instrument.changePercent}
            />

            <TopMovers
              title="Top 3 Momentum"
              instruments={topMomentum}
              metric={(instrument) => instrument.rolling10Return}
            />
          </div>
        </section>

        {/* Live Market Table */}
        <section>
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Live Market
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              Instrument Monitor
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <MarketTable />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-6 flex flex-col gap-2 border-t border-slate-900 pt-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Brightstar Real-Time Market Watch</span>

          <span>
            WebSocket streaming · Redux Toolkit · 50ms batching
          </span>
        </footer>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  detail,
  status = false,
}: {
  label: string;
  value: string;
  detail: string;
  status?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>

        {status && (
          <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
        )}
      </div>

      <div className="mt-3">
        <p className="truncate text-2xl font-bold tracking-tight text-white">
          {value}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {detail}
        </p>
      </div>
    </div>
  );
}

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return Math.round(value).toString();
}