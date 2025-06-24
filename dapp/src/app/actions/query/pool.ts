"use server";

import {
  FEE_TIER_DISTRIBUTION_QUERY,
  POOL_DATA_QUERY,
  TOP_POOLS_QUERY,
} from "@/queries/pools";
import { query } from "@/apollo";
import { SERVER_ENV } from "@/config";
import { ApolloQueryResult, NetworkStatus } from "@apollo/client";
import { PoolDataQuery, TopPoolsQuery } from "@/queries/generated/graphql";
import {
  getSlot0,
  getLiquidity,
  getTokenBalanceOf,
  getTokenDecimals,
} from "../smartcontract/uniswapv3pool";

import JSBI from "jsbi";
import { fromInt } from "@/utils/math";
import { cache } from "@/utils/cache";

const TOKEN_DECIMALS_CACHE = cache<number>(100_000); // 100s == 100_000ms
const RESULT_CACHE = cache<string>(30_000); //  30s == 30_000ms
const RESULT_KEY = "MOCKED_POOLS";

const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));

const calcDerivedETHAndTVLAndLiquidity = async (
  poolAddress: `0x${string}`,
  token0: `0x${string}`,
  token1: `0x${string}`
) => {
  let decimals0;
  if (TOKEN_DECIMALS_CACHE.valid(token0)) {
    decimals0 = TOKEN_DECIMALS_CACHE.get(token0);
  } else {
    decimals0 = await getTokenDecimals(token0);
    TOKEN_DECIMALS_CACHE.set(decimals0, token0);
  }
  let decimals1;
  if (TOKEN_DECIMALS_CACHE.valid(token1)) {
    decimals1 = TOKEN_DECIMALS_CACHE.get(token1);
  } else {
    decimals1 = await getTokenDecimals(token1);
    TOKEN_DECIMALS_CACHE.set(decimals1, token1);
  }

  const [slot0, liquidity, balance0Int, balance1Int] = await Promise.all([
    getSlot0(poolAddress),
    getLiquidity(poolAddress),
    getTokenBalanceOf(poolAddress, token0),
    getTokenBalanceOf(poolAddress, token1),
  ]);

  const diff =
    decimals0 > decimals1 ? decimals0 - decimals1 : decimals1 - decimals0;

  const sqrtPriceX96 = JSBI.BigInt(slot0.sqrtPriceX96.toString());
  const _10xxDiff = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(diff));

  let totalValueLockedUSD;
  let token0DerivedETH;
  const division = Number(JSBI.divide(sqrtPriceX96, Q96).toString());
  const balance0 = fromInt(balance0Int, decimals0);
  const balance1 = fromInt(balance1Int, decimals1);
  if (division > 0) {
    token0DerivedETH =
      Number(
        JSBI.exponentiate(
          JSBI.divide(sqrtPriceX96, Q96),
          JSBI.BigInt(2)
        ).toString()
      ) / Number(_10xxDiff.toString());
    totalValueLockedUSD = balance0 + (1 / token0DerivedETH) * balance1;
  } else {
    token0DerivedETH =
      Number(
        JSBI.exponentiate(
          JSBI.divide(Q96, sqrtPriceX96),
          JSBI.BigInt(2)
        ).toString()
      ) / Number(_10xxDiff.toString());
    totalValueLockedUSD = balance1 + (1 / token0DerivedETH) * balance0;
  }

  return {
    sqrtPriceX96,
    token0DerivedETH,
    totalValueLockedUSD,
    liquidity,
  };
};

export async function getMockedPools(): Promise<
  PoolDataQuery["pool"] & TopPoolsQuery["pools"]
