import { useCallback } from "react";
import { type BaseError, useAccount } from "wagmi";
import { AllowanceProvider, PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";
import JSBI from "jsbi";
import DOMPurify from 'dompurify';

import { useEthersWeb3Provider } from "@/hooks/useEthersWeb3Provider";
import {
  createPermitBatch,
  createSignature,
} from "@/app/actions/smartcontract/permit";
import { toDeadline } from "@/utils/smartcontract";
import { POOL_PARTY_MANAGER_CONTRACT } from "@/config";
import { useMerkelTree } from "../useMerkelTree";
import { PoolData } from "@/hooks/pool/usePoolData";
import { toInt } from "@/utils/math";
import { TIME } from "@/constants";
import { useTransactionState } from "@/hooks/useTransactionState";
import { approveMaxToPermit2 } from "@/app/actions/smartcontract/contract";
import { newPosition } from "@/app/actions/smartcontract/position";
import { mintAmountsWithSlippage } from "@/utils/slippage";
import { wrapPromiseWithTimeout } from "@/utils/promise";
import { getAllowance } from '@/app/actions/smartcontract/token';

export type CreatePositionParams = {
  poolData: PoolData;
  amount0: string;
  amount1: string;
  tickLower: number;
  tickUpper: number;
  slippage: number;
  featureSettings: {
    name: string;
    description: string;
    operatorFee: number;
    hiddenFields: {
      showPriceRange: boolean;
      showTokenPair: boolean;
      showInOutRange: boolean;
    };
  };
};

export function useCreatePosition() {
  const { loading, setLoading, error, setError, txHash, setTxHash } =
    useTransactionState();

  const { isConnected, address, chain } = useAccount();
  const ethersProvider = useEthersWeb3Provider({ chainId: chain?.id });
  const { creatorProof } = useMerkelTree();

  const createPosition = useCallback(
    async (params: CreatePositionParams) => {
      if (!isConnected || !ethersProvider || !address || !chain) return;

      setLoading(true);

      const allowanceProvider = new AllowanceProvider(
        ethersProvider,
        PERMIT2_ADDRESS,
      );

      const token0 = params.poolData.token0;
      const token1 = params.poolData.token1;

      const amount0 = toInt(params.amount0, token0.decimals);
      const amount1 = toInt(params.amount1, token1.decimals);

      try {
        await wrapPromiseWithTimeout(async () => {
          const { nonce: nonce0 } = await allowanceProvider.getAllowanceData(
            token0.id,
            `${address}`,
            POOL_PARTY_MANAGER_CONTRACT,
          );

          const allowanceToken0 = await getAllowance(
            address,
            token0.id,
            PERMIT2_ADDRESS
          );

          if (JSBI.LT(JSBI.BigInt(allowanceToken0.toString()), JSBI.BigInt(amount0.toString()))) {
            const approvalReceipt0 = await approveMaxToPermit2(
              address,
              token0.id
            );
            if (approvalReceipt0?.failed) {
              setError(
                `Transaction 'approval' for token0 failed at block hash #${approvalReceipt0.txHash}`,
              );
              return;
            }
          }

          const { nonce: nonce1 } = await allowanceProvider.getAllowanceData(
            token1.id,
            `${address}`,
            POOL_PARTY_MANAGER_CONTRACT,
          );

          const allowanceToken1 = await getAllowance(
            address,
            token1.id,
            PERMIT2_ADDRESS
          );

          if (JSBI.LT(JSBI.BigInt(allowanceToken1.toString()), JSBI.BigInt(amount1.toString()))) {
            const approvalReceipt1 = await approveMaxToPermit2(
              address,
              token1.id,
            );
            if (approvalReceipt1?.failed) {
              setError(
                `Transaction 'approval' for token1 failed at block hash #${approvalReceipt1.txHash}`,
              );
              return;
            }
          }

          const permitBatch = await createPermitBatch({
            token0: {
              id: token0.id,
              amount: BigInt(amount0),
              nonce: BigInt(nonce0),
            },
            token1: {
              id: token1.id,
              amount: BigInt(amount1),
              nonce: BigInt(nonce1),
            },
            spenderAddress: POOL_PARTY_MANAGER_CONTRACT,
          });

          const signature = await createSignature(address, permitBatch, chain.id);
          if (!signature) {
            setError("Invalid signature");
            return;
          }

          const minAmounts = mintAmountsWithSlippage(
            {
              token0: params.poolData.token0,
              token1: params.poolData.token1,
              fee: params.poolData.feeTier,
              tickLower: params.tickLower,
              tickUpper: params.tickUpper,
              sqrtPrice: JSBI.BigInt(params.poolData.sqrtPrice.toString()),
              liquidity: JSBI.BigInt(params.poolData.liquidity),
            },
            params.amount0,
            params.amount1,
            params.slippage,
          );
          if (!minAmounts) {
            throw new Error("Invalid min amounts");
          }

          const args = {
            proof: creatorProof || [],
            permitBatch: permitBatch,
            signature: signature,
            fee: params.poolData.feeTier,
            tickLower: params.tickLower,
            tickUpper: params.tickUpper,
            amount0Min: BigInt(minAmounts.amount0Min.toString()),
            amount1Min: BigInt(minAmounts.amount1Min.toString()),
            deadline: BigInt(toDeadline(TIME.MINUTES["30"])),
            sqrtPriceX96: 0,
            featureSettings: {
              ...params.featureSettings,
              name: DOMPurify.sanitize(params.featureSettings.name),
              description: DOMPurify.sanitize(params.featureSettings.description),
              operatorFee: params.featureSettings.operatorFee * 100,
            },
          };
          const nativeTokenAmount = token0.useNative ? amount0 : token1.useNative ? amount1 : BigInt(0);
          const { txHash, failed } = await newPosition(address, args, nativeTokenAmount);
          if (failed) {
            setError(
              `Transaction 'createPosition' failed at block hash #${txHash}`,
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
      creatorProof,
      setTxHash,
      setError,
    ],
  );

  return { createPosition, error, loading, txHash };
}
