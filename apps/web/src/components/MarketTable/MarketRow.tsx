"use client";

import { memo } from "react";

import type {
  InstrumentSymbol,
} from "@brightstar/shared";

import {
  useAppSelector,
} from "../../app/hooks";

import {
  selectInstrumentBySymbol,
} from "../../features/market/marketSelectors";

interface MarketRowProps {
  symbol: InstrumentSymbol;
}

function getChangeClass(
  changePercent: number
): string {
  if (changePercent > 1) {
    return "text-green-700 bg-green-100";
  }

  if (changePercent >= 0.25) {
    return "text-green-600";
  }

  if (changePercent < -1) {
    return "text-red-700 bg-red-100";
  }

  if (changePercent <= -0.25) {
    return "text-red-600";
  }

  return "text-gray-600";
}

function MarketRowComponent({
  symbol,
}: MarketRowProps) {
  const instrument =
    useAppSelector(
      selectInstrumentBySymbol(symbol)
    );

  if (!instrument) {
    return (
      <tr>
        <td
          colSpan={9}
          className="px-4 py-3 text-center text-gray-400"
        >
          Waiting for {symbol}...
        </td>
      </tr>
    );
  }

  const changeClass =
    getChangeClass(
      instrument.changePercent
    );

  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-3 font-semibold">
        {instrument.symbol}
      </td>

      <td className="px-4 py-3 text-right">
        {instrument.ltp.toFixed(2)}
      </td>

      <td className="px-4 py-3 text-right">
        {instrument.change.toFixed(2)}
      </td>

      <td
        className={`px-4 py-3 text-right font-semibold ${changeClass}`}
      >
        {instrument.changePercent.toFixed(3)}%
      </td>

      <td className="px-4 py-3 text-right">
        {instrument.bid.toFixed(2)}
      </td>

      <td className="px-4 py-3 text-right">
        {instrument.ask.toFixed(2)}
      </td>

      <td className="px-4 py-3 text-right">
        {instrument.tradedQuantity.toLocaleString()}
      </td>

      <td className="px-4 py-3 text-right">
        {instrument.rolling10Return.toFixed(3)}%
      </td>

      <td className="px-4 py-3 text-center">
        <span
          className={
            instrument.status === "LIVE"
              ? "rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
              : "rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700"
          }
        >
          {instrument.status}
        </span>
      </td>
    </tr>
  );
}

export const MarketRow =
  memo(MarketRowComponent);