"use server";

import { query } from "@/apollo";
import {
  BUNDLE_DATA_QUERY,
  TOKEN_DATA_QUERY,
  TOKEN_PAIR_DATA_QUERY,
} from "@/queries/token";
import { SERVER_ENV } from "@/config";
import { ApolloQueryResult, NetworkStatus } from "@apollo/client";
import {
  TokenDataQuery,
  TokenPairDataQuery,
} from "@/queries/generated/graphql";
import { getMockedPools } from "@/app/actions/query/pool";

export async function getBundleData() {
  return query({ query: BUNDLE_DATA_QUERY });
}

export async function getTokenData(tokenId: string) {
  tokenId = tokenId.toLowerCase();
  if (SERVER_ENV === "testnet" || SERVER_ENV === "devnet") {
    const mockedPools = await getMockedPools();
    const data = mockedPools.find(
      (pool) => pool.token0.id === tokenId || pool.token1.id === tokenId
    );

    if (!data) {
      return {
        data: {},
        loading: false,
        networkStatus: NetworkStatus.ready,
      } as ApolloQueryResult<TokenDataQuery>;
    }

    return {
      data: {
        token: data?.token0,
      },
      loading: false,
      networkStatus: NetworkStatus.ready,
    } as ApolloQueryResult<TokenDataQuery>;
  }

  return query({
    query: TOKEN_DATA_QUERY,
    variables: { tokenId },
  });
}

export async function getTokenPairData(
  token0Id: string,
  token1Id: string,
  feeTier: number
) {
  if (token0Id === "" || token1Id === "" || feeTier === 0) {
    return {
      loading: false,
      networkStatus: NetworkStatus.ready,
      data: { pool: [] },
    } as ApolloQueryResult<TokenPairDataQuery>;
  }

  token0Id = token0Id.toLowerCase();
  token1Id = token1Id.toLowerCase();
  if (SERVER_ENV === "testnet" || SERVER_ENV === "devnet") {
    const data = (await getMockedPools()).find(
      (pool) =>
        pool.token0.id === token0Id &&
        pool.token1.id === token1Id &&
        pool.feeTier == feeTier
    ) as any;

    if (!data) {
      return {
        data: {
          pool: [],
        },
        loading: false,
        networkStatus: NetworkStatus.ready,
      } as ApolloQueryResult<TokenPairDataQuery>;
    }

    return {
      data: {
        token0: {
          ...data.token0,
          id: token0Id,
        },
        token1: {
          ...data.token1,
          id: token1Id,
        },
        pool: [
          {
            id: data.id,
            totalValueLockedUSD: data.totalValueLockedUSD,
            sqrtPrice: data.sqrtPrice,
            liquidity: data.liquidity,
          },
        ],
      },
      loading: false,
      networkStatus: NetworkStatus.ready,
    } as ApolloQueryResult<TokenPairDataQuery>;
  }

  return query({
    query: TOKEN_PAIR_DATA_QUERY,
    variables: { token0Id, token1Id, feeTier },
  });
}
