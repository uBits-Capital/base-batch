"use client";
import { useMemo, useState } from "react";

import { PositionData } from "@/hooks/position/usePositions";
import { Actions } from ".";
import { TokenPairAmount, TokenUSDCAmount } from "../tokenPairOrUSDC";

type DefaultProps = {
  onActionSelected(action: Actions): void;
  positionData: PositionData<true>;
  totalRewards: string;
};

export default function ClaimableFees({
  onActionSelected,
  positionData,
  totalRewards,
}: DefaultProps) {
  const [collectFeesInUSDC, setCollectFeesInUSDC] = useState(true);

  const hasRewards = useMemo(() => {
    return positionData?.rewards0 > 0 || positionData?.rewards1 > 0;
  }, [positionData]);

  return (
    <>
      <div className="flex flex-col  w-full justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-6">
        <div className="flex  flex-col  items-start self-stretch flex-grow-0 flex-shrink-0">
          <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5 mb-2">
            <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-400">
              Your Claimable fees
            </p>
          </div>
          {collectFeesInUSDC ? (
            <TokenUSDCAmount amount={totalRewards} />
          ) : (
            <TokenPairAmount positionData={positionData} />
          )}
          <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-2 py-3">
            <div
              className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2 cursor-pointer"
              onClick={() => setCollectFeesInUSDC(!collectFeesInUSDC)}
            >
              <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 relative gap-1">
                <p className="flex-grow-0 flex-shrink-0 text-sm text-left text-gray-300">
                  {!collectFeesInUSDC
                    ? "Collect as token pair"
                    : "Collect all as USDC"}
                </p>
              </div>
              {!collectFeesInUSDC ? (
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
      </div>
      <div className="flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-3">
        <button
          className={`flex justify-center items-center flex-grow-0 flex-shrink-0 w-[376px] gap-6 cursor-pointer totalAmount`}
          onClick={() =>
            onActionSelected(
              !collectFeesInUSDC
                ? Actions.CollectFees
                : Actions.CollectFeesUSDC,
            )
          }
          disabled={!hasRewards}
        >
          <div
            className={`flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-1 px-4 py-3 rounded-[1000px]  ${hasRewards ? "text-[#12131A] bg-white" : "text-gray-500 bg-[#273345]"}`}
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
              <g clipPath="url(#clip0_131_21127)">
                <path
                  d="M11.4334 4.9993C11.4334 6.10403 9.13514 6.99958 6.30008 6.99958C3.46502 6.99958 1.16675 6.10403 1.16675 4.9993M11.4334 4.9993C11.4334 3.89458 9.13514 2.99902 6.30008 2.99902C3.46502 2.99902 1.16675 3.89458 1.16675 4.9993M11.4334 4.9993V9.45707C10.2933 9.82396 9.56675 10.379 9.56675 11.0001M1.16675 4.9993V13.0004C1.16675 14.1051 3.46502 15.0007 6.30008 15.0007C7.54107 15.0007 8.6792 14.8291 9.56675 14.5435M1.16675 8.99986C1.16675 10.1046 3.46502 11.0001 6.30008 11.0001C7.54107 11.0001 8.6792 10.8285 9.56675 10.5429M19.8334 11.0001C19.8334 12.1049 17.5351 13.0004 14.7001 13.0004C11.865 13.0004 9.56675 12.1049 9.56675 11.0001M19.8334 11.0001C19.8334 9.89542 17.5351 8.99986 14.7001 8.99986C11.865 8.99986 9.56675 9.89542 9.56675 11.0001M19.8334 11.0001V15.0007C19.8334 16.1054 17.5351 17.001 14.7001 17.001C11.865 17.001 9.56675 16.1054 9.56675 15.0007V11.0001"
                  stroke="#191D26"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_131_21127">
                  <rect
                    width={20}
                    height={20}
                    fill="white"
                    transform="translate(0.5)"
                  />
                </clipPath>
              </defs>
            </svg>
            <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-1">
              <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left text-[#12131a]">
                Collect fees
              </p>
            </div>
          </div>
        </button>
      </div>
    </>
  );
}
