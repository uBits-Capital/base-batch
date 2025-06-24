import { useCallback } from "react";
import { type BaseError, useAccount } from "wagmi";
import { toDeadline } from "@/utils/smartcontract";
import { TIME } from "@/constants";
import { useTransactionState } from "@/hooks/useTransactionState";
import { closePool } from "@/app/actions/smartcontract/position";
import { PositionData } from "./usePositions";
import { wrapPromiseWithTimeout } from "@/utils/promise";

export type ClosePositionParams = {
  positionData: PositionData;
};

export function useClosePosition() {
  const { loading, setLoading, error, setError, txHash, setTxHash } =
    useTransactionState();

  const { isConnected, address, chain } = useAccount();

  const closePosition = useCallback(
    async (params: ClosePositionParams) => {
      if (!isConnected || !address || !chain) return;

      setLoading(true);

      try {
        await wrapPromiseWithTimeout(async () => {
          const args = {
            positionId: params.positionData.positionId,
            deadline: BigInt(toDeadline(TIME.MINUTES["30"])),
          };
          const { txHash, failed } = await closePool(address, args);
          if (failed) {
            setError(
              `Transaction 'closePosition' failed at block hash #${txHash}`,
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

  return { closePosition, error, loading, txHash };
}
