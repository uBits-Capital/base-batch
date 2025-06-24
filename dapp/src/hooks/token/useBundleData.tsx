import { useCallback, useEffect, useMemo, useState } from "react";
import { ApolloQueryResult } from "@apollo/client";
import { getBundleData } from "@/app/actions/query/token";
import { BundleDataQuery } from "@/queries/generated/graphql";
import { parseFixed } from "@ethersproject/bignumber";
import JSBI from "jsbi";
import { Fraction } from "@uniswap/sdk-core";
import { cache } from "@/utils/cache";
import { BUNDLE_DATA_CACHE_TIME } from "@/config";

export type BundleData = {
  id: number;
  ethPriceUSD: Fraction;
};

const BUNDLE_DATA_CACHE = cache<ApolloQueryResult<BundleDataQuery>>(
  BUNDLE_DATA_CACHE_TIME,
);

export function useBundleData() {
  const [query, setQuery] = useState<ApolloQueryResult<BundleDataQuery>>();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    let ignore = false;

    setLoading(true);
    if (BUNDLE_DATA_CACHE.valid()) setQuery(BUNDLE_DATA_CACHE.get());
    else
      getBundleData().then(
        (query) => !ignore && setQuery(BUNDLE_DATA_CACHE.set(query)),
      );

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => refresh(), [refresh]);

  return useMemo(() => {
    if (!query?.data?.bundle) return { data: undefined, loading, refresh };

    const ethPriceUSDString = query.data.bundle.ethPriceUSD as string;

    const ethPriceUSDDecimals = ethPriceUSDString.split(".")[1]?.length ?? 0;
    const ethPriceUSD = parseFixed(ethPriceUSDString, ethPriceUSDDecimals);

    const data: BundleData = {
      id: +query.data.bundle?.id,
      ethPriceUSD: new Fraction(
        JSBI.BigInt(ethPriceUSD),
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(ethPriceUSDDecimals)),
      ),
    };

    setLoading(false);
    return { data, loading: false, refresh };
  }, [loading, query, refresh]);
}
