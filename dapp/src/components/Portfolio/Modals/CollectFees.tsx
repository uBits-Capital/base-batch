import { useCallback, useEffect, useMemo, useState } from "react";
import TransactionModal, {
  ModalActionType,
  TransactionType,
} from "@/components/TransactionModal";
import { PositionData } from "@/hooks/position/usePositions";
import { useRewards } from "@/hooks/rewards/useRewards";
import { useFiatValue } from "@/hooks/useFiatValue";
import { useQuote } from "@/hooks/useQuote";
import { useSumOfFiatValues } from "@/hooks/useSumOfFiatValues";
import { ARBISCAN_URL, USDC_CONTRACT } from "@/config";
import { TokenPairAmount, TokenUSDCAmount } from "../tokenPairOrUSDC";

interface CollectFeesProps {
  collectAllAsUSDC: boolean;
  positionData: PositionData<true>;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CollectFees({
  onClose,
  onSuccess,
  positionData,
  collectAllAsUSDC,
}: CollectFeesProps) {
  const [disabled, setDisabled] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);

  const {
    collectFees,
    loading: loadingCollectFees,
    error,
    txHash,
  } = useRewards();
  const {
    quoteMaxAmountOut: quoteMaxAmountOut0,
    feeAmount: quoteFeeAmount0,
    amountOut: quoteAmount0Out,
    loading: quote0Loading,
  } = useQuote(positionData.fee);

  const {
    quoteMaxAmountOut: quoteMaxAmountOut1,
    feeAmount: quoteFeeAmount1,
    amountOut: quoteAmount1Out,
    loading: quote1Loading,
  } = useQuote(positionData.fee);

  const handleCollectFees = useCallback(
    async (forceSlippage?: boolean) => {
      setShowTxModal(true);
      await collectFees({
        forceSlippage,
        positionId: positionData.positionId,
        swap: {
          shouldSwapFees: collectAllAsUSDC,
          poolFeeTier0: quoteFeeAmount0,
          poolFeeTier1: quoteFeeAmount1,
          amount0OutMinimum: quoteAmount0Out,
          amount1OutMinimum: quoteAmount1Out,
        },
      });
    },
    [
      collectFees,
      collectAllAsUSDC,
      quoteAmount0Out,
      quoteAmount1Out,
      quoteFeeAmount0,
      quoteFeeAmount1,
      positionData.positionId,
    ],
  );

  const slippageCheckError = useMemo(() => {
    const _error = error?.toLocaleLowerCase();
    return (
      collectAllAsUSDC &&
      _error &&
      (_error.includes("price slippage check") ||
        _error.includes("swap failed: too little received"))
    );
  }, [error, collectAllAsUSDC]);

  const fiatRewards0 = useFiatValue(positionData.token0, positionData.rewards0);
  const fiatRewards1 = useFiatValue(positionData.token1, positionData.rewards1);
  const [, , totalRewards] = useSumOfFiatValues(
    [],
    [fiatRewards0, fiatRewards1],
  );

  useEffect(() => {
    if (!collectAllAsUSDC) return;
    const token0 = positionData.token0.id;
    const token1 = positionData.token1.id;
    const rewards0 = positionData.rewards0;
    const rewards1 = positionData.rewards1;
    if (token0 !== USDC_CONTRACT && rewards0 > 0) {
      quoteMaxAmountOut0(token0, USDC_CONTRACT, rewards0.toString()).then();
    }
    if (token1 !== USDC_CONTRACT && rewards1 > 0) {
      quoteMaxAmountOut1(token1, USDC_CONTRACT, rewards1.toString()).then();
    }
  }, [positionData, quoteMaxAmountOut0, quoteMaxAmountOut1, collectAllAsUSDC]);

  useEffect(() => {
    setDisabled(!(!loadingCollectFees && !quote0Loading && !quote1Loading));
  }, [loadingCollectFees, quote0Loading, quote1Loading]);

  useEffect(() => {
    if (slippageCheckError) {
      setShowTxModal(false);
    }
  }, [slippageCheckError]);

  return (
    <div
      className="absolute z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
      ></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0  gap-[9px] rounded-3xl bg-[#12131a] border border-[#273345]">
            <div className="flex flex-col justify-start items-start w-[320px] md:w-[445px] overflow-hidden rounded-2xl bg-[#12131a]">
              <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 relative p-6 border-t-0 border-r-0 border-b border-l-0 border-[#273345]">
                <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-8 h-8 gap-0.5 p-2 rounded-[1000px]" />
                <p className="flex-grow w-[333px] text-xl font-medium text-center text-white">
                  Collect fees
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
                {collectAllAsUSDC ? (
                  <TokenUSDCAmount amount={totalRewards} />
                ) : (
                  <TokenPairAmount positionData={positionData} />
                )}
                {error && slippageCheckError && (
                  <p className="flex-grow-0 flex-shrink-0 text-sm font-medium text-left text-[#9e3f3f]">
                    Price slippage check failed. Slippage higher than 0.5%.
                  </p>
                )}
                <div className="flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-1 px-4 py-3 rounded-[1000px] bg-gray-100">
                  {error && slippageCheckError ? (
                    <button
                      className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-1"
                      disabled={disabled}
                      onClick={() => handleCollectFees(true)}
                    >
                      <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left text-[#12131a]">
                        Collect Anyway
                      </p>
                    </button>
                  ) : (
                    <button
                      className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-1"
                      disabled={disabled}
                      onClick={() => handleCollectFees(false)}
                    >
                      <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left text-[#12131a]">
                        Collect
                      </p>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showTxModal && (
        <TransactionModal
          type={
            !!txHash
              ? TransactionType.SUCCESS
              : !!error
                ? TransactionType.FAILED
                : TransactionType.PENDING
          }
          modalType={ModalActionType.COLLECT_FEES}
          close={(type) => {
            setShowTxModal(false);
            if (txHash && type === TransactionType.SUCCESS && onSuccess) {
              onSuccess();
            }
            onClose();
          }}
          usdcAmount={collectAllAsUSDC ? totalRewards : undefined}
          transactionUrl={txHash && ARBISCAN_URL + txHash}
          error={error}
        />
      )}
    </div>
  );
}
