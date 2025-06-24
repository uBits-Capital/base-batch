import { Pool, Position } from "@uniswap/v3-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import tryParseCurrencyAmount from "@/utils/math";

export function useLiquidityAmount(
  pool: Pool,
  tickLower: number,
  tickUpper: number,
) {
  const [amount0, _setAmount0] = useState("0");
  const [amount1, _setAmount1] = useState("0");
  const [lastAmount0InRange, _setLastAmount0InRange] = useState("0");
  const [lastAmount1InRange, _setLastAmount1InRange] = useState("0");
  const [independentField, setIndependentField] = useState<0 | 1>(0);

  const inRange = useMemo(() => {
    /// @notice This function is used to check if the current tick is within the tick range of the pool position
    /// @return 0 if the current tick is within the tick range,
    //  1 if the current tick is above the tick range, -1 if the current tick is below the tick range.
    // @dev if the current tick is above the tick range (1), position is 100% token1,
    // if the current tick is below the tick range (-1), position is 100% token0
    const currentTick = pool.tickCurrent;
    if (currentTick < tickLower) return -1;
    if (currentTick > tickUpper) return 1;
    return 0;
  }, [pool.tickCurrent, tickLower, tickUpper]);

  const setAmount0 = useCallback(
    (value: string) => {
      if (value === amount0) return;

      const valueAsNumber = parseFloat(value);
      if (Number.isNaN(valueAsNumber)) return;

      _setAmount0(valueAsNumber.toFixed(6));
      setIndependentField(0);
    },
    [amount0],
  );

  const setAmount1 = useCallback(
    (value: string) => {
      if (value === amount1) return;

      const valueAsNumber = parseFloat(value);
      if (Number.isNaN(valueAsNumber)) return;

      _setAmount1(valueAsNumber.toFixed(6));
      setIndependentField(1);
    },
    [amount1],
  );

  useEffect(() => {
    if (inRange === 0) {
      if (amount1 === "0") _setAmount1(lastAmount1InRange);
      if (amount0 === "0") _setAmount0(lastAmount0InRange);
    }
  }, [amount0, lastAmount0InRange, amount1, lastAmount1InRange, inRange]);

  useEffect(() => {
    if (tickLower === 0 && tickUpper === 0) return;

    const amountIndependentField =
      independentField === 0
        ? tryParseCurrencyAmount(amount0, pool.token0)
        : tryParseCurrencyAmount(amount1, pool.token1);

    if (!amountIndependentField) return;

    if (inRange === 1) {
      _setAmount1(amount1);
      _setAmount0("0");
      return;
    }
    if (inRange === -1) {
      _setAmount0(amount0);
      _setAmount1("0");
      return;
    }

    const position =
      independentField === 0
        ? Position.fromAmount0({
            pool,
            tickLower,
            tickUpper,
            amount0: amountIndependentField.quotient,
            useFullPrecision: true,
          })
        : Position.fromAmount1({
            pool,
            tickLower,
            tickUpper,
            amount1: amountIndependentField.quotient,
          });

    _setLastAmount0InRange(amount0);
    _setLastAmount1InRange(amount1);

    if (independentField === 0) _setAmount1(position.amount1.toFixed(6));
    else _setAmount0(position.amount0.toFixed(6));
  }, [
    inRange,
    amount0,
    amount1,
    independentField,
    pool,
    tickLower,
    tickUpper,
    _setLastAmount0InRange,
    _setLastAmount1InRange,
    _setAmount0,
    _setAmount1,
    lastAmount0InRange,
    lastAmount1InRange,
  ]);

  return {
    inRange,
    amount0,
    setAmount0,
    amount1,
    setAmount1,
  };
}
