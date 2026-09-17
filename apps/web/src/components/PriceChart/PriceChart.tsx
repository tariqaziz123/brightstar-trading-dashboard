"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  InstrumentState,
  InstrumentSymbol,
} from "@brightstar/shared";

type PriceChartProps = {
  instruments: InstrumentState[];
};

const MAX_POINTS = 100;

/**
 * PriceChart is a React component that displays a price chart for a selected instrument.
 * @param param0 
 * @returns 
 */
export function PriceChart({ instruments }: Readonly<PriceChartProps>) {
  const [selectedSymbol, setSelectedSymbol] =
    useState<InstrumentSymbol>("NIFTY");

  const [history, setHistory] = useState<number[]>([]);

  const selectedInstrument = instruments.find(
    (instrument) => instrument.symbol === selectedSymbol
  );

  useEffect(() => {
    if (!selectedInstrument) {
      return;
    }

    setHistory((previousHistory) => {
      const lastPrice =
        previousHistory.at(-1);

      if (lastPrice === selectedInstrument.ltp) {
        return previousHistory;
      }

      return [
        ...previousHistory.slice(-(MAX_POINTS - 1)),
        selectedInstrument.ltp,
      ];
    });
  }, [selectedInstrument?.sequence, selectedInstrument?.ltp]);

  useEffect(() => {
    setHistory(
      selectedInstrument ? [selectedInstrument.ltp] : []
    );
  }, [selectedSymbol]);

  const chart = useMemo(() => {
    if (history.length === 0) {
      return {
        line: "",
        area: "",
        minimum: 0,
        maximum: 0,
        lastX: 0,
        lastY: 0,
      };
    }

    const width = 900;
    const height = 300;

    const left = 24;
    const right = 24;
    const top = 24;
    const bottom = 30;

    const minimum = Math.min(...history);
    const maximum = Math.max(...history);

    const range = maximum - minimum || 1;

    const points = history.map((price, index) => {
      const x =
        left +
        (index / Math.max(history.length - 1, 1)) *
        (width - left - right);

      const y =
        height -
        bottom -
        ((price - minimum) / range) *
        (height - top - bottom);

      return {
        x,
        y,
      };
    });

    const line = points
      .map((point) => `${point.x},${point.y}`)
      .join(" ");

    const firstPoint = points[0];
    const lastPoint = points.at(-1)!;

    const area = [
      `${firstPoint.x},${height - bottom}`,
      ...points.map((point) => `${point.x},${point.y}`),
      `${lastPoint.x},${height - bottom}`,
    ].join(" ");

    return {
      line,
      area,
      minimum,
      maximum,
      lastX: lastPoint.x,
      lastY: lastPoint.y,
    };
  }, [history]);

  const firstPrice = history[0] ?? 0;
  const latestPrice = history.at(-1) ?? 0;

  const windowChange =
    firstPrice > 0
      ? ((latestPrice - firstPrice) / firstPrice) * 100
      : 0;

  const isPositive = windowChange >= 0;

  const lastUpdated = selectedInstrument
    ? new Date(selectedInstrument.lastUpdated).toLocaleTimeString()
    : "--";

  if (!selectedInstrument) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          <span>Waiting for market data...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Market Detail
              </p>

              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Live</span>
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {selectedInstrument.symbol}
              </h2>

              <span className="font-mono text-2xl font-semibold text-slate-100">
                ₹{selectedInstrument.ltp.toFixed(2)}
              </span>

              <span
                className={`font-mono text-sm font-semibold ${selectedInstrument.changePercent >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                  }`}
              >
                {selectedInstrument.changePercent >= 0
                  ? "+"
                  : ""}
                {selectedInstrument.changePercent.toFixed(3)}%
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Live price movement from the market stream
            </p>
          </div>

          <select
            value={selectedSymbol}
            onChange={(event) =>
              setSelectedSymbol(
                event.target.value as InstrumentSymbol
              )
            }
            className="cursor-pointer rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-200 outline-none transition-colors hover:border-slate-600 focus:border-slate-500"
          >
            {instruments.map((instrument) => (
              <option
                key={instrument.symbol}
                value={instrument.symbol}
              >
                {instrument.symbol}
              </option>
            ))}
          </select>
        </div>

        {/* Market stats */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
          <MarketStat
            label="Bid"
            value={`₹${selectedInstrument.bid.toFixed(2)}`}
          />

          <MarketStat
            label="Ask"
            value={`₹${selectedInstrument.ask.toFixed(2)}`}
          />

          <MarketStat
            label="Bid Qty"
            value={formatNumber(selectedInstrument.bidQuantity)}
          />

          <MarketStat
            label="Ask Qty"
            value={formatNumber(selectedInstrument.askQuantity)}
          />

          <MarketStat
            label="Volume"
            value={formatNumber(
              selectedInstrument.tradedQuantity
            )}
          />

          <MarketStat
            label="Momentum"
            value={`${selectedInstrument.rolling10Return >= 0 ? "+" : ""}${selectedInstrument.rolling10Return.toFixed(3)}%`}
            positive={selectedInstrument.rolling10Return >= 0}
          />

          <MarketStat
            label="Avg Price"
            value={`₹${selectedInstrument.rollingAveragePrice.toFixed(2)}`}
          />

          <MarketStat
            label="Sequence"
            value={`#${formatNumber(selectedInstrument.sequence)}`}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="px-3 pt-4 sm:px-5">
        <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950">
          <svg
            viewBox="0 0 900 300"
            className="h-[280px] w-full"
            role="img"
            aria-label={`Live price chart for ${selectedInstrument.symbol}`}
          >
            {/* Horizontal grid */}
            <line
              x1="24"
              y1="24"
              x2="876"
              y2="24"
              stroke="#1e293b"
              strokeWidth="1"
            />

            <line
              x1="24"
              y1="148"
              x2="876"
              y2="148"
              stroke="#1e293b"
              strokeWidth="1"
            />

            <line
              x1="24"
              y1="270"
              x2="876"
              y2="270"
              stroke="#1e293b"
              strokeWidth="1"
            />

            {/* Vertical guide lines */}
            <line
              x1="236"
              y1="24"
              x2="236"
              y2="270"
              stroke="#1e293b"
              strokeWidth="1"
            />

            <line
              x1="450"
              y1="24"
              x2="450"
              y2="270"
              stroke="#1e293b"
              strokeWidth="1"
            />

            <line
              x1="664"
              y1="24"
              x2="664"
              y2="270"
              stroke="#1e293b"
              strokeWidth="1"
            />

            {/* Area */}
            {history.length > 1 && (
              <polygon
                points={chart.area}
                fill={
                  isPositive
                    ? "rgba(52, 211, 153, 0.08)"
                    : "rgba(248, 113, 113, 0.08)"
                }
              />
            )}

            {/* Price line */}
            {history.length > 1 && (
              <polyline
                points={chart.line}
                fill="none"
                stroke={
                  isPositive ? "#34d399" : "#f87171"
                }
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Current price point */}
            {history.length > 1 && (
              <>
                <circle
                  cx={chart.lastX}
                  cy={chart.lastY}
                  r="7"
                  fill={
                    isPositive
                      ? "rgba(52, 211, 153, 0.15)"
                      : "rgba(248, 113, 113, 0.15)"
                  }
                />

                <circle
                  cx={chart.lastX}
                  cy={chart.lastY}
                  r="3.5"
                  fill={
                    isPositive ? "#34d399" : "#f87171"
                  }
                />
              </>
            )}

            {/* High label */}
            {history.length > 1 && (
              <text
                x="30"
                y="40"
                fill="#64748b"
                fontSize="11"
              >
                H ₹{chart.maximum.toFixed(2)}
              </text>
            )}

            {/* Low label */}
            {history.length > 1 && (
              <text
                x="30"
                y="262"
                fill="#64748b"
                fontSize="11"
              >
                L ₹{chart.minimum.toFixed(2)}
              </text>
            )}
          </svg>

          {/* Current price badge */}
          <div className="absolute right-3 top-3 rounded-md border border-slate-700 bg-slate-900/95 px-2.5 py-1.5 shadow-lg">
            <span className="font-mono text-xs font-semibold text-slate-200">
              ₹{latestPrice.toFixed(2)}
            </span>
          </div>

          {/* Stream point count */}
          <div className="absolute bottom-3 right-3 rounded-md border border-slate-800 bg-slate-900/90 px-2 py-1">
            <span className="text-[10px] text-slate-500">
              {history.length}/{MAX_POINTS} points
            </span>
          </div>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-4">
        <ChartStat
          label="Window Low"
          value={`₹${chart.minimum.toFixed(2)}`}
        />

        <ChartStat
          label="Window High"
          value={`₹${chart.maximum.toFixed(2)}`}
        />

        <ChartStat
          label="Window Change"
          value={`${isPositive ? "+" : ""}${windowChange.toFixed(3)}%`}
          positive={isPositive}
        />

        <ChartStat
          label="Last Update"
          value={lastUpdated}
        />
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 border-t border-slate-800 px-5 py-3 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Sequence #{formatNumber(selectedInstrument.sequence)}
        </span>

        <span>
          {history.length} live price points · WebSocket stream
        </span>
      </div>
    </section>
  );
}

function getValueClass(positive?: boolean): string {
  if (positive === undefined) {
    return "text-slate-300";
  }

  return positive
    ? "text-emerald-400"
    : "text-red-400";
}

function MarketStat({
  label,
  value,
  positive,
}: {
  readonly label: string;
  readonly value: string;
  readonly positive?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
        {label}
      </p>

      <p
        className={`mt-1 truncate font-mono text-xs font-semibold ${getValueClass(
          positive
        )}`}
      >
        {value}
      </p>
    </div>
  );
}

function ChartStat({
  label,
  value,
  positive,
}: {
  readonly label: string;
  readonly value: string;
  readonly positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
        {label}
      </p>

      <p
        className={`mt-1 truncate font-mono text-xs font-semibold ${getValueClass(
          positive
        )}`}
      >
        {value}
      </p>
    </div>
  );
}

function formatNumber(value: number): string {
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