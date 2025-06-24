import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAllPositionIds,
  getPositionDataByPoolAddress,
  listOfPositionDataByInvestor,
  getInvestorPositions,
  IPoolPartyPositionManager_InvestorPositionData,
  IPoolPartyPositionManager_PositionData,
} from "@/app/actions/smartcontract/position";
import { TokenPairDataQuery } from "@/queries/generated/graphql";
import { Fraction } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import { getTokenPairData } from "@/app/actions/query/token";
import { parseFixed } from "@ethersproject/bignumber";
import { useBundleData } from '../token/useBundleData';
import { convertToFiat } from '../useFiatValue';
import { isWETH } from '@/utils/smartcontract';
import { parseLocaleString } from '../useSumOfFiatValues';
import {
  getSlot0,
} from "@/app/actions/smartcontract/uniswapv3pool";
import DOMPurify from 'dompurify';
import { GetBestPoolFeeTier } from "@/hooks/useQuote";
import { useAccount } from 'wagmi';
import { useEthersWeb3Provider } from '../useEthersWeb3Provider';
import { WETH_CONTRACT } from '@/config';
import { toInt } from '@/utils/math';

const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));

export type HiddenFields = {
  showPriceRange: boolean;
  showTokenPair: boolean;
  showInOutRange: boolean;
};

export type FeatureSettings = {
  name: string;
  description: string;
  operatorFee: string;
  hiddenFields: HiddenFields;
};

export type Token = {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  derivedETH: Fraction;
  useNative: boolean;
};

export type PositionData<IsInvestor extends boolean = false> = {
  positionId: string;
  pool: string;
  operator: string;
  token0: Token;
  token1: Token;
  totalSupply0: bigint;
  totalSupply1: bigint;
  fee: number;
  sqrtPrice: bigint | JSBI;
  liquidity: bigint | JSBI;
  tickLower: number;
  tickUpper: number;
  inRange: number;
  closed: boolean;
  tvl: number;
  featureSettings: FeatureSettings;
  totalInvestors: number;
} & (IsInvestor extends true
  ? {
    amount0: bigint;
    amount1: bigint;
    rewards0: bigint;
    rewards1: bigint;
  }
  : {});

