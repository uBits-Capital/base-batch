import { useMemo, useState } from "react";
import JSBI from "jsbi";

export function useRemoveLiquidityState(amount0: bigint, amount1: bigint) {
  const [percentageToRemove, setPercentageToRemove] = useState<number>(50);

  const amountToRemove0 = useMemo(
    () =>
      JSBI.divide(
        JSBI.multiply(
          JSBI.BigInt(amount0.toString()),
          JSBI.BigInt(percentageToRemove),
        ),
        JSBI.BigInt(100),
      ) || 0,
    [percentageToRemove, amount0],
  );

  const amountToRemove1 = useMemo(
    () =>
      JSBI.divide(
        JSBI.multiply(
          JSBI.BigInt(amount1.toString()),
          JSBI.BigInt(percentageToRemove),
        ),
        JSBI.BigInt(100),
      ) || 0,
    [percentageToRemove, amount1],
  );

  return {
    percentageToRemove,
    setPercentageToRemove,
    amountToRemove0,
    amountToRemove1,
  };
}
