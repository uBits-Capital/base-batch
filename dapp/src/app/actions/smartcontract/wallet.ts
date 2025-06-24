import { readFromToken } from "@/app/actions/smartcontract/index";

export async function getBalanceOf(
  accountAddress: `0x${string}`,
  tokenAddress: string,
) {
  return (await readFromToken("balanceOf", tokenAddress, [
    accountAddress,
  ])) as bigint;
}
