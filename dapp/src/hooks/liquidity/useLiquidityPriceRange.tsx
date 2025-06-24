import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  nearestUsableTick,
  Pool,
  priceToClosestTick,
  TickMath, 
} from "@uniswap/v3-sdk";
import { Price } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import { safeNearestUsableTick, sanitizeNumber, toInt } from "@/utils/math";
import { customTickToPrice } from "@/utils/price";

export function useLiquidityPriceRange(
  pool: Pool,
  tickLower: number,
  setTickLower: Dispatch<SetStateAction<number>>,
  tickUpper: number,
  setTickUpper: Dispatch<SetStateAction<number>>,
) {
  const [inverted, setInverted] = useState(false);

  const minTick = useMemo(
    () => nearestUsableTick(TickMath.MIN_TICK, pool.tickSpacing),
    [pool],
  );

  const maxTick = useMemo(
    () => nearestUsableTick(TickMath.MAX_TICK, pool.tickSpacing),
    [pool],
  );

  const priceLower = useMemo(() => {
    if (tickLower === minTick) return "0";
    else {
      const price = customTickToPrice(pool.token0, pool.token1, tickLower, inverted);
      return price.toSignificant();
    }
  }, [inverted, minTick, pool.token0, pool.token1, tickLower]);

  const priceUpper = useMemo(() => {
    if (tickUpper === maxTick) return "∞";
    else {
      const price = customTickToPrice(pool.token0, pool.token1, tickUpper, inverted);
      return price.toSignificant();
    }
  }, [inverted, maxTick, pool.token0, pool.token1, tickUpper]);

  const incrementPriceLower = useCallback(() => {
    setTickLower((tick) =>
      tick !== minTick
        ? safeNearestUsableTick(
            pool,
            inverted ? tick - pool.tickSpacing : tick + pool.tickSpacing,
            tickLower,
            tickUpper,
            0,
          )
        : tick,
    );
  }, [inverted, minTick, pool, setTickLower, tickLower, tickUpper]);

  const decrementPriceLower = useCallback(() => {
    setTickLower((tick) =>
      tick !== minTick
        ? safeNearestUsableTick(
            pool,
            inverted ? tick + pool.tickSpacing : tick - pool.tickSpacing,
            tickLower,
            tickUpper,
            0,
          )
        : tick,
    );
  }, [inverted, minTick, pool, setTickLower, tickLower, tickUpper]);

  const incrementPriceUpper = useCallback(() => {
    setTickUpper((tick) =>
      tick !== maxTick
        ? safeNearestUsableTick(
            pool,
            inverted ? tick - pool.tickSpacing : tick + pool.tickSpacing,
            tickLower,
            tickUpper,
            1,
          )
        : tick,
    );
  }, [inverted, maxTick, pool, setTickUpper, tickLower, tickUpper]);

  const decrementPriceUpper = useCallback(() => {
    setTickUpper((tick) =>
      tick !== maxTick
        ? safeNearestUsableTick(
            pool,
            inverted ? tick + pool.tickSpacing : tick - pool.tickSpacing,
            tickLower,
            tickUpper,
            1,
          )
        : tick,
    );
  }, [inverted, maxTick, pool, setTickUpper, tickLower, tickUpper]);

  const setPriceLower = useCallback(
    (newPrice: SetStateAction<string>) => {
      let value =
        typeof newPrice === "string" ? newPrice : newPrice(priceLower);

      value = sanitizeNumber(value);

      if (value === "0.000000000000000000" || value === "0")
        return setTickLower(minTick);

      try {
        let price;
        if (inverted) {
          price = new Price(
            pool.token1,
            pool.token0,
            JSBI.BigInt(toInt(1, pool.token1.decimals).toString()),
            JSBI.BigInt(toInt(value, pool.token0.decimals).toString()),
          );
        } else {
          price = new Price(
            pool.token0,
            pool.token1,
            JSBI.BigInt(toInt(1, pool.token0.decimals).toString()),
            JSBI.BigInt(toInt(value, pool.token1.decimals).toString()),
          );
        }
        const newTick = priceToClosestTick(price);
        setTickLower(
          safeNearestUsableTick(pool, newTick, tickLower, tickUpper, 0),
        );
      } catch (e) {
        setTickLower(tickUpper - pool.tickSpacing * 2);
      }
    },
    [inverted, pool, minTick, priceLower, setTickLower, tickLower, tickUpper],
  );

  const setPriceUpper = useCallback(
    (newPrice: SetStateAction<string>) => {
      let value =
        typeof newPrice === "string" ? newPrice : newPrice(priceUpper);

      if (value === "∞" && priceUpper === "∞") return;

      value = sanitizeNumber(value);

      try {
        let price;
        if (inverted) {
          price = new Price(
            pool.token1,
            pool.token0,
            JSBI.BigInt(toInt(1, pool.token1.decimals).toString()),
            JSBI.BigInt(toInt(value, pool.token0.decimals).toString()),
          );
        } else {
          price = new Price(
            pool.token0,
            pool.token1,
            JSBI.BigInt(toInt(1, pool.token0.decimals).toString()),
            JSBI.BigInt(toInt(value, pool.token1.decimals).toString()),
          );
        }
        const newTick = priceToClosestTick(price);
        setTickUpper(
          safeNearestUsableTick(pool, newTick, tickLower, tickUpper, 1),
        );
      } catch (e) {
        setTickUpper(tickLower + pool.tickSpacing * 2);
      }
    },
    [inverted, pool, priceUpper, setTickUpper, tickLower, tickUpper],
  );

  const setFullRange = useCallback(() => {
    // Set tick low to the minimum tick
    setTickLower(minTick);
    // Set tick high to the maximum tick
    setTickUpper(maxTick);
  }, [maxTick, minTick, setTickLower, setTickUpper]);

  const isFullRange = useMemo(
    () => tickLower === minTick && tickUpper === maxTick,
    [maxTick, minTick, tickLower, tickUpper],
  );

  return {
    priceLower,
    setPriceLower,
    incrementPriceLower,
    decrementPriceLower,
    priceUpper,
    setPriceUpper,
    incrementPriceUpper,
    decrementPriceUpper,
    setFullRange,
    isFullRange,
    inverted,
    toggleInverted: () => setInverted((inverted) => !inverted),
  };
}
