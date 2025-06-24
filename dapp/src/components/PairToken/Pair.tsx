import { JointCoinImages, JointCoinImagesProps } from "./JointCoinImages";
import { Token } from "@/queries/generated/graphql";
import structuredTokens from "@/assets/coins/structured_tokens.json";
import { useMemo } from 'react';
import { isWETH } from '@/utils/smartcontract';

export type PairProps = JointCoinImagesProps & {
  token0: Pick<Token, "id" | "symbol">;
  token1: Pick<Token, "id" | "symbol">;
};

export const Pair = ({ token0, token1 }: PairProps) => {
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

  return (
    <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2 overflow-hidden ">
      <JointCoinImages token0={token0} token1={token1} />
      <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2 overflow-wrap-break-word ">
        <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-left text-white text-ellipsis ">
          {ticker0} / {ticker1}
        </p>
      </div>
    </div>
  );
};

export default Pair;
