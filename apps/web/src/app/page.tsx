"use client";

import { useMarketStream } from "../features/market/useMarketStream";
import { MarketTable } from "../components/MarketTable/MarketTable";

import {
  selectAllInstruments,
} from "../features/market/marketSelectors";

import {
  useAppSelector,
} from "../app/hooks";

import {
  selectTopGainers,
  selectTopLosers,
  selectTopMomentum,
} from "../features/market/topMoversSelectors";

import { TopMovers } from "../components/TopMovers/TopMovers";

import {
  selectConnectionStatus,
} from "../features/market/marketSelectors";

import { ConnectionStatus } from "../components/ConnectionStatus/ConnectionStatus";
import {
  useMarketStale,
} from "../features/market/useMarketStale";

export default function HomePage() {
  useMarketStream();

  const topGainers = useAppSelector(selectTopGainers);

  const topLosers = useAppSelector(selectTopLosers);

  const topMomentum = useAppSelector(selectTopMomentum);

  const connectionStatus = useAppSelector(selectConnectionStatus);

  const isMarketStale = useMarketStale();

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Brightstar Market Watch
          </h1>

          <p className="mt-2 text-gray-600">
            Real-time market prices and momentum scanner
          </p>
          <ConnectionStatus
            status={connectionStatus}
            isStale={isMarketStale}
          />
        </header>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <TopMovers
            title="Top 3 Gainers"
            instruments={topGainers}
            metric={(instrument) =>
              instrument.changePercent
            }
          />

          <TopMovers
            title="Top 3 Losers"
            instruments={topLosers}
            metric={(instrument) =>
              instrument.changePercent
            }
          />

          <TopMovers
            title="Top 3 Momentum"
            instruments={topMomentum}
            metric={(instrument) =>
              instrument.rolling10Return
            }
          />
        </div>

        <MarketTable />
      </div>
    </main>
  );
}