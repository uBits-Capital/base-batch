"use client";
import { useCallback, useEffect } from "react";
import { type BaseError, useAccount } from "wagmi";
import { toDeadline } from "@/utils/smartcontract";
import { TIME } from "@/constants";
import { IPoolPartyPosition_SwapParams } from "@/app/actions/smartcontract/liquidity";
import { useTransactionState } from "@/hooks/useTransactionState";
import { withdraw as withdrawSC } from "@/app/actions/smartcontract/withdraw";
import { wrapPromiseWithTimeout } from "@/utils/promise";

export type WithdrawParams = {
  forceSlippage?: boolean;
  positionId: string;
  swap: IPoolPartyPosition_SwapParams;
};

export function useWithdraw() {
  const { loading, setLoading, error, setError, txHash, setTxHash } =
    useTransactionState();

  const { isConnected, address, chain } = useAccount();

  useEffect(() => {
    if (loading) {
      setError(undefined);
      setTxHash(undefined);
    }
  }, [loading, setError, setTxHash]);

  const withdraw = useCallback(
    async (params: WithdrawParams) => {
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
          const { txHash, failed } = await withdrawSC(address, args);
          if (failed) {
            setError(`Transaction 'withdraw' failed at block hash #${txHash}`);
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

  return { withdraw, error, loading, txHash };
}
