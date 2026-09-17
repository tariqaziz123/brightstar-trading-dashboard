"use client";

import type { InstrumentState } from "@brightstar/shared";

import { MarketRow } from "./MarketRow";

interface MarketTableProps {
  instruments: InstrumentState[];
}

export function MarketTable({
  instruments,
}: MarketTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-[1100px] w-full text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-3 text-left">
              Instrument
            </th>

            <th className="px-4 py-3 text-right">
              LTP
            </th>

            <th className="px-4 py-3 text-right">
              Change
            </th>

            <th className="px-4 py-3 text-right">
              Change %
            </th>

            <th className="px-4 py-3 text-right">
              Bid
            </th>

            <th className="px-4 py-3 text-right">
              Ask
            </th>

            <th className="px-4 py-3 text-right">
              Volume
            </th>

            <th className="px-4 py-3 text-right">
              Momentum
            </th>

            <th className="px-4 py-3 text-center">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {instruments.map((instrument) => (
            <MarketRow
              key={instrument.symbol}
              instrument={instrument}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}