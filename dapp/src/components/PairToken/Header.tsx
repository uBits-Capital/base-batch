import { JointCoinImages } from "./JointCoinImages";
import CoinImage from "../CoinImage";
import { useFeeTierDistribution } from "@/hooks/pool/useFeeTierDistribution";
import { Token } from "@/queries/generated/graphql";
import { FeeAmount } from "@uniswap/v3-sdk";
import structuredTokens from "@/assets/coins/structured_tokens.json";

import { TokenData } from "@/hooks/token/useTokenData";
import { useMemo } from 'react';
import { isWETH } from '@/utils/smartcontract';

export type HeaderProps = {
  poolName?: string;
  token0: TokenData | Token;
  token1: TokenData | Token;
  feeTierScaled: string | number;
  onChangeSelected?: () => void;
} & (
    | {
      feeTier: FeeAmount;
      performanceFee?: never;
    }
    | {
      performanceFee: string | number;
      feeTier?: never;
    }
  );

export default function Header({
  poolName,
  token0,
  token1,
  feeTierScaled,
  onChangeSelected,
  performanceFee,
  feeTier,
}: HeaderProps) {
  const { data: distributions } = useFeeTierDistribution(token0.id, token1.id);

  const ticker0 = useMemo(
    () => {
      const symbol = structuredTokens[token0?.id as keyof typeof structuredTokens]?.ticker ?? token0.symbol;
      return isWETH(token0?.id) ? "ETH" : symbol;
    },
    [token0],
  );
  const ticker1 = useMemo(
    () => {
      const symbol = structuredTokens[token1?.id as keyof typeof structuredTokens]?.ticker ?? token1.symbol;
      return isWETH(token1?.id) ? "ETH" : symbol;
    },
    [token1],
  );

  return (<div className="flex-col items-start self-stretch flex-grow-0 flex-shrink-0 rounded-3xl bg-[#12131a] border border-[#273345]">
    {poolName && <div className="text-left text-white text-2xl px-8  pt-3">
      {poolName}
    </div>}
    <div className="flex justify-start md:justify-between items-center self-stretch flex-grow-0 flex-shrink-0 px-8 py-5">

      <div className="flex  flex-col md:flex-row justify-start items-start md:items-center flex-grow-0 flex-shrink-0 gap-3">
        <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 relative space-x-[-3px] gap-3">
          <JointCoinImages token0={token0} token1={token1} />
          <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white">
            To {ticker0} / {ticker1} Pool
          </p>
          <CoinImage imagePath="https://arbiscan.io/token/images/arbitrumone2_32_new.png" />
        </div>

        <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-4">
          <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 gap-5">
            <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 gap-0.5 p-1 rounded-md bg-[#273345]">
              <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-0.5">
                <p className="flex-grow-0 flex-shrink-0 text-xs text-left text-gray-100">
                  {`${feeTierScaled}% fee tier`}
                </p>
              </div>
            </div>
            <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 gap-0.5 p-1 rounded-md bg-[#273345]">
              <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-0.5">
                <p className="flex-grow-0 flex-shrink-0 text-xs text-left text-gray-100">
                  {feeTier
                    ? `${distributions && distributions[feeTier] ? (distributions[feeTier] * 100).toFixed(0) : 0}% select`
                    : `${performanceFee}% performance fee`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {onChangeSelected && (
        <div
          className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5  ml-5 px-3 py-2 rounded-[1000px] bg-[#191d26] border border-[#273345] cursor-pointer"
          onClick={onChangeSelected}
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
              d="M11.2001 2.1333L13.8667 4.79997M13.8667 4.79997L11.2001 7.46663M13.8667 4.79997H2.1333"
              stroke="#9CA3AF"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.1333 11.1999L4.79997 8.5332M2.1333 11.1999L4.79997 13.8665M2.1333 11.1999H13.8666"
              stroke="#9CA3AF"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-2.5 px-0.5">
            <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-left text-gray-300">
              Change
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