> {
  if (RESULT_CACHE.valid(RESULT_KEY)) {
    const _cache = RESULT_CACHE.get(RESULT_KEY);

    return JSON.parse(_cache);
  } else {
    const [result1, result2, result3, result4] = await Promise.all([
      calcDerivedETHAndTVLAndLiquidity(
        "0x6abDB70A0146C70E698C395767Cf8fabABf8F799",
        "0x0273Eac50c2dd47B36B0A0010346A6e5400a3A3d",
        "0x0De53086Fb403346a874655e1819053DD792b99e"
      ),
      calcDerivedETHAndTVLAndLiquidity(
        "0xFd0ae9172770aEC6d74a896FeE4c70b08d90BCfa",
        "0x0De53086Fb403346a874655e1819053DD792b99e",
        "0xa6bB624c7068751AD59AE0C88980851A2ffFe6Ca"
      ),
      calcDerivedETHAndTVLAndLiquidity(
        "0xab18715EdDB880C22a675fAf7FC9Ac3Df41455d2",
        "0x0273eac50c2dd47b36b0a0010346a6e5400a3a3d",
        "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73"
      ),
      calcDerivedETHAndTVLAndLiquidity(
        "0xa98395630b3db09da6ebc7b8492067118bbc3f2d",
        "0x0273eac50c2dd47b36b0a0010346a6e5400a3a3d",
        "0xa6bB624c7068751AD59AE0C88980851A2ffFe6Ca"
      ),
    ]);
    const response = [
      {
        __typename: "Pool" as "Pool",
        id: "0xab18715EdDB880C22a675fAf7FC9Ac3Df41455d2".toLowerCase(),
        totalValueLockedUSD: result3.totalValueLockedUSD.toFixed(2),
        feeTier: "3000",
        sqrtPrice: result3.sqrtPriceX96.toString(),
        liquidity: result3.liquidity.toString(),
        token0: {
          __typename: "Token" as "Token",
          id: "0x0273Eac50c2dd47B36B0A0010346A6e5400a3A3d".toLowerCase(),
          name: "Fake USDC",
          symbol: "FUSDC",
          decimals: 6,
          derivedETH: result3.token0DerivedETH.toFixed(18),
        },
        token1: {
          __typename: "Token" as "Token",
          id: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73".toLowerCase(),
          name: "Wrapped Ether",
          symbol: "WETH",
          decimals: 18,
          derivedETH: "1",
        },
        volumeUSD: "0",
        poolDayData: [
          {
            __typename: "PoolDayData" as "PoolDayData",
            volumeUSD: "0",
          },
        ],
      },
      {
        __typename: "Pool" as "Pool",
        id: "0x6abDB70A0146C70E698C395767Cf8fabABf8F799".toLowerCase(),
        totalValueLockedUSD: result1.totalValueLockedUSD.toFixed(2),
        feeTier: "500",
        sqrtPrice: result1.sqrtPriceX96.toString(),
        liquidity: result1.liquidity.toString(),
        token0: {
          __typename: "Token" as "Token",
          id: "0x0273Eac50c2dd47B36B0A0010346A6e5400a3A3d".toLowerCase(),
          name: "Fake USDC",
          symbol: "FUSDC",
          decimals: 6,
          derivedETH: result1.token0DerivedETH.toFixed(18),
        },
        token1: {
          __typename: "Token" as "Token",
          id: "0x0De53086Fb403346a874655e1819053DD792b99e".toLowerCase(),
          name: "Fake ETH",
          symbol: "FETH",
          decimals: 18,
          derivedETH: "1",
        },
        volumeUSD: "0",
        poolDayData: [
          {
            __typename: "PoolDayData" as "PoolDayData",
            volumeUSD: "0",
          },
        ],
      },
      {
        __typename: "Pool" as "Pool",
        id: "0xFd0ae9172770aEC6d74a896FeE4c70b08d90BCfa".toLowerCase(),
        totalValueLockedUSD: result2.totalValueLockedUSD.toFixed(2),
        feeTier: "3000",
        sqrtPrice: result2.sqrtPriceX96.toString(),
        liquidity: result2.liquidity.toString(),
        token1: {
          __typename: "Token" as "Token",
          id: "0xa6bB624c7068751AD59AE0C88980851A2ffFe6Ca".toLowerCase(),
          name: "Fake USDT",
          symbol: "FUSDT",
          decimals: 6,
          derivedETH: result2.token0DerivedETH.toFixed(18),
        },
        token0: {
          __typename: "Token" as "Token",
          id: "0x0De53086Fb403346a874655e1819053DD792b99e".toLowerCase(),
          name: "Fake ETH",
          symbol: "FETH",
          decimals: 18,
          derivedETH: "1",
        },
        volumeUSD: "0",
        poolDayData: [
          {
            __typename: "PoolDayData" as "PoolDayData",
            volumeUSD: "0",
          },
        ],
      }, 
      {
        __typename: "Pool" as "Pool",
        id: "0xa98395630b3db09da6ebc7b8492067118bbc3f2d".toLowerCase(),
        totalValueLockedUSD: result4.totalValueLockedUSD.toFixed(2),
        feeTier: "3000",
        sqrtPrice: result4.sqrtPriceX96.toString(),
        liquidity: result4.liquidity.toString(),
        token1: {
          __typename: "Token" as "Token",
          id: "0xa6bB624c7068751AD59AE0C88980851A2ffFe6Ca".toLowerCase(),
          name: "Fake USDT",
          symbol: "FUSDT",
          decimals: 6,
          derivedETH: Number(1/result4.token0DerivedETH).toFixed(18),
        },
        token0: {
          __typename: "Token" as "Token",
          id: "0x0273Eac50c2dd47B36B0A0010346A6e5400a3A3d".toLowerCase(),
          name: "Fake FUSDC",
          symbol: "FUSDC",
          decimals: 6,
          derivedETH: result4.token0DerivedETH.toFixed(18),
        },
        volumeUSD: "0",
        poolDayData: [
          {
            __typename: "PoolDayData" as "PoolDayData",
            volumeUSD: "0",
          },
        ],
      },
      // {
      //   __typename: "Pool" as "Pool",
      //   id: "0xFd0ae9172770aEC6d74a896FeE4c70b08d90BCfa",
      //   totalValueLockedUSD: "0",
      //   feeTier: "3000",
      //   sqrtPrice: "0",
      //   liquidity: "0",
      //   token1: {
      //     __typename: "Token" as "Token",
      //     id: "0xa6bB624c7068751AD59AE0C88980851A2ffFe6Ca",
      //     name: "Fake USDT",
      //     symbol: "FUSDT",
      //     decimals: 6,
      //     derivedETH: "0",
      //   },
      //   token0: {
      //     __typename: "Token" as "Token",
      //     id: "0x0De53086Fb403346a874655e1819053DD792b99e",
      //     name: "Fake ETH",
      //     symbol: "FETH",
      //     decimals: 18,
      //     derivedETH: "1",
      //   },
      //   volumeUSD: "0",
      //   poolDayData: [
      //     {
      //       __typename: "PoolDayData" as "PoolDayData",
      //       volumeUSD: "0",
      //     },
      //   ],
      // },
    ];
    const resultJson = JSON.stringify(response);
    RESULT_CACHE.set(resultJson, RESULT_KEY);
    return response;
  }
}

