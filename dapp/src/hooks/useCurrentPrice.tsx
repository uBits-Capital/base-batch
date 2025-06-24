import { Pool } from "@uniswap/v3-sdk";
import { useMemo } from "react";
import { customTickToPrice } from "@/utils/price";

export function useCurrentPrice(pool: Pool, inverted?: boolean) {
  return useMemo(() => {
    const price = customTickToPrice(pool?.token0, pool?.token1, pool.tickCurrent, inverted);
    return price.toSignificant();
  }, [inverted, pool.tickCurrent, pool?.token0, pool?.token1]);
}
