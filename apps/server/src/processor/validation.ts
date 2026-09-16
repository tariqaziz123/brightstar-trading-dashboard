import type {
  InstrumentSymbol,
  MarketTick
} from "@brightstar/shared";

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateTick(
  tick: unknown,
  knownSymbols: Set<InstrumentSymbol>
): ValidationResult {
  if (!tick || typeof tick !== "object") {
    return {
      valid: false,
      reason: "Malformed tick"
    };
  }

  const candidate = tick as Partial<MarketTick>;

  if (
    typeof candidate.symbol !== "string" ||
    !knownSymbols.has(
      candidate.symbol as InstrumentSymbol
    )
  ) {
    return {
      valid: false,
      reason: "Unknown instrument"
    };
  }

  if (
    typeof candidate.timestamp !== "number" ||
    !Number.isFinite(candidate.timestamp)
  ) {
    return {
      valid: false,
      reason: "Invalid timestamp"
    };
  }

  if (
    typeof candidate.sequence !== "number" ||
    !Number.isInteger(candidate.sequence) ||
    candidate.sequence <= 0
  ) {
    return {
      valid: false,
      reason: "Invalid sequence"
    };
  }

  if (
    typeof candidate.ltp !== "number" ||
    !Number.isFinite(candidate.ltp) ||
    candidate.ltp <= 0
  ) {
    return {
      valid: false,
      reason: "Invalid LTP"
    };
  }

  if (
    typeof candidate.bid !== "number" ||
    typeof candidate.ask !== "number" ||
    candidate.bid <= 0 ||
    candidate.ask <= 0 ||
    candidate.bid >= candidate.ask
  ) {
    return {
      valid: false,
      reason: "Invalid bid/ask"
    };
  }

  if (
    typeof candidate.bidQuantity !== "number" ||
    typeof candidate.askQuantity !== "number" ||
    typeof candidate.tradedQuantity !== "number"
  ) {
    return {
      valid: false,
      reason: "Invalid quantity"
    };
  }

  return {
    valid: true
  };
}