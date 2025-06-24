import {
  readFromPoolParty,
  writeToPoolPartyManager,
} from "@/app/actions/smartcontract/index";
import { PermitSingle } from "@uniswap/permit2-sdk";

export type IPoolPartyPosition_SwapParams = {
  shouldSwapFees: boolean;
  poolFeeTier0: number;
  poolFeeTier1: number;
  amount0OutMinimum: bigint;
  amount1OutMinimum: bigint;
};

export type IPoolPartyPositionManager_AddLiquidityParams = {
  proof: string[];
  positionId: string;
  deadline: bigint;
  swap: IPoolPartyPosition_SwapParams;
  permit: PermitSingle;
  signature: string;
  ignoreSlippage: boolean;
};

export type IPoolPartyPositionManager_RemoveLiquidityParams = {
  positionId: string;
  percentage: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  deadline: bigint;
  swap: IPoolPartyPosition_SwapParams;
};

export async function increaseLiquidity(
  address: `0x${string}`,
  data: IPoolPartyPositionManager_AddLiquidityParams,
): Promise<{ txHash: string; failed: boolean }> {
  return writeToPoolPartyManager(address, "addLiquidity", [data]);
}

export async function decreaseLiquidity(
  address: `0x${string}`,
  data: IPoolPartyPositionManager_RemoveLiquidityParams,
): Promise<{ txHash: string; failed: boolean }> {
  return writeToPoolPartyManager(address, "removeLiquidity", [data]);
}

export async function investorLiquidity(
  poolAddress: string,
  address: `0x${string}`,
): Promise<bigint> {
  return (await readFromPoolParty(
    poolAddress,
    "liquidityOf",
    [address],
    address,
  )) as bigint;
}
