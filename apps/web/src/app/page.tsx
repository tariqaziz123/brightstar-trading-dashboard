"use client";

import { useMarketStream } from "../features/market/useMarketStream";

export default function HomePage() {
  useMarketStream();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Brightstar Market Watch
      </h1>

      <p className="mt-2 text-gray-600">
        Connecting to market stream...
      </p>
    </main>
  );
}