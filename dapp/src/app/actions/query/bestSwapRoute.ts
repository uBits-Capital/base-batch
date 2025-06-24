"use server";

import { AUTO_ROUTE_API } from "@/config";
import { toInt } from "@/utils/math";

export type BestRoute = {
  amountOut: string;
  amountMinOut: string;
  paths: any[];
};

export type SwapRoutesParams = {
  tokenIn: string;
  tokenOut: string;
  decimalsIn: number;
  decimalsOut: number;
  symbolIn: string;
  symbolOut: string;
  nameIn: string;
  nameOut: string;
  amountIn: string;
  slippage: number;
};

export const getBestSwapRoutes = async ({
  tokenIn,
  tokenOut,
  decimalsIn,
  decimalsOut,
  symbolIn,
  symbolOut,
  nameIn,
  nameOut,
  amountIn,
  slippage,
}: SwapRoutesParams) => {
  try {
    const amountInInt = toInt(amountIn, decimalsIn);
    if (amountInInt === BigInt(0)) {
      return {
        amountOut: "0",
        amountMinOut: "0",
        paths: [],
      } as BestRoute;
    }
    const response = await fetch(AUTO_ROUTE_API, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({
        tokenIn,
        tokenOut,
        amountIn: amountInInt.toString(),
        slippage: Number(slippage),
        decimalsIn: Number(decimalsIn),
        decimalsOut: Number(decimalsOut),
        symbolIn,
        symbolOut,
        nameIn,
        nameOut,
      }),
    });
    const bestRoute = (await response.json()).message as BestRoute;
    return bestRoute;
  } catch (error) {
    console.error(
      "tokenIn: ",
      tokenIn,
      "tokenOut: ",
      tokenOut,
      "slippage: ",
      slippage,
      "error: ",
      error
    );
    return {
      amountOut: "0",
      amountMinOut: "0",
      paths: [],
    } as BestRoute;
  }
};