export function usePositions<IsInvestor extends boolean = false>(
  params?:
    | {
      accountAddress?: `0x${string}`;
    }
    | {
      poolAddress?: string; // Allows us to only fetch a single position
    },
) {
  const { chain } = useAccount();
  const ethersProvider = useEthersWeb3Provider({ chainId: chain?.id });

  const { data: bundle } = useBundleData();
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<
    [
      IPoolPartyPositionManager_PositionData,
      {
        token0: NonNullable<TokenPairDataQuery["token0"]>;
        token1: NonNullable<TokenPairDataQuery["token1"]>;
        pool: NonNullable<TokenPairDataQuery["pool"]>;
      },
      IPoolPartyPositionManager_InvestorPositionData | undefined,
    ][]
  >([]);
  const [previousParams, setPreviousParams] = useState(params);

  const getListOfPoolData = useCallback(
    async (positions: any[]) => {
      const resultArr = [] as typeof result;
      await Promise.all(
        positions.map(async (position) => {
          const positionData = await getPositionDataByPoolAddress(
            typeof position === "string" ? position : position.pool,
          );

          // Get all available token related data simultaneously.
          const { data: tokenData } = await getTokenPairData(
            positionData.token0,
            positionData.token1,
            positionData.fee,
          );
          if (
            !tokenData ||
            !tokenData.token0 ||
            !tokenData.token1 ||
            !tokenData.pool
          ) {
            console.error(
              `Token Pair ${positionData.token0} and ${positionData.token1} not found`,
            );
            return;
          }

          const derivedEthToken0Decimals =
            tokenData.token0.derivedETH.split(".")[1]?.length ?? 0;
          const derivedEthToken0 = parseFixed(
            tokenData.token0.derivedETH,
            derivedEthToken0Decimals,
          );

          const derivedEthToken1Decimals =
            tokenData.token1.derivedETH.split(".")[1]?.length ?? 0;
          const derivedEthToken1 = parseFixed(
            tokenData.token1.derivedETH,
            derivedEthToken1Decimals,
          );

          const pool = tokenData.pool[0];
          const slot0 = await getSlot0(pool.id);
          pool.sqrtPrice = slot0.sqrtPriceX96;

          const token0Data = {
            ...tokenData.token0,
            derivedETH: new Fraction(
              JSBI.BigInt(derivedEthToken0),
              JSBI.exponentiate(
                JSBI.BigInt(10),
                JSBI.BigInt(derivedEthToken0Decimals),
              ),
            ),
            useNative: isWETH(tokenData.token0.id),
          };

          const token1Data = {
            ...tokenData.token1,
            derivedETH: new Fraction(
              JSBI.BigInt(derivedEthToken1),
              JSBI.exponentiate(
                JSBI.BigInt(10),
                JSBI.BigInt(derivedEthToken1Decimals),
              ),
            ),
            useNative: isWETH(tokenData.token1.id),
          };

          if (tokenData.token0.derivedETH.toString() === "0") {
            const bestPoolFeeTier = await GetBestPoolFeeTier(
              positionData.token0,
              WETH_CONTRACT,
              toInt(1, tokenData.token0.decimals).toString(),
              ethersProvider
            );
            const derivedETH = bestPoolFeeTier[1].toString();

            token0Data.derivedETH = new Fraction(
              JSBI.BigInt(derivedETH),
              JSBI.exponentiate(
                JSBI.BigInt(10),
                JSBI.BigInt(tokenData.token0.decimals),
              ),
            );
          }

          if (tokenData.token1.derivedETH.toString() === "0") {
            const bestPoolFeeTier = await GetBestPoolFeeTier(
              positionData.token1,
              WETH_CONTRACT,
              toInt(1, tokenData.token1.decimals).toString(),
              ethersProvider
            );
            const derivedETH = bestPoolFeeTier[1].toString();

            token1Data.derivedETH = new Fraction(
              JSBI.BigInt(derivedETH),
              JSBI.exponentiate(
                JSBI.BigInt(10),
                JSBI.BigInt(tokenData.token1.decimals),
              ),
            );
          }

          const tvlToken0Fiat = convertToFiat(token0Data, bundle, positionData.totalSupply0);
          const tvlToken1Fiat = convertToFiat(token1Data, bundle, positionData.totalSupply1);

          pool.totalValueLockedUSD = [tvlToken0Fiat, tvlToken1Fiat]
            .map(parseLocaleString)
            .reduce((prev, curr) => prev + curr, 0);

          resultArr.push([
            positionData,
            {
              token0: token0Data,
              token1: token1Data,
              pool: [
                pool
              ],
            },
            typeof position !== "string" ? position : undefined,
          ]);
        }),
      );
      return resultArr;
    },
    [bundle, ethersProvider],
  );

  const refresh = useCallback(() => {
    let ignore = false;

    setLoading(true);

    const loadPositions = async () => {
      const resultArr = [] as typeof result;

      const positions = [];
      let investorPositions = [] as string[];
      let investorAddress = "0x" as `0x${string}`;
      if (previousParams && "accountAddress" in previousParams && previousParams.accountAddress !== "0x") {
        investorAddress = previousParams.accountAddress as `0x${string}`;
        investorPositions = await getInvestorPositions(investorAddress);
      }

      if (investorPositions.length === 0 || investorAddress === "0x") {
        if (!previousParams) {
          positions.push(
            ...(await getAllPositionIds()),
          );
        } else if (
          "poolAddress" in previousParams &&
          previousParams.poolAddress
        ) {
          positions.push(previousParams.poolAddress);
        }

        const _resultArr = await getListOfPoolData(positions);
        resultArr.push(..._resultArr);
      } else {
        let count = 0;
        let batchSize = 100;
        while (count < investorPositions.length) {

          const batch = investorPositions.slice(count, count + batchSize);

          const _positions = await listOfPositionDataByInvestor(investorAddress, batch);

          const _resultArr = await getListOfPoolData(_positions);

          resultArr.push(..._resultArr);

          count += batchSize;
        }
      }

      if (ignore) return;
      setLoading(false);
      setResult(resultArr);
    };

    loadPositions().then();

    return () => {
      ignore = true;
    };
  }, [previousParams, getListOfPoolData]);

  useEffect(refresh, [refresh]);

  useEffect(
    () =>
      setPreviousParams((previousParams) =>
        JSON.stringify(previousParams) !== JSON.stringify(params)
          ? params
          : previousParams,
      ),
    [params],
  );

  return useMemo(() => {
    if (!result.length) return { data: undefined, loading, refresh };
    const data = result.map(
      ([positionData, { token0, token1, pool }, investorData]) =>
        ({
          positionId: positionData.positionId,
          pool: positionData.pool,
          operator: positionData.operator,
          token0,
          token1,
          tvl: pool[0].totalValueLockedUSD,
          totalSupply0: positionData.totalSupply0,
          totalSupply1: positionData.totalSupply1,
          fee: positionData.fee / 10_000,
          sqrtPrice: pool[0].sqrtPrice,
          liquidity: pool[0].liquidity,
          tickLower: positionData.tickLower,
          tickUpper: positionData.tickUpper,
          inRange: positionData.inRange,
          closed: positionData.closed,
          featureSettings: {
            ...positionData.featureSettings,
            name: DOMPurify.sanitize(positionData.featureSettings.name),
            description: DOMPurify.sanitize(positionData.featureSettings.description),
            operatorFee: (
              positionData.featureSettings.operatorFee / 100
            ).toFixed(0),
          },
          totalInvestors: Number(positionData.totalInvestors.toString()),
          ...(investorData && {
            amount0: investorData.amount0,
            amount1: investorData.amount1,
            rewards0: investorData.rewards0,
            rewards1: investorData.rewards1,
          }),
        }) as PositionData<IsInvestor>,
    );

    setLoading(false);
    return { data, loading: false, refresh };
  }, [result, loading, refresh]);
}
