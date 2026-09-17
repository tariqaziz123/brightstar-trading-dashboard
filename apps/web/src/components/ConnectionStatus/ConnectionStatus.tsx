"use client";

import type {
  ConnectionStatus,
} from "@brightstar/shared";

interface ConnectionStatusProps {
  status: ConnectionStatus;
  isStale: boolean;
}

const statusStyles: Record<
  ConnectionStatus,
  string
> = {
  CONNECTED:
    "bg-green-100 text-green-700",
  DISCONNECTED:
    "bg-red-100 text-red-700",
  RECONNECTING:
    "bg-yellow-100 text-yellow-700",
};

/**
 * ConnectionStatus is a React component that displays the connection status of the market stream.
 * @param param0 
 * @returns 
 */
export function ConnectionStatus({
  status,
  isStale,
}: Readonly<ConnectionStatusProps>) {
  const displayStatus =
    status === "CONNECTED" && isStale
      ? "STALE DATA"
      : status;

  const displayClass =
    status === "CONNECTED" && isStale
      ? "bg-orange-100 text-orange-700"
      : statusStyles[status];

  return (
    <div className="flex items-center gap-2">
      <span
        className={`rounded-full px-3 py-1 text-sm font-semibold ${displayClass}`}
      >
        {displayStatus}
      </span>

      <span className="text-sm text-gray-500">
        Market stream
      </span>
    </div>
  );
}