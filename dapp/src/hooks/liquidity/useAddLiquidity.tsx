"use client";
import { useCallback, useEffect } from "react";
import { type BaseError, useAccount } from "wagmi";
import { AllowanceProvider, PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";
import { FeeAmount } from "@uniswap/v3-sdk";
import JSBI from "jsbi";

import { useEthersWeb3Provider } from "@/hooks/useEthersWeb3Provider";
import { useMerkelTree } from "../useMerkelTree";
import {
  createPermitSingle,
  createSignature,
} from "@/app/actions/smartcontract/permit";
import { toDeadline } from "@/utils/smartcontract";
import { POOL_PARTY_MANAGER_CONTRACT, USDC_CONTRACT } from "@/config";
import { TIME } from "@/constants";
import { approveMaxToPermit2 } from "@/app/actions/smartcontract/contract";
import { increaseLiquidity } from "@/app/actions/smartcontract/liquidity";
import { useTransactionState } from "@/hooks/useTransactionState";
import { wrapPromiseWithTimeout } from "@/utils/promise";
import { getAllowance } from "@/app/actions/smartcontract/token";

export type AddLiquidityInUSDCParams = {
  forceSlippage?: boolean;
  positionId: string;
  amount: bigint;
  poolFeeTier0: FeeAmount;
  poolFeeTier1: FeeAmount;
  amount0OutMinimum: bigint;
  amount1OutMinimum: bigint;
};

export function useAddLiquidity() {
  const { loading, setLoading, error, setError, txHash, setTxHash } =
    useTransactionState();

  const { isConnected, address, chain } = useAccount();
  const ethersProvider = useEthersWeb3Provider({ chainId: chain?.id });
  const { investorProof } = useMerkelTree();

  useEffect(() => {
    if (loading) {
      setError(undefined);
      setTxHash(undefined);
    }
  }, [loading, setError, setTxHash]);


  const addLiquidity = useCallback(
    async (params: AddLiquidityInUSDCParams) => {
      if (!isConnected || !ethersProvider || !address || !chain) {
        return;
      }
      setLoading(true);

      const allowanceProvider = new AllowanceProvider(
        ethersProvider,
        PERMIT2_ADDRESS,
      );

      try {
        await wrapPromiseWithTimeout(async () => {
          const { nonce } = await allowanceProvider.getAllowanceData(
            USDC_CONTRACT,
            `${address}`,
            POOL_PARTY_MANAGER_CONTRACT,
          );

          const allowance = await getAllowance(
            address,
            USDC_CONTRACT,
            PERMIT2_ADDRESS
          );

          if (JSBI.LT(JSBI.BigInt(allowance.toString()), JSBI.BigInt(params.amount.toString()))) {
            const approvalReceipt = await approveMaxToPermit2(
              address,
              USDC_CONTRACT,
            );
            if (approvalReceipt?.failed) {
              setError(
                `Transaction 'approval' failed at block hash #${approvalReceipt.txHash}`,
              );
              return;
            }
          }

          const permitSingle = await createPermitSingle({
            token: USDC_CONTRACT,
            amount: params.amount,
            nonce: BigInt(nonce),
          });

          const signature = await createSignature(
            address,
            permitSingle,
            chain.id,
          );
          if (!signature) {
            setError("Invalid signature");
            return;
          }

          const args = {
            proof: investorProof || [],
            positionId: params.positionId,
            permit: permitSingle,
            signature,
            ignoreSlippage: params.forceSlippage || false,
            deadline: BigInt(toDeadline(TIME.MINUTES["30"])),
            swap: {
              shouldSwapFees: true,
              poolFeeTier0: params.poolFeeTier0,
              poolFeeTier1: params.poolFeeTier1,
              amount0OutMinimum: params.forceSlippage
                ? BigInt(0)
                : params.amount0OutMinimum,
              amount1OutMinimum: params.forceSlippage
                ? BigInt(0)
                : params.amount1OutMinimum,
            },
          };
          const { txHash, failed } = await increaseLiquidity(address, args);
          if (failed) {
            setError(
              `Transaction 'addLiquidity' failed at block hash #${txHash}`,
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
      investorProof,
      setTxHash,
      setError,
    ],
  );

  return { addLiquidity, error, loading, txHash };
}
