import CoinImage from "./CoinImage";
import { Token } from "@/queries/generated/graphql";
import { useMemo } from "react";
import structuredTokens from "@/assets/coins/structured_tokens.json";

export type TokenImageProps = {
  token: Pick<Token, "id">;
};

export function TokenImage({ token }: TokenImageProps) {
  const tokenIconUrl = useMemo(
    () => structuredTokens[token?.id as keyof typeof structuredTokens]?.iconUrl,
    [token],
  );

  return <CoinImage imagePath={tokenIconUrl} />;
}
