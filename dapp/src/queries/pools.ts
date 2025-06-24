import { graphql } from "@/queries/generated";

export const TOP_POOLS_QUERY = graphql(`
  query TopPools($where: Pool_filter) {
    pools(where: $where, orderBy: totalValueLockedUSD, orderDirection: desc) {
      id
      totalValueLockedUSD
      volumeUSD
      poolDayData(first: 1, orderBy: date, orderDirection: desc) {
        volumeUSD
      }
      token0 {
        id
        name
        symbol
      }
      token1 {
        id
        name
        symbol
      }
      feeTier
    }
  }
`);

export const FEE_TIER_DISTRIBUTION_QUERY = graphql(`
  query FeeTierDistribution($token0: String!, $token1: String!) {
    asToken0: pools(
      orderBy: totalValueLockedToken0
      orderDirection: desc
      where: { token0: $token0, token1: $token1 }
    ) {
      feeTier
      totalValueLockedToken0
      totalValueLockedToken1
    }
    asToken1: pools(
      orderBy: totalValueLockedToken0
      orderDirection: desc
      where: { token0: $token1, token1: $token0 }
    ) {
      feeTier
      totalValueLockedToken0
      totalValueLockedToken1
    }
  }
`);

export const POOL_DATA_QUERY = graphql(`
  query PoolData($token0: ID!, $token1: ID!, $feeTier: BigInt!) {
    pool: pools(
      first: 1
      where: {
        token0_: { id: $token0 }
        token1_: { id: $token1 }
        feeTier: $feeTier
      }
    ) {
      id
      token0 {
        id
        name
        symbol
        decimals
        derivedETH
      }
      token1 {
        id
        name
        symbol
        decimals
        derivedETH
      }
      feeTier
      sqrtPrice
      liquidity
    }
  }
`);

export const POOL_DATA = graphql(`
  query aAasdasd($poolIds: [ID!]) {
    pools(where: { id_in: $poolIds }) {
      id
      token0 {
        id
        derivedETH
        decimals
      }
      token1 {
        id
        derivedETH
        decimals
      }
    }
  }
`);
