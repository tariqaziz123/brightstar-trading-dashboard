"use client";

import { useEffect, useState } from "react";

import {
  useAppSelector,
} from "../../app/hooks";

import {
  selectLastEventAt,
} from "./marketSelectors";

import {
  STALE_THRESHOLD_MS,
} from "./marketConfig";

/**
 * A custom hook that determines if the market data is stale.
 * @returns 
 */
export function useMarketStale(): boolean {
  const lastEventAt =
    useAppSelector(selectLastEventAt);

  const [isStale, setIsStale] =
    useState(false);

  useEffect(() => {
    /**
     * Checks if the market data is stale.
     * @returns 
     */
    const checkStale = () => {
      if (lastEventAt === null) {
        setIsStale(true);
        return;
      }

      const elapsed =
        Date.now() - lastEventAt;

      setIsStale(
        elapsed > STALE_THRESHOLD_MS
      );
    };

    checkStale();

    const timer = setInterval(
      checkStale,
      250
    );

    return () => {
      clearInterval(timer);
    };
  }, [lastEventAt]);

  return isStale;
}