import { useState, useEffect, useMemo } from "react";
import { useAccount } from 'wagmi';
import { PositionData } from "@/hooks/position/usePositions";
import { useFiatValue } from "@/hooks/useFiatValue";
import { useSumOfFiatValues } from "@/hooks/useSumOfFiatValues";
import { useRemoveLiquidityState } from "@/hooks/liquidity/useRemoveLiquidityState";
import { fromInt } from "@/utils/math";
import RemoveLiquidityModal from "../Modals/RemoveLiquidity";
import { TokenPairAmount, TokenUSDCAmount } from "../tokenPairOrUSDC";

export type RemoveLiquidityProps = {
  positionData: PositionData<true>;
  onSuccess: () => void;
  back: () => void;
};

export default function RemoveLiquidity({
  positionData,
  onSuccess,
  back,
}: RemoveLiquidityProps) {
  const [showModal, setShowModal] = useState(false);
  const [collectAllInUSDC, setCollectAllInUSDC] = useState(true);

  const { address } = useAccount();

  const {
    percentageToRemove,
    setPercentageToRemove,
    amountToRemove0,
    amountToRemove1,
  } = useRemoveLiquidityState(positionData.amount0, positionData.amount1);

  const fiatAmountToRemove0 = useFiatValue(
    positionData.token0,
    BigInt(amountToRemove0.toString()),
  );
  const fiatAmount0 = useFiatValue(positionData.token0, positionData.amount0);

  const fiatAmountToRemove1 = useFiatValue(
    positionData.token1,
    BigInt(amountToRemove1.toString()),
  );
  const fiatAmount1 = useFiatValue(positionData.token1, positionData.amount1);

  const [totalAmountToRemove, newTotalAmount] = useSumOfFiatValues(
    [fiatAmountToRemove0, fiatAmountToRemove1],
    [fiatAmount0, fiatAmount1],
  );

  const fiatRewards0 = useFiatValue(positionData.token0, positionData.rewards0);
  const fiatRewards1 = useFiatValue(positionData.token1, positionData.rewards1);
  const [, , totalRewards] = useSumOfFiatValues(
    [],
    [fiatRewards0, fiatRewards1],
  );

  const closingPosition = useMemo(() => {
    return positionData?.operator === address && percentageToRemove > 50;
  }, [positionData, address, percentageToRemove]);

  useEffect(() => {
    if (closingPosition && percentageToRemove < 100) {
      setTimeout(() => {
        setPercentageToRemove(100);
      }, 150);
    }
  }, [closingPosition, percentageToRemove, setPercentageToRemove, setCollectAllInUSDC]);

  return (
    <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-[340px] md:w-[400px] min-h-[450px] md:h-full rounded-3xl bg-[#12131a] md:border md:border-[#273345]">
      <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 h-[58px] md:h-[68px] px-8 py-6 border-t-0 border-r-0 border-b border-l-0 border-[#191d26]">
        <div
          className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5 p-2 rounded-[1000px] cursor-pointer"
          onClick={back}
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
              d="M7.28672 3.37978C7.48199 3.57505 7.48199 3.89163 7.28672 4.08689L3.87361 7.5H13.3332C13.6093 7.5 13.8332 7.72386 13.8332 8C13.8332 8.27615 13.6093 8.5 13.3332 8.5H3.87361L7.28672 11.9131C7.48199 12.1084 7.48199 12.425 7.28672 12.6202C7.09146 12.8155 6.77488 12.8155 6.57962 12.6202L2.31295 8.35356C2.11769 8.1583 2.11769 7.84171 2.31295 7.64645L6.57962 3.37978C6.77488 3.18452 7.09146 3.18452 7.28672 3.37978Z"
              fill="#9CA3AF"
            />
          </svg>
        </div>
        <div className="flex justify-center items-center flex-grow relative gap-0.5 pr-4">
          <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white">
            {positionData.featureSettings.name}
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 h-[58px] mdh-[68px] px-8 py-6 border-t-0 border-r-0 border-b border-l-0 border-[#191d26]">
        <div className="flex justify-between items-center flex-grow relative">
          <p className="flex-grow-0 flex-shrink-0 text-xl md:text-3xl font-medium text-left text-white">
            Remove liquidity
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-6 px-6">
        <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 gap-2 p-6 rounded-2xl bg-[#191d26]">
          <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-6">
            <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 h-[150px] md:h-[200px] gap-1 md:gap-6">
              <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-1">
                <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-left text-white">
                  Amount to remove
                </p>
                <div className="flex justify-end items-center flex-grow-0 flex-shrink-0 h-9 relative gap-2">
                  <p className="flex-grow-0 flex-shrink-0 text-xl md:text-3xl font-medium text-left text-white">
                    {totalAmountToRemove}
                  </p>
                  <p className="flex-grow-0 flex-shrink-0 text-lg md:text-2xl text-left text-gray-400">
                    ({percentageToRemove}%)
                  </p>
                </div>
                {closingPosition && (<p className="flex-grow-0 flex-shrink-0 text-[12px] md:text-xs text-left text-red-400 py-1">
                  Your Position will be closed. If you want to keep your position, please remove less than 51%.
                </p>)}
              </div>
              <div className="flex flex-col justify-center items-start self-stretch flex-grow relative">
                <input
                  id="labels-range-input"
                  type="range"
                  value={percentageToRemove}
                  min="1"
                  max="100"
                  className="w-full range appearance-none h-2 md:h-3 bg-transparent slider rounded-lg 
                  cursor-pointer dark:bg-cyan-300
                    [&::-webkit-slider-runnable-track]:rounded-full 
                    [&::-webkit-slider-runnable-track]:bg-black/25 
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:h-5 
                    [&::-webkit-slider-thumb]:w-5 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-slate-50"
                  onChange={(value) => {
                    setPercentageToRemove(Number(value.target.value));
                  }}
                />
              </div>

              <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-1">
                <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-0.5 p-0.5 rounded-lg bg-[#191d26] border border-[#191d26]">
                  <div className="flex justify-center items-center flex-grow relative gap-1 px-2 py-1.5 rounded-md">
                    <p
                      className="flex-grow-0 flex-shrink-0 text-sm font-medium text-left text-gray-400 cursor-pointer"
                      onClick={() => setPercentageToRemove(25)}
                    >
                      25%
                    </p>
                  </div>
                  <div className="flex justify-center items-center flex-grow relative gap-1 px-2 py-1.5 rounded-md">
                    <p
                      className="flex-grow-0 flex-shrink-0 text-sm font-medium text-left text-gray-400 cursor-pointer"
                      onClick={() => setPercentageToRemove(50)}
                    >
                      50%
                    </p>
                  </div>
                  <div className="flex justify-center items-center flex-grow relative gap-1 px-2 py-1.5 rounded-md">
                    <p
                      className="flex-grow-0 flex-shrink-0 text-sm font-medium text-left text-gray-400 cursor-pointer"
                      onClick={() => setPercentageToRemove(75)}
                    >
                      75%
                    </p>
                  </div>
                  <div className="flex justify-center items-center flex-grow relative gap-1 px-2 py-1.5 rounded-md">
                    <p
                      className="flex-grow-0 flex-shrink-0 text-sm font-medium text-left text-gray-400 cursor-pointer"
                      onClick={() => setPercentageToRemove(100)}
                    >
                      Max
                    </p>
                  </div>
                </div>
                {totalRewards !== "$0" ? (
                  <p className="flex-grow-0 flex-shrink-0 text-xs text-left text-gray-300 mb-1 md:mb-2">
                    All fees earned ({totalRewards}) will be collected.
                  </p>
                ) : null}
              </div>
            </div>
            <svg 
              height={2}
              viewBox="0 0 344 2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="self-stretch flex-grow-0 flex-shrink-0 w-50 md:w-344"
              preserveAspectRatio="none"
            >
              <path d="M0 1H344" stroke="#273345" />
            </svg>
            <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 gap-1 md:gap-3">
              {collectAllInUSDC && !closingPosition ? (
                <TokenUSDCAmount amount={totalAmountToRemove} />
              ) : (
                <TokenPairAmount
                  positionData={positionData}
                  amount0={fromInt(
                    amountToRemove0,
                    positionData.token0.decimals,
                  )}
                  amount1={fromInt(
                    amountToRemove1,
                    positionData.token1.decimals,
                  )}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-2 py-3">
        <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
          <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 relative gap-1">
            <p className="flex-grow-0 flex-shrink-0 text-sm text-left text-gray-300">
              {collectAllInUSDC
                ? "Collect all as USDC"
                : "Collect as token pair"}
            </p>
          </div>
          <div
            className="cursor-pointer"
            onClick={() => {
              if (!closingPosition) { setCollectAllInUSDC(!collectAllInUSDC); }
            }}
          >
            {collectAllInUSDC && !closingPosition ? (
              <svg
                width={40}
                height={24}
                viewBox="0 0 40 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-grow-0 flex-shrink-0 w-10 h-6 relative"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 12C0 5.37258 5.37258 0 12 0H28C34.6274 0 40 5.37258 40 12C40 18.6274 34.6274 24 28 24H12C5.37258 24 0 18.6274 0 12Z"
                  fill="#64D5E4"
                />
                <circle cx={28} cy={12} r={8} fill="white" />
              </svg>
            ) : (
              <svg
                width={40}
                height={24}
                viewBox="0 0 40 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-grow-0 flex-shrink-0 w-10 h-6 relative"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 12C0 5.37258 5.37258 0 12 0H28C34.6274 0 40 5.37258 40 12C40 18.6274 34.6274 24 28 24H12C5.37258 24 0 18.6274 0 12Z"
                  fill="#3E4A5C"
                />
                <path
                  d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z"
                  fill="#F3F4F6"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 px-8 pt-3 pb-3 md:pb-8">
        <div className="flex flex-col justify-start items-center md:items-start flex-grow overflow-hidden gap-2">
          <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-1 pb-1 md:gap-6 md:pb-6">
            <div className="flex flex-col md:flex-row justify-between items-center med:items-start self-stretch flex-grow-0 flex-shrink-0">
              <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5">
                <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-300">
                  Your new position in this pool
                </p>
              </div>
              <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5">
                <p className="flex-grow-0 flex-shrink-0 text-sm font-medium text-right text-white">
                  {newTotalAmount}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center flex-grow-0 flex-shrink-0">
            <div
              className="flex justify-center items-center flex-grow gap-1 px-4 py-3 w-[200px] md:w-[320px]  h-[40px] md:h-[50px] rounded-[1000px] bg-gray-100 cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-1">
                <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left text-[#12131a]">
                  Remove (preview)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <RemoveLiquidityModal
          closingPosition={closingPosition}
          positionData={positionData}
          usdcAmount={totalAmountToRemove}
          removeAmount0={amountToRemove0}
          removeAmount1={amountToRemove1}
          percentage={percentageToRemove}
          showUsdc={collectAllInUSDC && !closingPosition}
          onClose={() => setShowModal(false)}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
