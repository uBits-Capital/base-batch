"use client";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import AddLiquidity from "./AddLiquidity";
import RemoveLiquidity from "./RemoveLiquidity";
import CollectFees from "../Modals/CollectFees";
import ClosePoolModal from "../Modals/ClosePool";
import ClaimableFees from "./ClaimableFees";
import Withdraw from "./Withdraw";
import { PositionData } from "@/hooks/position/usePositions";
import { useFiatValue } from "@/hooks/useFiatValue";
import { useSumOfFiatValues } from "@/hooks/useSumOfFiatValues";
import { REWARDS_MAX_FRACTION_DIGITS } from "@/constants";

export enum Actions {
  AddLiquidity = "Add Liquidity",
  RemoveLiquidity = "Remove Liquidity",
  CollectFees = "Collect Fees",
  CollectFeesUSDC = "Collect Fees USDC",
  ClosePool = "Close Pool",
  None = "None",
}

export type ActionSelectorProps = {
  positionData: PositionData<true>;
  onActionSuccess?: () => void;
  close?: () => void;
};

type DefaultProps = {
  onActionSelected(action: Actions): void;
  close?: () => void;
  positionData: PositionData<true>;
};

function Default({ onActionSelected, positionData, close }: DefaultProps) {
  const { address } = useAccount();

  const fiatAmount0 = useFiatValue(positionData?.token0, positionData?.amount0);
  const fiatAmount1 = useFiatValue(positionData?.token1, positionData?.amount1);
  const [, , totalAmount] = useSumOfFiatValues([], [fiatAmount0, fiatAmount1]);

  const fiatRewards0 = useFiatValue(
    positionData?.token0,
    positionData?.rewards0,
    REWARDS_MAX_FRACTION_DIGITS,
  );
  const fiatRewards1 = useFiatValue(
    positionData?.token1,
    positionData?.rewards1,
    REWARDS_MAX_FRACTION_DIGITS,
  );
  const [, , totalRewards] = useSumOfFiatValues(
    [],
    [fiatRewards0, fiatRewards1],
    REWARDS_MAX_FRACTION_DIGITS,
  );

  const hasNoLiquidity = useMemo(
    () => positionData?.amount0 === BigInt(0) && positionData?.amount1 === BigInt(0),
    [positionData],
  );

  if (!positionData) {
    return <div className="hidden md:flex sticky top-5 flex-col justify-center items-center flex-grow-0 flex-shrink-0 w-[516px] rounded-3xl bg-[#12131a] border border-[#273345] ">
      <div className="flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 h-[68px] px-8 py-6 border-t-0 border-r-0 border-b border-l-0 border-[#191d26]">
        <div className="flex justify-center items-center flex-grow relative">
          <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white">
            Select your position
          </p>
        </div>
      </div>
      <div className="flex justify-center items-start self-stretch flex-grow-0 flex-shrink-0 px-8 pt-6 pb-8">
        <div className="flex flex-col justify-center items-start flex-grow overflow-hidden gap-8">
          <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 gap-6">
            <div className="flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0">
              <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5">
                <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-400">
                  Select the position you want to manage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
  }

  return (
    <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-full md:w-[516px] h-full rounded-3xl bg-[#12131a] md:border md:border-[#273345]">
      <div className="flex justify-between items-center self-stretch flex-grow-0  flex-shrink-0 h-[68px] px-8 py-6 border-t-0 border-r-0 border-b border-l-0 border-[#191d26]">
        <div className="flex justify-between items-center flex-grow relative">
          <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white">
            {positionData?.featureSettings?.name}
          </p>
        </div>
        {close && <div className="flex items-center self-stretch flex-grow-0 flex-shrink-0 relative px-0 mr-[-20px]">
          <div
            className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5 p-2 rounded-[1000px] cursor-pointer"
            onClick={close}>
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
                d="M12.4864 4.22025C12.6817 4.02499 12.6817 3.70841 12.4864 3.51315C12.2912 3.31788 11.9746 3.31788 11.7793 3.51315L7.99954 7.29293L4.21976 3.51315C4.0245 3.31788 3.70792 3.31788 3.51266 3.51315C3.3174 3.70841 3.3174 4.02499 3.51266 4.22025L7.29244 8.00003L3.51266 11.7798C3.3174 11.9751 3.3174 12.2917 3.51266 12.4869C3.70792 12.6822 4.0245 12.6822 4.21976 12.4869L7.99954 8.70714L11.7793 12.4869C11.9746 12.6822 12.2912 12.6822 12.4864 12.4869C12.6817 12.2917 12.6817 11.9751 12.4864 11.7798L8.70665 8.00003L12.4864 4.22025Z"
                fill="#9CA3AF"
              />
            </svg>
          </div>
        </div>}
      </div>
      <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 px-8 pt-6 pb-8">
        <div className="flex w-[160px] md:w-full flex-col justify-start items-start flex-grow gap-3 md:gap-8">
          <ClaimableFees
            totalRewards={totalRewards}
            positionData={positionData}
            onActionSelected={onActionSelected}
          />
          <div className="flex flex-col justify-center items-center md:justify-start self-stretch flex-grow-0 flex-shrink-0 gap-6">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start self-stretch flex-grow-0 flex-shrink-0">
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
            <div className="flex flex-col md:flex-row justify-center items-center gap-6">
              <button
                className={`flex w-[200px] md:w-[150px] justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-1 px-4 py-3 rounded-[1000px] border ${!positionData?.closed ? "text-gray-600 bg-gray-50 border-gray-300" : "text-gray-500 bg-[#273345] border-gray-800"}  cursor-pointer`}
                onClick={() => onActionSelected(Actions.AddLiquidity)}
                disabled={positionData?.closed}
              >
                <svg
                  width={21}
                  height={20}
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-grow-0 flex-shrink-0 w-5 h-5 relative"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.697 9.99966C18.697 14.5268 15.0269 18.1968 10.4998 18.1968C5.97271 18.1968 2.30273 14.5268 2.30273 9.99966C2.30273 5.47253 5.97271 1.80255 10.4998 1.80255C15.0269 1.80255 18.697 5.47253 18.697 9.99966ZM10.5 5.49998C10.7761 5.49998 11 5.72384 11 5.99998V9.49998H14.5C14.7761 9.49998 15 9.72384 15 9.99998C15 10.2761 14.7761 10.5 14.5 10.5H11V14C11 14.2761 10.7761 14.5 10.5 14.5C10.2239 14.5 10 14.2761 10 14V10.5H6.5C6.22386 10.5 6 10.2761 6 9.99998C6 9.72384 6.22386 9.49998 6.5 9.49998H10V5.99998C10 5.72384 10.2239 5.49998 10.5 5.49998Z"
                    fill="#4B5563"
                  />
                </svg>
                <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-1 ">
                  <p className={`flex-grow-0 flex-shrink-0 text-base font-semibold text-left${!positionData?.closed ? "text-gray-600 " : "text-gray-500"}`}>
                    Increase
                  </p>
                </div>
              </button>
              <button
                className={`flex w-[200px] md:w-[130px] justify-center items-center flex-grow-0 flex-shrink-0 relative gap-1 px-4 py-3 rounded-[1000px] ${hasNoLiquidity ? "bg-[#efb8c8]/[0.05]" : " bg-[#efb8c8]/[0.16] cursor-pointer"}`}
                onClick={() => onActionSelected(Actions.RemoveLiquidity)}
                disabled={hasNoLiquidity}
              >
                <svg
                  width={21}
                  height={20}
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-grow-0 flex-shrink-0 w-5 h-5 relative"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.697 9.99966C18.697 14.5268 15.0269 18.1968 10.4998 18.1968C5.97271 18.1968 2.30273 14.5268 2.30273 9.99966C2.30273 5.47253 5.97271 1.80255 10.4998 1.80255C15.0269 1.80255 18.697 5.47253 18.697 9.99966ZM6.5 9.49998C6.22386 9.49998 6 9.72384 6 9.99998C6 10.2761 6.22386 10.5 6.5 10.5H14.5C14.7761 10.5 15 10.2761 15 9.99998C15 9.72384 14.7761 9.49998 14.5 9.49998H6.5Z"
                    fill={hasNoLiquidity ? "rgb(255 255 255 / 0.2)" : "white"}
                  />
                </svg>
                <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-1">
                  <p className={`flex-grow-0 flex-shrink-0 text-base font-semibold text-left ${hasNoLiquidity ? "text-white/[0.2]" : " text-white"}`}>
                    Remove
                  </p>
                </div>
              </button>
              {address === positionData?.operator && !positionData?.closed && (
                <div
                  className="flex w-[200px] md:w-[150px] justify-center items-center flex-grow-0 flex-shrink-0 relative opacity-[0.99] gap-1 px-4 py-3 rounded-[1000px] bg-[#eb1717] cursor-pointer"
                  onClick={() => onActionSelected(Actions.ClosePool)}
                >
                  <svg
                    width={21}
                    height={20}
                    viewBox="0 0 21 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-grow-0 flex-shrink-0 w-5 h-5 relative"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.4998 1.30276C5.69657 1.30276 1.80273 5.1966 1.80273 9.99987C1.80273 14.8031 5.69657 18.697 10.4998 18.697C15.3031 18.697 19.197 14.8031 19.197 9.99987C19.197 5.1966 15.3031 1.30276 10.4998 1.30276ZM5.42215 4.21507C6.77732 3.0246 8.55428 2.30276 10.4998 2.30276C14.7508 2.30276 18.197 5.74889 18.197 9.99987C18.197 11.9454 17.4751 13.7224 16.2846 15.0776L5.42215 4.21507ZM4.71504 4.92218C3.52457 6.27735 2.80273 8.05432 2.80273 9.99987C2.80273 14.2508 6.24886 17.697 10.4998 17.697C12.4454 17.697 14.2224 16.9751 15.5775 15.7847L4.71504 4.92218Z"
                      fill="#FFF1F1"
                    />
                  </svg>
                  <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-1">
                    <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left text-[#fff1f1]">
                      Close Pool
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActionSelector({
  positionData,
  onActionSuccess,
  close
}: ActionSelectorProps) {
  const [selectedAction, setSelectedAction] = useState<Actions>(Actions.None);
  const { address } = useAccount();

  if (address !== positionData?.operator && positionData?.closed) {
    return (
      <>
        <Withdraw
          positionData={positionData}
          onSuccess={() => {
            onActionSuccess && onActionSuccess();
            setSelectedAction(Actions.None);
          }}
          back={() => setSelectedAction(Actions.None)}
        />
      </>
    );
  }

  switch (selectedAction) {
    case Actions.AddLiquidity:
      return (
        <AddLiquidity
          back={() => setSelectedAction(Actions.None)}
          positionData={positionData}
          onSuccess={() => {
            onActionSuccess && onActionSuccess();
            setSelectedAction(Actions.None);
          }}
        />
      );
    case Actions.RemoveLiquidity:
      return (
        <RemoveLiquidity
          back={() => setSelectedAction(Actions.None)}
          positionData={positionData}
          onSuccess={() => {
            onActionSuccess && onActionSuccess();
            setSelectedAction(Actions.None);
          }}
        />
      );
    case Actions.CollectFees:
    case Actions.CollectFeesUSDC:
      return (
        <>
          <Default
            onActionSelected={setSelectedAction}
            positionData={positionData}
            close={close}
          />
          <CollectFees
            positionData={positionData}
            collectAllAsUSDC={selectedAction === Actions.CollectFeesUSDC}
            onClose={() => setSelectedAction(Actions.None)}
            onSuccess={() => onActionSuccess && onActionSuccess()}
          />
        </>
      );
    case Actions.ClosePool:
      return (
        <>
          <Default
            onActionSelected={setSelectedAction}
            positionData={positionData}
            close={close}
          />
          <ClosePoolModal
            positionData={positionData}
            onSuccess={() => onActionSuccess && onActionSuccess()}
            onClose={() => setSelectedAction(Actions.None)}
          />
        </>
      );
    case Actions.None:
      return (
        <Default
          onActionSelected={setSelectedAction}
          positionData={positionData}
          close={close}
        />
      );
  }
}
