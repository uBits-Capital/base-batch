"use client";
import { useCallback, useEffect } from "react";
import { type BaseError, useAccount } from "wagmi";
import { toDeadline } from "@/utils/smartcontract";
import { TIME } from "@/constants";
import { IPoolPartyPosition_SwapParams } from "@/app/actions/smartcontract/liquidity";
import { useTransactionState } from "@/hooks/useTransactionState";
import { collectRewards } from "@/app/actions/smartcontract/rewards";
import { wrapPromiseWithTimeout } from "@/utils/promise";

export type CollectFeesParams = {
  forceSlippage?: boolean;
  positionId: string;
  swap: IPoolPartyPosition_SwapParams;
};

export function useRewards() {
  const { loading, setLoading, error, setError, txHash, setTxHash } =
    useTransactionState();

  const { isConnected, address, chain } = useAccount();

  useEffect(() => {
    if (loading) {
      setError(undefined);
      setTxHash(undefined);
    }
  }, [loading, setError, setTxHash]);

  const collectFees = useCallback(
    async (params: CollectFeesParams) => {
      if (!isConnected || !address || !chain) {
        return;
      }
      setLoading(true);
      try {
        await wrapPromiseWithTimeout(async () => {
          let swap = {} as IPoolPartyPosition_SwapParams;
          if (params.swap.shouldSwapFees) {
            swap = {
              shouldSwapFees: true,
              poolFeeTier0: params.swap.poolFeeTier0,
              poolFeeTier1: params.swap.poolFeeTier1,
              amount0OutMinimum: params.forceSlippage
                ? BigInt(0)
                : params.swap.amount0OutMinimum,
              amount1OutMinimum: params.forceSlippage
                ? BigInt(0)
                : params.swap.amount1OutMinimum,
            };
          } else {
            swap = {
              shouldSwapFees: false,
              poolFeeTier0: 0,
              poolFeeTier1: 0,
              amount0OutMinimum: BigInt(0),
              amount1OutMinimum: BigInt(0),
            };
          }

          const args = {
            positionId: params.positionId,
            deadline: BigInt(toDeadline(TIME.MINUTES["30"])),
            swap,
          };
          const { txHash, failed } = await collectRewards(address, args);
          if (failed) {
            setError(
              `Transaction 'collectRewards' failed at block hash #${txHash}`,
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
    [isConnected, address, chain, setLoading, setTxHash, setError],
  );

  return { collectFees, error, loading, txHash };
}
