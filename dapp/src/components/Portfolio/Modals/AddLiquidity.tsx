import { useCallback, useEffect, useMemo, useState } from "react";
import JSBI from "jsbi";

import { PositionData } from "@/hooks/position/usePositions";
import { useAddLiquidity } from "@/hooks/liquidity/useAddLiquidity";
import { useQuote } from "@/hooks/useQuote";
import TransactionModal, {
  ModalActionType,
  TransactionType,
} from "@/components/TransactionModal";

import { ARBISCAN_URL, USDC_CONTRACT } from "@/config";
import { fromInt, getRatio } from "@/utils/math";
import { Percent } from '@uniswap/sdk-core';

interface AddLiquidityProps {
  positionData: PositionData;
  usdcAmount: bigint;
  fiatAmount: string;
  slippage: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddLiquidity({
  positionData,
  usdcAmount,
  fiatAmount,
  onClose,
  slippage,
  onSuccess,
}: AddLiquidityProps) {
  const [disabled, setDisabled] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);

  const {
    addLiquidity,
    loading: loadingAddLiquidity,
    error,
    txHash,
  } = useAddLiquidity();

  const percentSlippage = useMemo(() => new Percent(JSBI.BigInt(Number(slippage * 100).toFixed(0)), 100), [slippage]);

  const {
    quoteMaxAmountOut: quoteMaxAmountOut0,
    feeAmount: quoteFeeAmount0,
    amountOut: quoteAmount0Out,
    loading: quote0Loading,
  } = useQuote(positionData.fee, percentSlippage);

  const {
    quoteMaxAmountOut: quoteMaxAmountOut1,
    feeAmount: quoteFeeAmount1,
    amountOut: quoteAmount1Out,
    loading: quote1Loading,
  } = useQuote(positionData.fee, percentSlippage);

  const handleAddLiquidity = useCallback(
    async (forceSlippage?: boolean) => {
      if (quote0Loading || quote1Loading) return;
      setShowTxModal(true);
      await addLiquidity({
        forceSlippage,
        positionId: positionData.positionId,
        amount: usdcAmount,
        poolFeeTier0: quoteFeeAmount0,
        poolFeeTier1: quoteFeeAmount1,
        amount0OutMinimum: quoteAmount0Out,
        amount1OutMinimum: quoteAmount1Out,
      });
    },
    [
      usdcAmount,
      positionData.positionId,
      quoteFeeAmount0,
      quoteFeeAmount1,
      quoteAmount0Out,
      quoteAmount1Out,
      addLiquidity, 
    ],
  );

  const slippageCheckError = useMemo(() => {
    const _error = error?.toLocaleLowerCase();
    return (
      _error &&
      (_error.includes("price slippage check") ||
        _error.includes("swap failed: too little received"))
    );
  }, [error]);

  useEffect(() => {
    if (quote0Loading || quote1Loading) return;
    const ratio = getRatio(positionData);
    const token0 = positionData.token0.id;
    const token1 = positionData.token1.id;
    const usdcAmountBigInt = JSBI.BigInt(usdcAmount.toString());
    const usdcAmount0 = JSBI.divide(
      JSBI.multiply(usdcAmountBigInt, JSBI.BigInt(ratio?.toString() || "0")),
      JSBI.BigInt(100),
    );
    const usdcAmount1 = JSBI.subtract(usdcAmountBigInt, usdcAmount0);

    if (token0 !== USDC_CONTRACT && JSBI.GT(usdcAmount0, JSBI.BigInt(0))) {
      quoteMaxAmountOut0(USDC_CONTRACT, token0, usdcAmount0.toString()).then();
    }
    if (token1 !== USDC_CONTRACT && JSBI.GT(usdcAmount1, JSBI.BigInt(0))) {
      quoteMaxAmountOut1(USDC_CONTRACT, token1, usdcAmount1.toString()).then();
    }
  }, [positionData, quoteMaxAmountOut0, quoteMaxAmountOut1, usdcAmount]);

