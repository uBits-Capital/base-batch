import { signTypedData, verifyTypedData } from "@wagmi/core";
import {
  AllowanceTransfer,
  PERMIT2_ADDRESS,
  PermitBatch,
  PermitDetails,
  PermitSingle,
} from "@uniswap/permit2-sdk";
import {
  TypedDataDomain,
  TypedDataField,
} from "@ethersproject/abstract-signer";

import { formatAddress, toDeadline } from "@/utils/smartcontract";
import { POOL_PARTY_MANAGER_CONTRACT } from "@/config";
import { TIME } from "@/constants";
import { wagmiConfig } from "@/wagmi";

export type PermitBatchParams = {
  token0: {
    id: string;
    amount: bigint;
    nonce: bigint;
  };
  token1: {
    id: string;
    amount: bigint;
    nonce: bigint;
  };
  spenderAddress: string;
};

export async function createPermitData(
  domain: TypedDataDomain,
  types: Record<string, TypedDataField[]>,
  values: PermitSingle | PermitBatch,
) {
  let details: PermitDetails | PermitDetails[];
  let primaryType: string;
  if (Array.isArray(values.details)) {
    details = [];
    for (const permit of values.details) {
      details.push({
        amount: permit.amount.toString(),
        expiration: permit.expiration.toString(),
        nonce: permit.nonce,
        token: permit.token,
      });
    }
    primaryType = "PermitBatch";
  } else {
    details = {
      amount: values.details.amount.toString(),
      expiration: values.details.expiration.toString(),
      nonce: values.details.nonce,
      token: values.details.token,
    };
    primaryType = "PermitSingle";
  }

  return {
    domain: {
      name: domain.name?.toString(),
      chainId: Number(domain.chainId?.toString()),
      verifyingContract: formatAddress(domain.verifyingContract || "0x"),
    },
    types,
    message: {
      details,
      sigDeadline: values.sigDeadline.toString(),
      spender: values.spender,
    },
    primaryType,
  };
}

export async function createPermitSingle({
  token,
  amount,
  nonce,
}: {
  token: string;
  amount: bigint;
  nonce: bigint;
}) {
  return {
    details: {
      token,
      amount: amount,
      expiration: BigInt(toDeadline(TIME.DAYS["30"])),
      nonce: nonce,
    } as PermitDetails,
    spender: POOL_PARTY_MANAGER_CONTRACT,
    sigDeadline: BigInt(toDeadline(TIME.MINUTES["30"])),
  } as PermitSingle;
}

export async function createPermitBatch({
  token0,
  token1,
  spenderAddress,
}: PermitBatchParams) {
  return {
    details: [
      {
        token: token0.id,
        amount: token0.amount,
        expiration: BigInt(toDeadline(TIME.DAYS["30"])),
        nonce: BigInt(token0.nonce),
      },
      {
        token: token1.id,
        amount: token1.amount,
        expiration: BigInt(toDeadline(TIME.DAYS["30"])),
        nonce: BigInt(token1.nonce),
      },
    ] as PermitDetails[],
    spender: spenderAddress,
    sigDeadline: BigInt(toDeadline(TIME.MINUTES["30"])),
  };
}

export async function createSignature(
  address: `0x${string}`,
  permit: PermitSingle | PermitBatch,
  chainId: number,
): Promise<string | undefined> {
  const { domain, types, values } = AllowanceTransfer.getPermitData(
    permit,
    PERMIT2_ADDRESS,
    chainId,
  );
  const permitData = await createPermitData(domain, types, values);
  const signature = await signTypedData(wagmiConfig, permitData);
  const isValid = await verifyTypedData(wagmiConfig, {
    ...permitData,
    address,
    signature,
  });

  if (!isValid) {
    return undefined;
  }
  return signature;
}
