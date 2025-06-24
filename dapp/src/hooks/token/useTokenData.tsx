import { Fraction } from "@uniswap/sdk-core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getTokenData } from "@/app/actions/query/token";
import { TokenDataQuery } from "@/queries/generated/graphql";
import JSBI from "jsbi";
import { ApolloQueryResult } from "@apollo/client";
import { TOKEN_CACHE_TIME } from "@/config";
import { cache } from "@/utils/cache";
import { parseFixed } from "@ethersproject/bignumber";
import { isWETH } from '@/utils/smartcontract';

export type TokenData = {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  derivedETH: Fraction;
  useNative: boolean;
};

const TOKEN_DATA_CACHE =
  cache<ApolloQueryResult<TokenDataQuery>>(TOKEN_CACHE_TIME);

export function useTokenData(tokenId: string) {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<ApolloQueryResult<TokenDataQuery>>();

  const refresh = useCallback(() => {
    let ignore = false;

    setLoading(true);
    if (TOKEN_DATA_CACHE.valid(tokenId)) {
      setQuery(TOKEN_DATA_CACHE.get(tokenId));
    } else {
      getTokenData(tokenId).then(
        (query) => {
          !ignore && setQuery(TOKEN_DATA_CACHE.set(query, tokenId));
        },
      ).catch((e) => {
        console.error(e);
        setLoading(false);
      });
    }

    return () => {
      ignore = true;
    };
  }, [tokenId]);

  useEffect(() => refresh(), [refresh]);

  return useMemo(() => {
    if (!query?.data?.token) return { data: undefined, loading, refresh };

    const { token } = query.data;

    const derivedEthDecimals = token.derivedETH.split(".")[1]?.length ?? 0;
    const derivedEth = parseFixed(token.derivedETH, derivedEthDecimals);

    const data = {
      id: token.id,
      name: token.name,
      symbol: isWETH(token.id) ? "ETH" : token.symbol,
      decimals: +token.decimals,
      derivedETH: new Fraction(
        JSBI.BigInt(derivedEth),
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(derivedEthDecimals)),
      ),
      useNative: isWETH(token.id),
    } satisfies TokenData;

    setLoading(false);
    return { data, loading: false, refresh };
  }, [query, loading, refresh]);
}
