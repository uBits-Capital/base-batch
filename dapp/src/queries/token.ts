import { graphql } from "@/queries/generated";

export const BUNDLE_DATA_QUERY = graphql(`
  query BundleData {
    bundle(id: 1) {
      id
      ethPriceUSD
    }
  }
`);

export const TOKEN_DATA_QUERY = graphql(`
  query TokenData($tokenId: ID!) {
    token(id: $tokenId) {
      id
      decimals
      derivedETH
      name
      symbol
    }
  }
`);

export const TOKEN_PAIR_DATA_QUERY = graphql(`
  query TokenPairData($token0Id: ID!, $token1Id: ID!, $feeTier: BigInt!) {
    token0: token(id: $token0Id) {
      id
      decimals
      derivedETH
      name
      symbol
    }

    token1: token(id: $token1Id) {
      id
      decimals
      derivedETH
      name
      symbol
    }

    pool: pools(
      where: {
        token0_: { id: $token0Id }
        token1_: { id: $token1Id }
        feeTier: $feeTier
      }
    ) {
      id
      sqrtPrice
      totalValueLockedUSD
      liquidity
    }
  }
`);
