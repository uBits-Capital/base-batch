import { readFromPoolParty, readFromToken } from "@/app/actions/smartcontract";

export async function getInvestedBalanceForToken0(
  poolAddress: string,
  address: `0x${string}`,
): Promise<bigint> {
  return (await readFromPoolParty(
    poolAddress,
    "balance0Of",
    [address],
    address,
  )) as bigint;
}

export async function getInvestedBalanceForToken1(
  poolAddress: string,
  address: `0x${string}`,
): Promise<bigint> {
  return (await readFromPoolParty(
    poolAddress,
    "balance1Of",
    [address],
    address,
  )) as bigint;
}