export async function getTopPools(token0?: string, token1?: string) {
  async function mockTopPoolsForDevelopment(
    query: ApolloQueryResult<TopPoolsQuery>
  ) {
    if (SERVER_ENV !== "devnet" && SERVER_ENV !== "testnet") return query;

    if (query.data.pools) {
      return {
        ...query,
        data: {
          ...query.data,
          pools: [...(await getMockedPools()), ...query.data.pools],
        },
      };
    }
    return query;
  }

  token0 = token0?.toLowerCase();
  token1 = token1?.toLowerCase();

  return query({
    query: TOP_POOLS_QUERY,
    variables: {
      where: {
        or: [
          { token0, token1 },
          { token0: token1, token1: token0 },
        ],
      },
    },
  }).then(mockTopPoolsForDevelopment);
}

export async function getPoolData(
  token0: string,
  token1: string,
  feeTier: number
): Promise<ApolloQueryResult<PoolDataQuery>> {
  if (token0 === "" || token1 === "" || feeTier === 0) {
    return {
      loading: false,
      networkStatus: NetworkStatus.ready,
      data: { pool: [] },
    };
  }

  if (SERVER_ENV === "devnet" || SERVER_ENV === "testnet") {
    const mockedPools = await getMockedPools();
    const data = mockedPools.find(
      (pool) =>
        pool.token0.id === token0 &&
        pool.token1.id === token1 &&
        pool.feeTier == feeTier
    );

    if (data)
      return {
        loading: false,
        networkStatus: NetworkStatus.ready,
        data: { pool: [data] },
      };
  }

  return query({
    query: POOL_DATA_QUERY,
    variables: { token0, token1, feeTier },
  });
}

export async function getFeeTierDistribution(token0: string, token1: string) {
  return query({
    query: FEE_TIER_DISTRIBUTION_QUERY,
    variables: { token0, token1 },
  });
}
