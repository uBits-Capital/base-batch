import { IERC20_ABI, PERMIT2_ABI } from "@/ABI";
import { formatAddress } from "@/utils/smartcontract";
import {
  PERMIT2_ADDRESS,
  MaxAllowanceTransferAmount,
} from "@uniswap/permit2-sdk";
import { writeContractWithTimeOut } from "@/app/actions/smartcontract";
import { simulateContract } from "@wagmi/core";
import { wagmiConfig } from "@/wagmi";

export async function approveMaxToPermit2(
  address: `0x${string}`,
  tokenAddress: string
): Promise<{ txHash: string; failed: boolean } | undefined> {
  const { request } = await simulateContract(wagmiConfig, {
    abi: IERC20_ABI,
    account: address,
    address: formatAddress(tokenAddress),
    functionName: "approve",
    args: [PERMIT2_ADDRESS, MaxAllowanceTransferAmount],
  });

  return writeContractWithTimeOut(request);
}

export async function approveWithPermit2Contract(
  address: `0x${string}`,
  tokenAddress: string,
  spender: string,
  expiration: number
): Promise<{ txHash: string; failed: boolean } | undefined> {
  const { request } = await simulateContract(wagmiConfig, {
    abi: PERMIT2_ABI,
    account: address,
    address: formatAddress(PERMIT2_ADDRESS),
    functionName: "approve",
    args: [tokenAddress, spender, MaxAllowanceTransferAmount, expiration],
  });

  return writeContractWithTimeOut(request);
}