  useEffect(() => {
    // setDisabled(!(!loadingAddLiquidity && !quote0Loading && !quote1Loading));
  }, [loadingAddLiquidity, quote0Loading, quote1Loading]);

  useEffect(() => {
    if (slippageCheckError) {
      setShowTxModal(false);
    }
  }, [slippageCheckError]);

  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`fixed inset-0  ${!showTxModal ? "bg-opacity-75" : "bg-opacity-15"} bg-gray-500  transition-opacity`}
        aria-hidden="true"
      ></div>
      {!loadingAddLiquidity && !showTxModal && (
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0  gap-[9px] rounded-3xl bg-[#12131a] border border-[#273345]">
              <div className="flex flex-col justify-start items-start w-[310px] md:w-[445px]  overflow-hidden rounded-2xl bg-[#12131a]">
                <div className="flex flex-col justify-start items-start w-[310px] md:w-[445px] overflow-hidden rounded-2xl bg-[#12131a]">
                  <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 relative p-6 border-t-0 border-r-0 border-b border-l-0 border-[#273345]">
                    <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-8 h-8 gap-0.5 p-2 rounded-[1000px]" />
                    <p className="flex-grow w-[333px] text-xl font-medium text-center text-white">
                      Add liquidity
                    </p>
                    <div
                      className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5 p-2 rounded-[1000px] cursor-pointer"
                      onClick={onClose}
                    >
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="flex-grow-0 flex-shrink-0 w-4 h-4 relative"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13.6872 3.02024C13.8825 2.82498 13.8825 2.5084 13.6872 2.31313C13.4919 2.11787 13.1754 2.11787 12.9801 2.31313L8.00033 7.29291L3.02055 2.31313C2.82528 2.11787 2.5087 2.11787 2.31344 2.31313C2.11818 2.5084 2.11818 2.82498 2.31344 3.02024L7.29322 8.00002L2.31344 12.9798C2.11818 13.1751 2.11818 13.4916 2.31344 13.6869C2.5087 13.8822 2.82528 13.8822 3.02055 13.6869L8.00033 8.70713L12.9801 13.6869C13.1754 13.8822 13.4919 13.8822 13.6872 13.6869C13.8825 13.4916 13.8825 13.1751 13.6872 12.9798L8.70743 8.00002L13.6872 3.02024Z"
                          fill="#9CA3AF"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-5 p-6">
                    <p className="flex-grow-0 flex-shrink-0 text-sm font-medium text-left text-white/50"></p>
                    <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-[460px] h-1 absolute left-8 top-[83px] rounded-[5px]" />
                    <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 gap-4 p-6 rounded-2xl bg-[#191d26]">
                      <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 gap-3">
                        <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 relative">
                          <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
                            <svg
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="flex-grow-0 flex-shrink-0 w-6 h-6 relative"
                              preserveAspectRatio="xMidYMid meet"
                            >
                              <rect
                                width={24}
                                height={24}
                                rx={12}
                                fill="#2775CA"
                              />
                              <path
                                d="M15.2996 13.9C15.2996 12.15 14.2496 11.55 12.1496 11.3001C10.6496 11.1 10.3496 10.7001 10.3496 9.99998C10.3496 9.2999 10.8496 8.85002 11.8496 8.85002C12.7496 8.85002 13.2496 9.15002 13.4996 9.90002C13.5496 10.05 13.6996 10.15 13.8496 10.15H14.6495C14.8496 10.15 14.9996 9.99998 14.9996 9.80006V9.75002C14.7995 8.64998 13.8995 7.80002 12.7496 7.70006V6.50006C12.7496 6.30002 12.5996 6.15002 12.3496 6.09998H11.5996C11.3996 6.09998 11.2496 6.24998 11.1995 6.50006V7.65002C9.69953 7.85006 8.74961 8.85002 8.74961 10.1001C8.74961 11.7501 9.74957 12.4 11.8496 12.6501C13.2496 12.9 13.6996 13.2 13.6996 14.0001C13.6996 14.8001 12.9995 15.3501 12.0496 15.3501C10.7495 15.3501 10.2995 14.8 10.1495 14.05C10.0996 13.8501 9.94961 13.75 9.79961 13.75H8.94953C8.74961 13.75 8.59961 13.9 8.59961 14.1V14.1501C8.79953 15.4 9.59957 16.3 11.2496 16.5501V17.7501C11.2496 17.95 11.3996 18.1 11.6495 18.15H12.3995C12.5996 18.15 12.7496 18 12.7996 17.7501V16.5501C14.2996 16.3 15.2996 15.25 15.2996 13.9Z"
                                fill="white"
                              />
                              <path
                                d="M9.45 19.15C5.55 17.7501 3.54996 13.4001 5.00004 9.54998C5.75004 7.44998 7.40004 5.85002 9.45 5.10002C9.65004 5.00006 9.75 4.85006 9.75 4.59998V3.90002C9.75 3.69998 9.65004 3.54998 9.45 3.50006C9.39996 3.50006 9.3 3.50006 9.24996 3.54998C4.5 5.04998 1.89996 10.1001 3.39996 14.85C4.29996 17.65 6.45 19.8 9.24996 20.7C9.45 20.8 9.65004 20.7 9.69996 20.5C9.75 20.4501 9.75 20.4 9.75 20.3001V19.6C9.75 19.45 9.6 19.2501 9.45 19.15ZM14.75 3.54998C14.55 3.45002 14.35 3.54998 14.3 3.75002C14.25 3.80006 14.25 3.84998 14.25 3.95006V4.65002C14.25 4.85006 14.4 5.04998 14.55 5.15006C18.45 6.54998 20.45 10.9 19 14.7501C18.25 16.8501 16.6 18.45 14.55 19.2C14.35 19.3 14.25 19.45 14.25 19.7001V20.4C14.25 20.6001 14.35 20.7501 14.55 20.8C14.6 20.8 14.7 20.8 14.75 20.7501C19.5 19.2501 22.1 14.2 20.6 9.45002C19.7 6.60002 17.5 4.44998 14.75 3.54998Z"
                                fill="white"
                              />
                            </svg>
                            <p className="flex-grow-0 flex-shrink-0 text-sm text-left text-gray-300">
                              USDC
                            </p>
                          </div>
                          <p className="flex-grow-0 flex-shrink-0 text-sm font-medium text-left text-white">
                            {fromInt(usdcAmount, 6)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {error && slippageCheckError && (
                      <p className="flex-grow-0 flex-shrink-0 text-sm font-medium text-left text-[#9e3f3f]">
                        Price slippage check failed. Slippage higher than {slippage}%.
                      </p>
                    )}
                    <div
                      className={`flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-1 rounded-[1000px]  ${!disabled ? "text-[#12131A] bg-white" : "text-gray-500 bg-[#273345]"}`}
                    >
                      {error && slippageCheckError ? (
                        <button
                          className="flex justify-center items-center w-full h-full py-3 relative px-5"
                          disabled={disabled}
                          onClick={() => handleAddLiquidity(true)}
                        >
                          <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left  ">
                            Add Liquidity Anyway
                          </p>
                        </button>
                      ) : (
                        <button
                          className="flex justify-center items-center w-full h-full py-3 relative px-5"
                          disabled={disabled || error !== undefined}
                          onClick={() => handleAddLiquidity(false)}
                        >
                          <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left   ">
                            Add Liquidity
                          </p>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTxModal && !slippageCheckError && (
        <TransactionModal
          type={
            !!txHash
              ? TransactionType.SUCCESS
              : !!error
                ? TransactionType.FAILED
                : TransactionType.PENDING
          }
          modalType={ModalActionType.ADD_LIQUIDITY}
          close={(type) => {
            setShowTxModal(false);
            if (txHash && type === TransactionType.SUCCESS && onSuccess) {
              onSuccess();
            }
            onClose();
          }}
          usdcAmount={fromInt(usdcAmount, 6).toFixed(2)}
          transactionUrl={txHash && ARBISCAN_URL + txHash}
          error={error}
        />
      )}
    </div>
  );
}
