import { useCallback, useEffect, useMemo, useState } from "react";
import { getPoolData } from "@/app/actions/query/pool";
import { CHAIN_ID } from "@/config";
import { ApolloQueryResult } from "@apollo/client";
import { PoolDataQuery } from "@/queries/generated/graphql";
import { FeeAmount } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import { Fraction, Token, WETH9 } from "@uniswap/sdk-core";
import { parseFixed } from "@ethersproject/bignumber";
import { BIPS_BASE } from "@/constants";
import { TokenData } from "@/hooks/token/useTokenData";
import { isWETH } from "@/utils/smartcontract";
import { getSlot0 } from '@/app/actions/smartcontract/uniswapv3pool';


export type PoolData = {
  id: string;
  token0: TokenData;
  token1: TokenData;
  feeTier: FeeAmount;
  feeTierScaled: number;
  sqrtPrice: JSBI;
  liquidity: number;
};

export function parseTokenDataToCurrency(token: TokenData) {
  return new Token(
    CHAIN_ID,
    token.id as string,
    +token.decimals,
    token.symbol,
    token.name,
  );
}

export function usePoolData(
  token0ID: string,
  token1ID: string,
  feeTier: string,
) {
  const [query, setQuery] = useState<ApolloQueryResult<PoolDataQuery>>();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    let ignore = false;

    setLoading(true);
    getPoolData(token0ID, token1ID, +feeTier).then(
      async (query) => {
        if(!ignore) {
          const pool = query?.data?.pool[0];
          if (pool) {
            const slot0 = await getSlot0(pool.id);
            pool.sqrtPrice = slot0.sqrtPriceX96;
            query = { ...query, data: { pool: [pool] } };
          }
         setQuery(query);
        }
      },
    ).catch((e) => {
      console.error(e);
      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [feeTier, token0ID, token1ID]);

  useEffect(() => refresh(), [refresh]);

  return useMemo(() => {
    if (!query?.data?.pool?.[0]) return { data: undefined, loading, refresh };

    const data = query.data.pool[0];

    const derivedEthToken0Decimals =
      (data.token0.derivedETH as string).split(".")[1]?.length ?? 0;
    const derivedEthToken0Amount = parseFixed(
      data.token0.derivedETH,
      derivedEthToken0Decimals,
    );

    const derivedEthToken1Decimals =
      (data.token1.derivedETH as string).split(".")[1]?.length ?? 0;
    const derivedEthToken1Amount = parseFixed(
      data.token1.derivedETH,
      derivedEthToken1Decimals,
    );

    const poolData: PoolData = {
      id: data.id,
      token0: {
        symbol: isWETH(data.token0.id)? "ETH" : data.token0.symbol,
        id: data.token0.id,
        decimals: +data.token0.decimals,
        name: data.token0.name,
        derivedETH: new Fraction(
          JSBI.BigInt(derivedEthToken0Amount),
          JSBI.exponentiate(
            JSBI.BigInt(10),
            JSBI.BigInt(derivedEthToken0Decimals),
          ),
        ),
        useNative: isWETH(data.token0.id),
      },
      token1: { 
        symbol: isWETH(data.token1.id)? "ETH" : data.token1.symbol,
        id: data.token1.id,
        decimals: +data.token1.decimals,
        name: data.token1.name,
        derivedETH: new Fraction(
          JSBI.BigInt(derivedEthToken1Amount),
          JSBI.exponentiate(
            JSBI.BigInt(10),
            JSBI.BigInt(derivedEthToken1Decimals),
          ),
        ),
        useNative: isWETH(data.token1.id),
      },
      feeTier: parseFloat(data.feeTier),
      feeTierScaled: parseFloat(data.feeTier) / BIPS_BASE,
      sqrtPrice: JSBI.BigInt(data.sqrtPrice.toString()),
      liquidity: +data.liquidity,
    };

    setLoading(false);
    return { data: poolData, loading: false, refresh };
  }, [query, refresh, loading]);
}
