"use client";

import type {
  ConnectionStatus,
} from "@brightstar/shared";

interface ConnectionStatusProps {
  status: ConnectionStatus;
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

export function ConnectionStatus({
  status,
}: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[status]}`}
      >
        {status}
      </span>

      <span className="text-sm text-gray-500">
        Market stream
      </span>
    </div>
  );
}