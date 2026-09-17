"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  InstrumentState,
  InstrumentSymbol,
} from "@brightstar/shared";

type PriceChartProps = {
  instruments: InstrumentState[];
};

const MAX_POINTS = 40;

export function PriceChart({ instruments }: PriceChartProps) {
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
        previousHistory[previousHistory.length - 1];

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
      };
    }

    const width = 900;
    const height = 300;

    const left = 20;
    const right = 20;
    const top = 24;
    const bottom = 28;

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

      return `${x},${y}`;
    });

    const line = points.join(" ");

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    const firstX = firstPoint?.split(",")[0] ?? left;
    const lastX = lastPoint?.split(",")[0] ?? width - right;

    const area = [
      `${firstX},${height - bottom}`,
      ...points,
      `${lastX},${height - bottom}`,
    ].join(" ");

    return {
      line,
      area,
      minimum,
      maximum,
    };
  }, [history]);

  const firstPrice = history[0] ?? 0;
  const latestPrice = history[history.length - 1] ?? 0;

  const windowChange =
    firstPrice > 0
      ? ((latestPrice - firstPrice) / firstPrice) * 100
      : 0;

  const isPositive = windowChange >= 0;

  if (!selectedInstrument) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          Waiting for market data...
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Live Price
              </p>

              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live
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
                className={`font-mono text-sm font-semibold ${
                  isPositive
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {isPositive ? "+" : ""}
                {windowChange.toFixed(3)}%
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Last {history.length} streamed price points
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
              x1="20"
              y1="24"
              x2="880"
              y2="24"
              stroke="#1e293b"
              strokeWidth="1"
            />

            <line
              x1="20"
              y1="148"
              x2="880"
              y2="148"
              stroke="#1e293b"
              strokeWidth="1"
            />

            <line
              x1="20"
              y1="272"
              x2="880"
              y2="272"
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
              <circle
                cx={
                  chart.line
                    .split(" ")
                    .at(-1)
                    ?.split(",")[0]
                }
                cy={
                  chart.line
                    .split(" ")
                    .at(-1)
                    ?.split(",")[1]
                }
                r="4"
                fill={
                  isPositive ? "#34d399" : "#f87171"
                }
              />
            )}
          </svg>

          {/* Current price badge */}
          <div className="absolute right-3 top-3 rounded-md border border-slate-700 bg-slate-900/90 px-2.5 py-1.5 shadow-lg">
            <span className="font-mono text-xs font-semibold text-slate-200">
              ₹{latestPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-3 gap-3 px-5 py-4">
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
      </div>
    </section>
  );
}

function ChartStat({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
        {label}
      </p>

      <p
        className={`mt-1 font-mono text-sm font-semibold ${
          positive === undefined
            ? "text-slate-300"
            : positive
              ? "text-emerald-400"
              : "text-red-400"
        }`}
      >
        {value}
      </p>
    </div>
  );
}