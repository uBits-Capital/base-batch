import {
  FeeAmount,
  nearestUsableTick,
  Pool,
  TICK_SPACINGS,
  TickMath,
} from "@uniswap/v3-sdk";
import { useEffect, useMemo, useState } from "react";
import { parseTokenDataToCurrency, PoolData } from "@/hooks/pool/usePoolData";

export function useLiquidityState(poolData?: PoolData) {
  const [tickLower, setTickLower] = useState(0);
  const [tickUpper, setTickUpper] = useState(0);

  const { pool, initialTickLower, initialTickUpper } = useMemo(() => {
    if (!poolData)
      return {
        pool: undefined,
        initialTickLower: undefined,
        initialTickUpper: undefined,
      };

    const token0 = parseTokenDataToCurrency(poolData.token0);
    const token1 = parseTokenDataToCurrency(poolData.token1);

    const tickCurrent = TickMath.getTickAtSqrtRatio(poolData.sqrtPrice);
    const tickSpacing = TICK_SPACINGS[poolData.feeTier as FeeAmount];

    const pool = new Pool(
      token0,
      token1,
      poolData.feeTier,
      poolData.sqrtPrice,
      poolData.liquidity,
      tickCurrent,
      [],
    );

    const correctTick = nearestUsableTick(tickCurrent, tickSpacing);
    let initialTickLower = correctTick - tickSpacing * 2;
    let initialTickUpper = correctTick + tickSpacing * 2;
    return {
      pool,
      initialTickLower: tickLower != 0 && tickLower != initialTickLower ? tickLower : initialTickLower,
      initialTickUpper: tickUpper != 0 && tickUpper != initialTickUpper ? tickUpper : initialTickUpper,
    };
  }, [poolData, tickLower, tickUpper]);

  useEffect(() => {
    initialTickLower && setTickLower(initialTickLower);
    initialTickUpper && setTickUpper(initialTickUpper);
  }, [pool, initialTickLower, initialTickUpper, setTickLower, setTickUpper]);

  return { pool, tickLower, setTickLower, tickUpper, setTickUpper };
}
