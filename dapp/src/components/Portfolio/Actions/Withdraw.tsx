import { useMemo, useState } from "react";
import { PositionData } from "@/hooks/position/usePositions";
import { useFiatValue } from "@/hooks/useFiatValue";
import { useSumOfFiatValues } from "@/hooks/useSumOfFiatValues";
import WithdrawModal from "../Modals/Withdraw";
import { fromInt } from "@/utils/math";
import { TokenPairAmount, TokenUSDCAmount } from "../tokenPairOrUSDC";

export type RemoveLiquidityProps = {
  positionData: PositionData<true>;
  onSuccess: () => void;
  back: () => void;
};

export const WithdrawContent = ({
  totalRewards,
  totalAmount,
}: {
  totalRewards: string;
  totalAmount: string;
}) => {
  return (
    <>
      <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-6">
        <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0">
          <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5">
            <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-400">
              Your Claimable fees
            </p>
          </div>
          <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5">
            <p className="flex-grow-0 flex-shrink-0 text-xl font-medium text-right text-white">
              {totalRewards}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-6">
        <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0">
          <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5">
            <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-300">
              Your position in this pool
            </p>
          </div>
          <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5">
            <p className="flex-grow-0 flex-shrink-0 text-xl font-medium text-right text-white">
              {totalAmount}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default function Withdraw({
  positionData,
  onSuccess,
  back,
}: RemoveLiquidityProps) {
  const [showModal, setShowModal] = useState(false);
  const [collectAllInUSDC, setCollectAllInUSDC] = useState(true);

  const fiatAmount0 = useFiatValue(positionData.token0, positionData.amount0);
  const fiatAmount1 = useFiatValue(positionData.token1, positionData.amount1);

  const [, totalAmount] = useSumOfFiatValues([], [fiatAmount0, fiatAmount1]);

  const fiatRewards0 = useFiatValue(positionData.token0, positionData.rewards0);
  const fiatRewards1 = useFiatValue(positionData.token1, positionData.rewards1);
  const [, , totalRewards] = useSumOfFiatValues(
    [],
    [fiatRewards0, fiatRewards1],
  );

  const [, , totalFiatPlusRewards] = useSumOfFiatValues(
    [],
    [fiatAmount0, fiatAmount1, fiatRewards0, fiatRewards1],
  );

  const hasNoLiquidity = useMemo(
    () => positionData.amount0 === BigInt(0) && positionData.amount1 === BigInt(0),
    [positionData],
  );

  return (
    <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-[516px] rounded-3xl bg-[#12131a] border border-[#273345]">
      <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-[217px] px-8 py-6 border-t-0 border-r-0 border-b border-l-0 border-[#191d26]">
        <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-2">
          <p className="self-stretch flex-grow-0 flex-shrink-0 w-[452px] text-base font-medium text-center text-white">
            {positionData.featureSettings.name}
          </p>
          {!hasNoLiquidity && <p className="self-stretch flex-grow-0 flex-shrink-0 w-[452px] text-sm text-center text-gray-400">
            The position you were providing liquidity for has been closed. Click
            Withdraw to receive your collected fees and funds.
          </p>}
          {hasNoLiquidity && <p className="self-stretch flex-grow-0 flex-shrink-0 w-[452px] text-sm text-center text-gray-400">
            The position you were providing liquidity for has been closed.
          </p>}
        </div>
      </div>
      <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 px-8 pt-6 pb-8">
        <div className="flex flex-col justify-start items-start flex-grow overflow-hidden gap-8">
          <WithdrawContent
            totalRewards={totalRewards}
            totalAmount={totalAmount}
          />
          <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 gap-3">
            {collectAllInUSDC ? (
              <TokenUSDCAmount amount={totalFiatPlusRewards} />
            ) : (
              <TokenPairAmount
                positionData={positionData}
                amount0={fromInt(
                  positionData.amount0 + positionData.rewards0,
                  positionData.token0.decimals,
                )}
                amount1={fromInt(
                  positionData.amount1 + positionData.rewards1,
                  positionData.token1.decimals,
                )}
              />
            )}
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
                  setCollectAllInUSDC(!collectAllInUSDC);
                }}
              >
                {collectAllInUSDC ? (
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
          {!hasNoLiquidity && <button
            className="flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-1 px-4 py-3 rounded-[1000px] bg-gray-50"
            onClick={() => setShowModal(true)}
          >
            <svg
              width={20}
              height={20}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-grow-0 flex-shrink-0 w-5 h-5 relative"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.197 9.9996C18.197 14.5267 14.5269 18.1967 9.99984 18.1967C5.47271 18.1967 1.80273 14.5267 1.80273 9.9996C1.80273 5.47247 5.47271 1.80249 9.99984 1.80249C14.5269 1.80249 18.197 5.47247 18.197 9.9996ZM6 9.49992C5.72386 9.49992 5.5 9.72378 5.5 9.99992C5.5 10.2761 5.72386 10.4999 6 10.4999H14C14.2761 10.4999 14.5 10.2761 14.5 9.99992C14.5 9.72378 14.2761 9.49992 14 9.49992H6Z"
                fill="#4B5563"
              />
            </svg>
            <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-1">
              <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left text-gray-600">
                Withdraw
              </p>
            </div>
          </button>}
        </div>
      </div>
      {showModal && (
        <WithdrawModal
          positionData={positionData}
          totalAmount={totalAmount}
          totalRewards={totalRewards}
          totalFiatPlusRewards={totalFiatPlusRewards}
          collectAllAsUSDC={collectAllInUSDC}
          onSuccess={onSuccess}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
