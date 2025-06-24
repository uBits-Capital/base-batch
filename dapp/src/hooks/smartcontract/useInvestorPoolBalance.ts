import { useCallback, useEffect, useState } from "react";
import { type BaseError, useAccount } from "wagmi";
import JSBI from "jsbi";
import { Token } from "@/queries/generated/graphql";
import { fromInt } from "@/utils/math";
import {
  getInvestedBalanceForToken0,
  getInvestedBalanceForToken1,
} from "@/app/actions/smartcontract/balance";
import {
  getRewardsEarnedForToken0,
  getRewardsEarnedForToken1,
} from "@/app/actions/smartcontract/rewards";

import { TokenData } from "@/hooks/token/useTokenData";

export type InvestorPoolBalanceParams = {
  pool: string;
  token0: Token | TokenData;
  token1: Token | TokenData;
};

export function useInvestorPoolBalance(params: InvestorPoolBalanceParams) {
  const [amount0, setAmount0] = useState<number>(0);
  const [amount1, setAmount1] = useState<number>(0);
  const [rewards0, setRewards0] = useState<number>(0);
  const [rewards1, setRewards1] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const { isConnected, address } = useAccount();

  useEffect(() => {
    if (loading) setError(undefined);
  }, [loading]);

  const fetchBalance = useCallback(async () => {
    if (!isConnected || !address) return;

    setLoading(true);
    try {
      const poolAddress = params.pool;

      const [balance0, balance1, rewards0, rewards1] = await Promise.all([
        getInvestedBalanceForToken0(poolAddress, address),
        getInvestedBalanceForToken1(poolAddress, address),
        getRewardsEarnedForToken0(poolAddress, address),
        getRewardsEarnedForToken1(poolAddress, address),
      ]);

      setAmount0(
        fromInt(JSBI.BigInt(balance0.toString()), params.token0.decimals),
      );
      setAmount1(
        fromInt(JSBI.BigInt(balance1.toString()), params.token1.decimals),
      );
      setRewards0(
        fromInt(JSBI.BigInt(rewards0.toString()), params.token0.decimals),
      );
      setRewards1(
        fromInt(JSBI.BigInt(rewards1.toString()), params.token1.decimals),
      );
    } catch (error) {
      const errorMessage = (error as BaseError)?.shortMessage || "Something went wrong";
      console.error(
        "Transaction failed: ",
        errorMessage,
        (error as BaseError)?.details,
        error,
      );
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, params.pool, params.token0, params.token1]);

  return { fetchBalance, loading, error, amount0, amount1, rewards0, rewards1 };
}
