/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query TopPools($where: Pool_filter) {\n    pools(where: $where, orderBy: totalValueLockedUSD, orderDirection: desc) {\n      id\n      totalValueLockedUSD\n      volumeUSD\n      poolDayData(first: 1, orderBy: date, orderDirection: desc) {\n        volumeUSD\n      }\n      token0 {\n        id\n        name\n        symbol\n      }\n      token1 {\n        id\n        name\n        symbol\n      }\n      feeTier\n    }\n  }\n": types.TopPoolsDocument,
    "\n  query FeeTierDistribution($token0: String!, $token1: String!) {\n    asToken0: pools(\n      orderBy: totalValueLockedToken0\n      orderDirection: desc\n      where: { token0: $token0, token1: $token1 }\n    ) {\n      feeTier\n      totalValueLockedToken0\n      totalValueLockedToken1\n    }\n    asToken1: pools(\n      orderBy: totalValueLockedToken0\n      orderDirection: desc\n      where: { token0: $token1, token1: $token0 }\n    ) {\n      feeTier\n      totalValueLockedToken0\n      totalValueLockedToken1\n    }\n  }\n": types.FeeTierDistributionDocument,
    "\n  query PoolData($token0: ID!, $token1: ID!, $feeTier: BigInt!) {\n    pool: pools(\n      first: 1\n      where: {\n        token0_: { id: $token0 }\n        token1_: { id: $token1 }\n        feeTier: $feeTier\n      }\n    ) {\n      id\n      token0 {\n        id\n        name\n        symbol\n        decimals\n        derivedETH\n      }\n      token1 {\n        id\n        name\n        symbol\n        decimals\n        derivedETH\n      }\n      feeTier\n      sqrtPrice\n      liquidity\n    }\n  }\n": types.PoolDataDocument,
    "\n  query aAasdasd($poolIds: [ID!]) {\n    pools(where: { id_in: $poolIds }) {\n      id\n      token0 {\n        id\n        derivedETH\n        decimals\n      }\n      token1 {\n        id\n        derivedETH\n        decimals\n      }\n    }\n  }\n": types.AAasdasdDocument,
    "\n  query BundleData {\n    bundle(id: 1) {\n      id\n      ethPriceUSD\n    }\n  }\n": types.BundleDataDocument,
    "\n  query TokenData($tokenId: ID!) {\n    token(id: $tokenId) {\n      id\n      decimals\n      derivedETH\n      name\n      symbol\n    }\n  }\n": types.TokenDataDocument,
    "\n  query TokenPairData($token0Id: ID!, $token1Id: ID!, $feeTier: BigInt!) {\n    token0: token(id: $token0Id) {\n      id\n      decimals\n      derivedETH\n      name\n      symbol\n    }\n\n    token1: token(id: $token1Id) {\n      id\n      decimals\n      derivedETH\n      name\n      symbol\n    }\n\n    pool: pools(\n      where: {\n        token0_: { id: $token0Id }\n        token1_: { id: $token1Id }\n        feeTier: $feeTier\n      }\n    ) {\n      id\n      sqrtPrice\n      totalValueLockedUSD\n      liquidity\n    }\n  }\n": types.TokenPairDataDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TopPools($where: Pool_filter) {\n    pools(where: $where, orderBy: totalValueLockedUSD, orderDirection: desc) {\n      id\n      totalValueLockedUSD\n      volumeUSD\n      poolDayData(first: 1, orderBy: date, orderDirection: desc) {\n        volumeUSD\n      }\n      token0 {\n        id\n        name\n        symbol\n      }\n      token1 {\n        id\n        name\n        symbol\n      }\n      feeTier\n    }\n  }\n"): (typeof documents)["\n  query TopPools($where: Pool_filter) {\n    pools(where: $where, orderBy: totalValueLockedUSD, orderDirection: desc) {\n      id\n      totalValueLockedUSD\n      volumeUSD\n      poolDayData(first: 1, orderBy: date, orderDirection: desc) {\n        volumeUSD\n      }\n      token0 {\n        id\n        name\n        symbol\n      }\n      token1 {\n        id\n        name\n        symbol\n      }\n      feeTier\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FeeTierDistribution($token0: String!, $token1: String!) {\n    asToken0: pools(\n      orderBy: totalValueLockedToken0\n      orderDirection: desc\n      where: { token0: $token0, token1: $token1 }\n    ) {\n      feeTier\n      totalValueLockedToken0\n      totalValueLockedToken1\n    }\n    asToken1: pools(\n      orderBy: totalValueLockedToken0\n      orderDirection: desc\n      where: { token0: $token1, token1: $token0 }\n    ) {\n      feeTier\n      totalValueLockedToken0\n      totalValueLockedToken1\n    }\n  }\n"): (typeof documents)["\n  query FeeTierDistribution($token0: String!, $token1: String!) {\n    asToken0: pools(\n      orderBy: totalValueLockedToken0\n      orderDirection: desc\n      where: { token0: $token0, token1: $token1 }\n    ) {\n      feeTier\n      totalValueLockedToken0\n      totalValueLockedToken1\n    }\n    asToken1: pools(\n      orderBy: totalValueLockedToken0\n      orderDirection: desc\n      where: { token0: $token1, token1: $token0 }\n    ) {\n      feeTier\n      totalValueLockedToken0\n      totalValueLockedToken1\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PoolData($token0: ID!, $token1: ID!, $feeTier: BigInt!) {\n    pool: pools(\n      first: 1\n      where: {\n        token0_: { id: $token0 }\n        token1_: { id: $token1 }\n        feeTier: $feeTier\n      }\n    ) {\n      id\n      token0 {\n        id\n        name\n        symbol\n        decimals\n        derivedETH\n      }\n      token1 {\n        id\n        name\n        symbol\n        decimals\n        derivedETH\n      }\n      feeTier\n      sqrtPrice\n      liquidity\n    }\n  }\n"): (typeof documents)["\n  query PoolData($token0: ID!, $token1: ID!, $feeTier: BigInt!) {\n    pool: pools(\n      first: 1\n      where: {\n        token0_: { id: $token0 }\n        token1_: { id: $token1 }\n        feeTier: $feeTier\n      }\n    ) {\n      id\n      token0 {\n        id\n        name\n        symbol\n        decimals\n        derivedETH\n      }\n      token1 {\n        id\n        name\n        symbol\n        decimals\n        derivedETH\n      }\n      feeTier\n      sqrtPrice\n      liquidity\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query aAasdasd($poolIds: [ID!]) {\n    pools(where: { id_in: $poolIds }) {\n      id\n      token0 {\n        id\n        derivedETH\n        decimals\n      }\n      token1 {\n        id\n        derivedETH\n        decimals\n      }\n    }\n  }\n"): (typeof documents)["\n  query aAasdasd($poolIds: [ID!]) {\n    pools(where: { id_in: $poolIds }) {\n      id\n      token0 {\n        id\n        derivedETH\n        decimals\n      }\n      token1 {\n        id\n        derivedETH\n        decimals\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BundleData {\n    bundle(id: 1) {\n      id\n      ethPriceUSD\n    }\n  }\n"): (typeof documents)["\n  query BundleData {\n    bundle(id: 1) {\n      id\n      ethPriceUSD\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TokenData($tokenId: ID!) {\n    token(id: $tokenId) {\n      id\n      decimals\n      derivedETH\n      name\n      symbol\n    }\n  }\n"): (typeof documents)["\n  query TokenData($tokenId: ID!) {\n    token(id: $tokenId) {\n      id\n      decimals\n      derivedETH\n      name\n      symbol\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TokenPairData($token0Id: ID!, $token1Id: ID!, $feeTier: BigInt!) {\n    token0: token(id: $token0Id) {\n      id\n      decimals\n      derivedETH\n      name\n      symbol\n    }\n\n    token1: token(id: $token1Id) {\n      id\n      decimals\n      derivedETH\n      name\n      symbol\n    }\n\n    pool: pools(\n      where: {\n        token0_: { id: $token0Id }\n        token1_: { id: $token1Id }\n        feeTier: $feeTier\n      }\n    ) {\n      id\n      sqrtPrice\n      totalValueLockedUSD\n      liquidity\n    }\n  }\n"): (typeof documents)["\n  query TokenPairData($token0Id: ID!, $token1Id: ID!, $feeTier: BigInt!) {\n    token0: token(id: $token0Id) {\n      id\n      decimals\n      derivedETH\n      name\n      symbol\n    }\n\n    token1: token(id: $token1Id) {\n      id\n      decimals\n      derivedETH\n      name\n      symbol\n    }\n\n    pool: pools(\n      where: {\n        token0_: { id: $token0Id }\n        token1_: { id: $token1Id }\n        feeTier: $feeTier\n      }\n    ) {\n      id\n      sqrtPrice\n      totalValueLockedUSD\n      liquidity\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;