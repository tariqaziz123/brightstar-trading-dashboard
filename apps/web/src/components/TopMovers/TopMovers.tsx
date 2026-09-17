"use client";

import type { InstrumentState } from "@brightstar/shared";

interface TopMoversProps {
  title: string;
  instruments: InstrumentState[];
  metric: (instrument: InstrumentState) => number;
  suffix?: string;
}

export function TopMovers({
  title,
  instruments,
  metric,
  suffix = "%",
}: Readonly<TopMoversProps>) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">
            {title}
          </h2>

          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-600">
            Live ranking
          </p>
        </div>

        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Live</span>
        </span>
      </div>

      <div className="space-y-1">
        {instruments.map((instrument, index) => {
          const value = metric(instrument);
          const isPositive = value >= 0;

          return (
            <div
              key={instrument.symbol}
              className="group flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-slate-800/60"
            >
              <span className="w-5 text-xs font-medium text-slate-600">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">
                    {instrument.symbol}
                  </span>

                  <span className="text-[10px] text-slate-600">
                    ₹{instrument.ltp.toFixed(2)}
                  </span>
                </div>

                <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      isPositive
                        ? "bg-emerald-400/70"
                        : "bg-red-400/70"
                    }`}
                    style={{
                      width: `${Math.min(Math.abs(value) * 30, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <span
                className={`min-w-[72px] text-right font-mono text-sm font-semibold ${
                  isPositive
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {isPositive ? "+" : ""}
                {value.toFixed(3)}
                {suffix}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}