"use client";
import { useCallback } from "react";
import { useAccount } from "wagmi";
import { getBalance as getEtherBalance } from '@wagmi/core';

import JSBI from "jsbi";
import { fromInt } from "@/utils/math";

import { formatAddress, isWETH } from "@/utils/smartcontract";
import { getBalanceOf } from "@/app/actions/smartcontract/wallet";
import { Token } from "@uniswap/sdk-core";
import { TokenData } from "@/hooks/token/useTokenData";
import { wagmiConfig } from "@/wagmi";

export function useTokenBalance(
  token0?: Token | TokenData,
  token1?: Token | TokenData,
) {
  const { isConnected, address } = useAccount();

  const getBalance = useCallback(async () => {
    if (!isConnected || !address || !token0 || !token1)
      return [undefined, undefined];

    return Promise.all(
      [
        token0 instanceof Token ? token0.address : token0.id,
        token1 instanceof Token ? token1.address : token1.id,
      ].map(async (tokenId) => {
        if (isWETH(tokenId)) {
          return (await getEtherBalance(wagmiConfig, { address })).value;
        } else {
          return getBalanceOf(address, formatAddress(tokenId));
        }
      }),
    );
  }, [isConnected, address, token0, token1]);

  const getFormattedBalance = useCallback(async () => {
    if (!isConnected || !address || !token0 || !token1)
      return [undefined, undefined];

    return getBalance().then((balances) =>
      balances?.map(
        (balance, index) =>
          balance &&
          fromInt(
            JSBI.BigInt(`${balance}`),
            (index === 0 ? token0 : token1).decimals,
          ),
      ),
    );
  }, [isConnected, address, getBalance, token0, token1]);

  return {
    getBalance,
    getFormattedBalance,
  };
}
