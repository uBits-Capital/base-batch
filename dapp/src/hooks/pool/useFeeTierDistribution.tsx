import { getFeeTierDistribution } from "@/app/actions/query/pool";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FeeAmount } from "@uniswap/v3-sdk";
import { ApolloQueryResult } from "@apollo/client";
import { FeeTierDistributionQuery } from "@/queries/generated/graphql";

export type FeeTierDistribution = {
  [FeeAmount.LOWEST]: number | undefined;
  [FeeAmount.LOW]: number | undefined;
  [FeeAmount.LOW_200]: number | undefined;
  [FeeAmount.LOW_300]: number | undefined;
  [FeeAmount.LOW_400]: number | undefined;
  [FeeAmount.MEDIUM]: number | undefined;
  [FeeAmount.HIGH]: number | undefined;
};

export function useFeeTierDistribution(token0ID: string, token1ID: string) {
  const [query, setQuery] =
    useState<ApolloQueryResult<FeeTierDistributionQuery>>();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    let ignore = false;

    setLoading(true);
    getFeeTierDistribution(token0ID, token1ID).then(
      (query) => !ignore && setQuery(query),
    );

    return () => {
      ignore = true;
    };
  }, [token0ID, token1ID]);

  useEffect(() => refresh(), [refresh]);

  return useMemo(() => {
    if (!query?.data)
      return {
        data: undefined,
        loading,
        refresh,
      };

    const { data } = query;

    const tvlByFeeTier = [...data.asToken0, ...data.asToken1].reduce(
      (acc, value) => {
        if (!value.feeTier) {
          return acc;
        }
        acc[value.feeTier as FeeAmount][0] =
          (acc[value.feeTier as FeeAmount][0] ?? 0) +
          Number(value.totalValueLockedToken0);
        acc[value.feeTier as FeeAmount][1] =
          (acc[value.feeTier as FeeAmount][1] ?? 0) +
          Number(value.totalValueLockedToken1);
        return acc;
      },
      {
        [FeeAmount.LOWEST]: [undefined, undefined],
        [FeeAmount.LOW]: [undefined, undefined],
        [FeeAmount.MEDIUM]: [undefined, undefined],
        [FeeAmount.HIGH]: [undefined, undefined],
      } as Record<FeeAmount, [number | undefined, number | undefined]>,
    );

    // sum total tvl for token0 and token1
    const [sumToken0Tvl, sumToken1Tvl] = Object.values(tvlByFeeTier).reduce(
      (acc: [number, number], value) => {
        acc[0] += value[0] ?? 0;
        acc[1] += value[1] ?? 0;
        return acc;
      },
      [0, 0],
    );

    // returns undefined if both tvl0 and tvl1 are undefined (pool not created)
    const mean = (
      tvl0: number | undefined,
      sumTvl0: number,
      tvl1: number | undefined,
      sumTvl1: number,
    ) =>
      tvl0 === undefined && tvl1 === undefined
        ? undefined
        : ((tvl0 ?? 0) + (tvl1 ?? 0)) / (sumTvl0 + sumTvl1) || 0;

    const distributions: FeeTierDistribution = {
      [FeeAmount.LOWEST]: mean(
        tvlByFeeTier[FeeAmount.LOWEST][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.LOWEST][1],
        sumToken1Tvl,
      ),
      [FeeAmount.LOW]: mean(
        tvlByFeeTier[FeeAmount.LOW][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.LOW][1],
        sumToken1Tvl,
      ),
      [FeeAmount.LOW_200]: mean(
        tvlByFeeTier[FeeAmount.LOW][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.LOW][1],
        sumToken1Tvl,
      ),
      [FeeAmount.LOW_300]: mean(
        tvlByFeeTier[FeeAmount.LOW][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.LOW][1],
        sumToken1Tvl,
      ),
      [FeeAmount.LOW_400]: mean(
        tvlByFeeTier[FeeAmount.LOW][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.LOW][1],
        sumToken1Tvl,
      ),
      [FeeAmount.MEDIUM]: mean(
        tvlByFeeTier[FeeAmount.MEDIUM][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.MEDIUM][1],
        sumToken1Tvl,
      ),
      [FeeAmount.HIGH]: mean(
        tvlByFeeTier[FeeAmount.HIGH][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.HIGH][1],
        sumToken1Tvl,
      ),
    };

    setLoading(false);
    return { data: distributions, loading: false, refresh };
  }, [query, loading, refresh]);
}
