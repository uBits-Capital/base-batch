import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";

import { wagmiConfig } from "@/wagmi";
import { simulateContract } from "@wagmi/core";
import {
  IERC20_ABI,
  IERC20ABIFunctions,
  POOL_PARTY_ABI,
  POOL_PARTY_MANAGER_ABI,
  PoolPartyABIFunctions,
  PoolPartyManagerABIFunctions,
} from "@/ABI";
import { formatAddress } from "@/utils/smartcontract";
import { POOL_PARTY_MANAGER_CONTRACT } from "@/config";
import { TIME } from "@/constants";

export async function readFromPoolPartyManager(
  functionName: PoolPartyManagerABIFunctions,
  args: any[],
  address?: `0x${string}`
) {
  return readContract(wagmiConfig, {
    abi: POOL_PARTY_MANAGER_ABI,
    account: address,
    address: formatAddress(POOL_PARTY_MANAGER_CONTRACT),
    functionName: functionName,
    args,
  });
}

export async function readFromPoolParty(
  poolAddress: string,
  functionName: PoolPartyABIFunctions,
  args: any[],
  address?: `0x${string}`
) {
  return readContract(wagmiConfig, {
    abi: POOL_PARTY_ABI,
    account: address,
    address: formatAddress(poolAddress),
    functionName: functionName,
    args,
  });
}

export async function readFromToken(
  functionName: IERC20ABIFunctions,
  tokenAddress: string,
  args: any[],
  address?: `0x${string}`
) {
  return readContract(wagmiConfig, {
    abi: IERC20_ABI,
    account: address,
    address: formatAddress(tokenAddress),
    functionName: functionName,
    args,
  });
}

export async function writeToPoolPartyManager(
  address: `0x${string}`,
  functionName: PoolPartyManagerABIFunctions,
  args: any[],
  nativeTokenAmount?: bigint
) {
  const { request } = await simulateContract(wagmiConfig, {
    abi: POOL_PARTY_MANAGER_ABI,
    account: address,
    address: formatAddress(POOL_PARTY_MANAGER_CONTRACT),
    functionName: functionName,
    args,
    value:
      nativeTokenAmount && nativeTokenAmount > 0
        ? nativeTokenAmount
        : undefined,
  });

  return writeContractWithTimeOut(request);
}

export async function waitTxReceipt(hash: string) {
  const receipt = await waitForTransactionReceipt(wagmiConfig, {
    hash: formatAddress(hash),
    timeout: TIME.MINUTES["1"],
  });

  return receipt.status !== "success"
    ? {
        txHash: receipt.transactionHash,
        failed: true,
      }
    : { txHash: receipt.transactionHash, failed: false };
}

export const writeContractWithTimeOut = (request: any) => {
  return new Promise<{
    txHash: `0x${string}`;
    failed: boolean;
  }>(async (resolve, reject) => {
    const time = setTimeout(() => {
      reject({
        txHash: `0x0`,
        failed: true,
        details: "Timeout",
        shortMessage: "Timeout",
      });
    }, TIME.MINUTES["1"]);

    try {
      const _hash = await writeContract(wagmiConfig, request);
      clearTimeout(time);
      resolve(waitTxReceipt(_hash));
    } catch (error) {
      clearTimeout(time);
      reject(error);
    }
  });
};
