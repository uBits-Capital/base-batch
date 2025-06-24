import { writeToPoolPartyManager } from "@/app/actions/smartcontract";
import { IPoolPartyPosition_SwapParams } from "./liquidity";

export type IPoolPartyPositionManager_WithdrawParams = {
  positionId: string;
  swap: IPoolPartyPosition_SwapParams;
  deadline: bigint;
};

export async function withdraw(
  address: `0x${string}`,
  data: IPoolPartyPositionManager_WithdrawParams,
): Promise<{ txHash: string; failed: boolean }> {
  return writeToPoolPartyManager(address, "withdraw", [data]);
}
