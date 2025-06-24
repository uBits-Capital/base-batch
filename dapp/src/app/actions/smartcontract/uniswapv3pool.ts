"use server";
import { IERC20_ABI, UNISWAP_V3_POOL_ABI } from "@/ABI";
import { formatAddress } from "@/utils/smartcontract";
import { client } from "../../../publicClient";

export type IUniswapV3Pool_Slot0 = {
  sqrtPriceX96: bigint;
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
};

export async function readFromUniswapV3Pool(
  functionName: string,
  poolAddress: string,
  args: any[]
) {
  return client.readContract({
    abi: UNISWAP_V3_POOL_ABI,
    address: formatAddress(poolAddress),
    functionName: functionName,
    args,
  });
}

export async function getSlot0(pool: string): Promise<IUniswapV3Pool_Slot0> {
  const slot0 = (await readFromUniswapV3Pool("slot0", pool, [])) as any;
  return {
    sqrtPriceX96: BigInt(`${slot0[0]}`),
    tick: slot0[1],
    observationIndex: slot0[2],
    observationCardinality: slot0[3],
    observationCardinalityNext: slot0[4],
    feeProtocol: slot0[5],
    unlocked: slot0[6],
  };
}

export async function getLiquidity(pool: string): Promise<bigint> {
  return (await readFromUniswapV3Pool("liquidity", pool, [])) as bigint;
}

export async function getTokenBalanceOf(
  address: `0x${string}`,
  tokenAddress: string
): Promise<bigint> {
  return (await client.readContract({
    abi: IERC20_ABI,
    address: formatAddress(tokenAddress),
    functionName: "balanceOf",
    args: [address],
  })) as bigint;
}

export async function getTokenDecimals(tokenAddress: string): Promise<number> {
  return (await client.readContract({
    abi: IERC20_ABI,
    address: formatAddress(tokenAddress),
    functionName: "decimals",
    args: [],
  })) as number;
}
