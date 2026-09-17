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

  const chartPoints = useMemo(() => {
    if (history.length === 0) {
      return "";
    }

    const width = 800;
    const height = 260;
    const padding = 24;

    const minimum = Math.min(...history);
    const maximum = Math.max(...history);

    const range = maximum - minimum || 1;

    return history
      .map((price, index) => {
        const x =
          padding +
          (index / Math.max(history.length - 1, 1)) *
            (width - padding * 2);

        const y =
          height -
          padding -
          ((price - minimum) / range) *
            (height - padding * 2);

        return `${x},${y}`;
      })
      .join(" ");
  }, [history]);

  const firstPrice = history[0] ?? 0;
  const latestPrice = history[history.length - 1] ?? 0;
  const priceDirection = latestPrice >= firstPrice ? "up" : "down";

  if (!selectedInstrument) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">
          Waiting for market data...
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Live Price Chart
          </p>

          <div className="mt-2 flex items-baseline gap-3">
            <h2 className="text-2xl font-bold text-white">
              {selectedInstrument.symbol}
            </h2>

            <span className="text-xl font-semibold text-slate-200">
              ₹{selectedInstrument.ltp.toFixed(2)}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Latest {history.length} streamed price points
          </p>
        </div>

        <select
          value={selectedSymbol}
          onChange={(event) =>
            setSelectedSymbol(
              event.target.value as InstrumentSymbol
            )
          }
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
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

      <div className="overflow-hidden rounded-xl bg-slate-950 p-2">
        <svg
          viewBox="0 0 800 260"
          className="h-64 w-full"
          role="img"
          aria-label={`Live price chart for ${selectedInstrument.symbol}`}
        >
          <line
            x1="24"
            y1="24"
            x2="776"
            y2="24"
            stroke="#1e293b"
            strokeWidth="1"
          />

          <line
            x1="24"
            y1="130"
            x2="776"
            y2="130"
            stroke="#1e293b"
            strokeWidth="1"
          />

          <line
            x1="24"
            y1="236"
            x2="776"
            y2="236"
            stroke="#1e293b"
            strokeWidth="1"
          />

          {history.length > 1 && (
            <polyline
              points={chartPoints}
              fill="none"
              stroke={
                priceDirection === "up"
                  ? "#34d399"
                  : "#f87171"
              }
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Start: ₹{firstPrice.toFixed(2)}</span>

        <span
          className={
            priceDirection === "up"
              ? "font-semibold text-emerald-400"
              : "font-semibold text-red-400"
          }
        >
          {priceDirection === "up" ? "▲ Rising" : "▼ Falling"}
        </span>

        <span>Latest: ₹{latestPrice.toFixed(2)}</span>
      </div>
    </section>
  );
}