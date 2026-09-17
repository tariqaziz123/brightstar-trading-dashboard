"use client";

import type {
  InstrumentState,
} from "@brightstar/shared";

interface TopMoversProps {
  title: string;
  instruments: InstrumentState[];
  metric: (
    instrument: InstrumentState
  ) => number;
  suffix?: string;
}

export function TopMovers({
  title,
  instruments,
  metric,
  suffix = "%",
}: TopMoversProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        {title}
      </h2>

      <div className="space-y-3">
        {instruments.map((instrument) => {
          const value =
            metric(instrument);

          return (
            <div
              key={instrument.symbol}
              className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-b-0"
            >
              <span className="font-medium text-gray-800">
                {instrument.symbol}
              </span>

              <span className="font-semibold text-gray-700">
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