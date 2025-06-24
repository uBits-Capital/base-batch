import { Pool, Position, TickMath } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import { parseTokenDataToCurrency, PoolData } from "@/hooks/pool/usePoolData";
import { SLIPPAGE_TOLERANCE } from "@/config";
import tryParseCurrencyAmount from "@/utils/math";
import { PositionData } from "@/hooks/position/usePositions";
import { Percent } from '@uniswap/sdk-core';

export function mintAmountsWithSlippage(
  data: Pick<
    PositionData,
    | "token0"
    | "token1"
    | "fee"
    | "tickLower"
    | "tickUpper"
    | "sqrtPrice"
    | "liquidity"
  >,
  _amount0: JSBI | string,
  _amount1: JSBI | string,
  _slippage: number,
) {
  const currency0 = parseTokenDataToCurrency(data.token0);
  const currency1 = parseTokenDataToCurrency(data.token1);

  let amount0 =
    typeof _amount0 === "string"
      ? tryParseCurrencyAmount(_amount0, currency0)?.quotient
      : _amount0;
  if (!amount0) {
    amount0 = JSBI.BigInt(0);
  }

  let amount1 =
    typeof _amount1 === "string"
      ? tryParseCurrencyAmount(_amount1, currency1)?.quotient
      : _amount1;
  if (!amount1) {
    amount1 = JSBI.BigInt(0);
  }

  const sqrtPrice = JSBI.BigInt(data.sqrtPrice.toString());
  const liquidity = JSBI.BigInt(data.liquidity.toString());
  const partialPosition = Position.fromAmounts({
    pool: new Pool(
      currency0,
      currency1,
      data.fee,
      sqrtPrice,
      liquidity,
      TickMath.getTickAtSqrtRatio(sqrtPrice),
    ),
    tickLower: data.tickLower,
    tickUpper: data.tickUpper,
    amount0,
    amount1,
    useFullPrecision: true,
  });

  const { amount0: amount0Min, amount1: amount1Min } =
    partialPosition.mintAmountsWithSlippage(new Percent(Number((_slippage * 100).toFixed(0)), 10_000));
  return { amount0Min, amount1Min };
}

export function burnAmountsWithSlippage(
  positionData: PositionData,
  liquidity: JSBI,
): { amount0Min: JSBI; amount1Min: JSBI } {
  const sqrtPrice = JSBI.BigInt(positionData.sqrtPrice.toString());

  const partialPosition = new Position({
    pool: new Pool(
      parseTokenDataToCurrency(positionData.token0),
      parseTokenDataToCurrency(positionData.token1),
      positionData.fee * 10_000,
      sqrtPrice,
      JSBI.BigInt(positionData.liquidity.toString()),
      TickMath.getTickAtSqrtRatio(sqrtPrice),
    ),
    liquidity,
    tickLower: positionData.tickLower,
    tickUpper: positionData.tickUpper,
  });

  const { amount0: amount0Min, amount1: amount1Min } =
    partialPosition.burnAmountsWithSlippage(SLIPPAGE_TOLERANCE);
  return { amount0Min, amount1Min };
}
