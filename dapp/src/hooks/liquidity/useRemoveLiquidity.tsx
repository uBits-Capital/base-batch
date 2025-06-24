"use client";
import { useCallback, useEffect } from "react";
import { type BaseError, useAccount } from "wagmi";
import JSBI from "jsbi";

import {
  decreaseLiquidity,
  investorLiquidity,
} from "@/app/actions/smartcontract/liquidity";
import { useEthersWeb3Provider } from "@/hooks/useEthersWeb3Provider";
import { useTransactionState } from "@/hooks/useTransactionState";
import { toDeadline } from "@/utils/smartcontract";
import { burnAmountsWithSlippage } from "@/utils/slippage";
import { TIME } from "@/constants";
import { PositionData } from "../position/usePositions";
import { wrapPromiseWithTimeout } from "@/utils/promise";

export type RemoveLiquidityParams = {
  forceSlippage?: boolean;
  positionData: PositionData<true>;
  percentage: number;
  swap: {
    shouldSwapFees: boolean;
    poolFeeTier0: number;
    poolFeeTier1: number;
    amount0OutMinimum: bigint;
    amount1OutMinimum: bigint;
  };
};

export function useRemoveLiquidity() {
  const { loading, setLoading, error, setError, txHash, setTxHash } =
    useTransactionState();

  const { isConnected, address, chain } = useAccount();
  const ethersProvider = useEthersWeb3Provider({ chainId: chain?.id });

  useEffect(() => {
    if (loading) {
      setError(undefined);
      setTxHash(undefined);
    }
  }, [loading, setError, setTxHash]);

  const removeLiquidity = useCallback(
    async (params: RemoveLiquidityParams) => {
      if (!isConnected || !ethersProvider || !address || !chain) {
        return;
      }
      setLoading(true);

      if (params.percentage < 0) {
        params.percentage = 1;
      } else if (params.percentage > 100) {
        params.percentage = 100;
      }

      const liquidity = await investorLiquidity(
        params.positionData.pool,
        address,
      );

      const removeLiquidityAmount = JSBI.divide(
        JSBI.multiply(
          JSBI.BigInt(liquidity.toString()),
          JSBI.BigInt(params.percentage),
        ),
        JSBI.BigInt(100),
      );

      const minAmounts = burnAmountsWithSlippage(
        params.positionData,
        removeLiquidityAmount,
      );

      try {
        await wrapPromiseWithTimeout(async () => {
          const args = {
            positionId: params.positionData.positionId,
            percentage: BigInt(params.percentage * 1e15),
            amount0Min: params.forceSlippage
              ? BigInt(0)
              : BigInt(minAmounts.amount0Min.toString()),
            amount1Min: params.forceSlippage
              ? BigInt(0)
              : BigInt(minAmounts.amount1Min.toString()),
            deadline: BigInt(toDeadline(TIME.MINUTES["30"])),
            swap: {
              shouldSwapFees: params.swap.shouldSwapFees,
              poolFeeTier0: params.swap.poolFeeTier0,
              poolFeeTier1: params.swap.poolFeeTier1,
              amount0OutMinimum: params.forceSlippage
                ? BigInt(0)
                : params.swap.amount0OutMinimum,
              amount1OutMinimum: params.forceSlippage
                ? BigInt(0)
                : params.swap.amount1OutMinimum,
            },
          };
          const { txHash, failed } = await decreaseLiquidity(address, args);
          if (failed) {
            setError(
              `Transaction 'removeLiquidity' failed at block hash #${txHash}`,
            );
            return;
          }
          setTxHash(txHash);
        });
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
    },
    [
      isConnected,
      ethersProvider,
      address,
      chain,
      setLoading,
      setTxHash,
      setError,
    ],
  );

  return { removeLiquidity, error, loading, txHash };
}
