import CoinImage from "../CoinImage";
import { Token } from "@/queries/generated/graphql";
import { useEffect, useMemo, useState } from "react";
import structuredTokens from "@/assets/coins/structured_tokens.json";

export type JointCoinImagesProps = {
  token0: Pick<Token, "id">;
  token1: Pick<Token, "id">;
};

export function JointCoinImages({ token0, token1 }: JointCoinImagesProps) {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    setTime(Date.now());
  }, [token0.id, token1.id]);

  const token0IconUrl = useMemo(
    () =>
      structuredTokens[token0?.id as keyof typeof structuredTokens]?.iconUrl,
    [token0, time],
  );
  const token1IconUrl = useMemo(
    () =>
      structuredTokens[token1?.id as keyof typeof structuredTokens]?.iconUrl,
    [token1, time],
  );

  return (
    <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 relative space-x-[-4px]">
      <CoinImage imagePath={token0IconUrl} />
      <CoinImage imagePath={token1IconUrl} />
    </div>
  );
}
