"use client";

import { instrumentSymbols } from "../../features/market/marketSelectors";
import { MarketRow } from "./MarketRow";

/**
 * MarketTable is a React component that displays a table of market data.
 * @returns A React component that renders the market table.
 */
export function MarketTable() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1100px] w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/70">
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Instrument
            </th>

            <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              LTP
            </th>

            <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Change
            </th>

            <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Change %
            </th>

            <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Bid
            </th>

            <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Ask
            </th>

            <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Volume
            </th>

            <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Momentum
            </th>

            <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Status
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-800/70">
          {instrumentSymbols.map((symbol) => (
            <MarketRow
              key={symbol}
              symbol={symbol}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}