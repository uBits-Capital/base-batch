import { useClosePosition } from "@/hooks/position/useClosePosition";
import { PositionData } from "@/hooks/position/usePositions";
import TransactionModal, {
  ModalActionType,
  TransactionType,
} from "@/components/TransactionModal";
import { fromInt } from "@/utils/math";
import { useState } from "react";
import { ARBISCAN_URL } from "@/config";
import { TokenImage } from "@/components/TokenImage";
import { isWETH } from '@/utils/smartcontract';

interface ClosePoolProps {
  positionData: PositionData<true>;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClosePool({
  positionData,
  onClose,
  onSuccess,
}: ClosePoolProps) {
  const [showTxModal, setShowTxModal] = useState(false);

  const { closePosition, error, loading, txHash } = useClosePosition();

  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {!showTxModal && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        >
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="flex flex-col justify-start items-start w-[445px] overflow-hidden rounded-2xl bg-[#12131a]">
                <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 relative p-6 border-t-0 border-r-0 border-b border-l-0 border-[#273345]">
                  <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-8 h-8 gap-0.5 p-2 rounded-[1000px]" />
                  <p className="flex-grow w-[333px] text-xl font-medium text-center text-white">
                    Close Pool
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
                <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-4">
                  <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-2 px-8 py-2">
                    <p className="flex-grow-0 flex-shrink-0 text-lg font-medium text-left text-white">
                      You are about to close your position!
                    </p>
                    <p className="self-stretch flex-grow-0 flex-shrink-0 md:w-[381px] text-sm text-center text-[#ff9500]">
                      When you proceed, all of yours and investors&apos; funds
                      will be removed, as well as all collected fees, and will
                      be available for each one to claim.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-5 px-6 pt-3 pb-6">
                  <p className="flex-grow-0 flex-shrink-0 text-sm font-medium text-left text-white/50"></p>
                  <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-[460px] h-1 absolute left-8 top-[83px] rounded-[5px]" />
                  <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 gap-4 p-6 rounded-2xl bg-[#191d26]">
                    <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 gap-3">
                      <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 relative">
                        <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
                          <TokenImage token={positionData.token0} />
                          <p className="flex-grow-0 flex-shrink-0 text-sm text-left text-gray-300">
                            {isWETH(positionData.token0.id) ? "ETH" : positionData.token0.symbol}
                          </p>
                        </div>
                        <p className="flex-grow-0 flex-shrink-0 text-sm font-medium text-left text-white">
                          {fromInt(
                            positionData.amount0,
                            positionData.token0.decimals,
                          ).toString()}
                        </p>
                      </div>
                      <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 relative">
                        <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
                          <TokenImage token={positionData.token1} />
                          <p className="flex-grow-0 flex-shrink-0 text-sm text-left text-gray-300">
                            {isWETH(positionData.token1.id) ? "ETH" : positionData.token1.symbol}{" "}
                          </p>
                        </div>
                        <p className="flex-grow-0 flex-shrink-0 text-sm font-medium text-left text-white">
                          {fromInt(
                            positionData.amount1,
                            positionData.token1.decimals,
                          ).toString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-1 px-4 py-3 rounded-[1000px] bg-[#a31111]">
                    {" "}
                    <button
                      className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-1"
                      disabled={loading}
                      onClick={() => {
                        setShowTxModal(true);
                        closePosition({ positionData });
                      }}
                    >
                      <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left ">
                        Close Pool
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showTxModal && (
        <TransactionModal
          type={
            !!txHash
              ? TransactionType.SUCCESS
              : !!error
                ? TransactionType.FAILED
                : TransactionType.PENDING
          }
          modalType={ModalActionType.CLOSE_POSITION}
          close={(type) => {
            setShowTxModal(false);
            if (txHash && type === TransactionType.SUCCESS && onSuccess) {
              onSuccess();
            }
            onClose();
          }}
          transactionUrl={txHash && ARBISCAN_URL + txHash}
        />
      )}
    </div>
  );
}
