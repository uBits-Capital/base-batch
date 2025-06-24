import { useCallback, useEffect, useMemo, useState } from "react";
import { getTopPools } from "@/app/actions/query/pool";
import { ApolloQueryResult } from "@apollo/client";
import { Token, TopPoolsQuery } from "@/queries/generated/graphql";
import { calculateOneDayApr } from "@/utils/math";
import { FeeAmount } from "@uniswap/v3-sdk";
import { BIPS_BASE } from "@/constants";

export type TopPool = {
  id: string;
  token0: Pick<Token, "id" | "name" | "symbol">;
  token1: Pick<Token, "id" | "name" | "symbol">;
  feeTier: FeeAmount;
  feeTierScaled: number;
  tvl: number;
  apr24hrs: number;
  volume24hrs: number;
};

export function filterPool(search?: string) {
  return (
    pool: Pick<TopPoolsQuery["pools"][0], "id"> & {
      token0: Pick<TopPoolsQuery["pools"][0]["token0"], "name">;
      token1: Pick<TopPoolsQuery["pools"][0]["token1"], "name">;
    },
  ) =>
    search?.length
      ? (pool.token0.name + pool.token1.name + pool.id)
        .toLowerCase()
        .includes(search.toLowerCase())
      : true;
}

export function useTopPools(token0?: string, token1?: string, search?: string) {
  const [query, setQuery] = useState<ApolloQueryResult<TopPoolsQuery>>();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    let ignore = false;

    setLoading(true);
    getTopPools(token0, token1).then((query) => !ignore && setQuery(query));

    return () => {
      ignore = true;
    };
  }, [token0, token1]);

  useEffect(() => refresh(), [refresh]);

  return useMemo(() => {
    if (!query?.data)
      return {
        data: undefined,
        loading,
        refresh,
      };

    // OR doesn't seem to work properly, so we have to manually filter the results.
    const pools = query.data.pools.filter(filterPool(search));

    const data: TopPool[] = pools.flatMap((pool) => {
      const oneDayApr = calculateOneDayApr(
        pool.poolDayData[0].volumeUSD,
        pool.totalValueLockedUSD,
        pool.feeTier,
      );

      return {
        id: pool.id,
        token0: pool.token0,
        token1: pool.token1,
        tvl: parseFloat(pool.totalValueLockedUSD),
        volume24hrs: parseFloat(
          pool.poolDayData[0].volumeUSD ?? pool.volumeUSD,
        ),
        apr24hrs: parseFloat(oneDayApr.toFixed(3)),
        feeTier: parseFloat(pool.feeTier),
        feeTierScaled: parseFloat(pool.feeTier) / BIPS_BASE,
      };
    });

    setLoading(false);
    return { data, loading: false, refresh };
  }, [query, loading, refresh, search]);
}
