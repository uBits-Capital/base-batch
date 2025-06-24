import {
  readFromPoolParty,
  writeToPoolPartyManager,
} from "@/app/actions/smartcontract";
import { IPoolPartyPosition_SwapParams } from "./liquidity";

export type IPoolPartyPositionManager_CollectRewardsParams = {
  positionId: string;
  swap: IPoolPartyPosition_SwapParams;
  deadline: bigint;
};

export async function getRewardsEarnedForToken0(
  poolAddress: string,
  address: `0x${string}`,
): Promise<bigint> {
  return (await readFromPoolParty(
    poolAddress,
    "calculateRewards0Earned",
    [address],
    address,
  )) as bigint;
}

export async function getRewardsEarnedForToken1(
  poolAddress: string,
  address: `0x${string}`,
): Promise<bigint> {
  return (await readFromPoolParty(
    poolAddress,
    "calculateRewards1Earned",
    [address],
    address,
  )) as bigint;
}

export async function collectRewards(
  address: `0x${string}`,
  data: IPoolPartyPositionManager_CollectRewardsParams,
): Promise<{ txHash: string; failed: boolean }> {
  return writeToPoolPartyManager(address, "collectRewards", [data]);
}
