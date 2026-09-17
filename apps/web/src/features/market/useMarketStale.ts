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

export function useMarketStale(): boolean {
  const lastEventAt =
    useAppSelector(selectLastEventAt);

  const [isStale, setIsStale] =
    useState(false);

  useEffect(() => {
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