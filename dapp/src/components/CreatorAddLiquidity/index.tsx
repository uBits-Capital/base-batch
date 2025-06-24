"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import FindAPoolModal from "@/components/FindAPoolModal";
import DepositAmountsPair, {
  depositAmountsPairSchema,
} from "@/components/AddLiquidity/DepositAmountsPair";
import PairTokenHeader from "@/components/PairToken/Header";
import PriceRange, { priceRangeSchema } from "./PriceRange";
import PoolFeatureSettings, {
  poolFeatureSettingsSchema,
} from "./PoolFeatureSettings";
import Summary from "./Summary";
import { useLiquidityState } from "@/hooks/liquidity/useLiquidityState";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { PoolData } from "@/hooks/pool/usePoolData";
import { useCreatePosition } from "@/hooks/position/useCreatePosition";
import { redirectToPools, redirectToPortfolio } from "@/app/actions/redirects";
import { ARBISCAN_URL, SLIPPAGE_TOLERANCE } from "@/config";
import TransactionModal, {
  ModalActionType,
  TransactionType,
} from "@/components/TransactionModal";
import { isWETH } from '@/utils/smartcontract';
import Gear from "@/assets/gear.svg";
import { Percent } from '@uniswap/sdk-core';
import SlippageSettings from '../SlippageSettings';

export type CreatorAddLiquidityProps = { poolData: PoolData; };

const schema = Yup.object()
  .concat(poolFeatureSettingsSchema)
  .concat(priceRangeSchema)
  .concat(depositAmountsPairSchema);

type FormData = Yup.InferType<typeof schema>;

export default function CreatorAddLiquidity({
  poolData,
}: CreatorAddLiquidityProps) {
  const [showFindPoolModal, setShowFindPoolModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState(SLIPPAGE_TOLERANCE.toFixed(2));

  const { createPosition, txHash, error } = useCreatePosition();

  const { pool, tickLower, setTickLower, tickUpper, setTickUpper } =
    useLiquidityState(poolData);

  const methods = useForm<FormData>({
    defaultValues: schema.cast({}),
    resolver: yupResolver(schema),
    mode: "onBlur",
    criteriaMode: "all",
  });

  const { handleSubmit, watch, getValues } = methods;

  const onSubmit = useCallback(
    async (data: FormData) => {
      setShowLoadingModal(true);
      await createPosition({
        poolData,
        amount0: data?.amount0,
        amount1: data?.amount1,
        tickLower,
        tickUpper,
        slippage: Number(slippage),
        featureSettings: {
          name: data?.poolName,
          description: data?.strategyDescription || "",
          operatorFee: data?.performanceFee,
          hiddenFields: {
            showPriceRange: data?.priceRangeVisible,
            showTokenPair: data?.tokenPairVisible,
            showInOutRange: data?.inOrOutRangeVisible,
          },
        },
      });
    },
    [createPosition, poolData, tickLower, tickUpper, slippage],
  );

  return (
    <FormProvider {...methods}>
      <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 gap-5">
        <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 gap-8">
          <div className="flex justify-between items-center self-stretch   gap-2">
            <div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 gap-3">
              <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
                <p className="flex-grow-0 flex-shrink-0 text-3xl font-medium text-left text-white">
                  Add liquidity
                </p>
              </div>
            </div>
            <Image
              src={Gear}
              width={204}
              height={204}
              alt="Gear"
              className="w-6 h-6 object-cover cursor-pointer"
              onClick={() => setShowSettings(!showSettings)}
            />
          </div>

          <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 gap-5">
            <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-[692px] gap-5">
              <PairTokenHeader
                onChangeSelected={() => setShowFindPoolModal(true)}
                token0={poolData.token0}
                token1={poolData.token1}
                feeTier={poolData.feeTier}
                feeTierScaled={poolData.feeTierScaled}
              />
            </div>

            <form
              className="flex justify-start items-start flex-grow-0 flex-shrink-0 gap-5"
              onSubmit={handleSubmit(onSubmit)} >
              <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-[692px] gap-5">
                <PriceRange
                  pool={pool!}
                  tickLower={tickLower}
                  setTickLower={setTickLower}
                  tickUpper={tickUpper}
                  setTickUpper={setTickUpper}
                />

                <DepositAmountsPair
                  showToggleTokenPairVisible
                  pool={pool!}
                  poolData={poolData}
                  tickLower={tickLower}
                  tickUpper={tickUpper}
                />

                <PoolFeatureSettings />
              </div>
              {!showSettings ? <Summary
                poolData={poolData}
                slippage={slippage}
                amount0={watch("amount0")}
                amount1={watch("amount1")}
              /> : <div className="mt-[-95px]">
                <SlippageSettings
                  show={showSettings}
                  initialSlippage={new Percent(Number((parseFloat(slippage) * 100).toFixed(0)), 10_000)}
                  onSlippageChanged={(slippage: Percent) => {
                    setSlippage(slippage.toFixed(2));
                  }} />
              </div>}
            </form>
          </div>
        </div>
      </div>

      {showFindPoolModal && (
        <FindAPoolModal close={() => setShowFindPoolModal(false)} />
      )}
      {showLoadingModal && (
        <TransactionModal
          type={
            !!txHash
              ? TransactionType.SUCCESS
              : !!error
                ? TransactionType.FAILED
                : TransactionType.PENDING
          }
          modalType={ModalActionType.CREATE_POSITION}
          close={(type) =>
            type === TransactionType.SUCCESS
              ? redirectToPortfolio()
              : type === TransactionType.PENDING
                ? redirectToPools()
                : setShowLoadingModal(false)
          }
          token0Ticker={isWETH(poolData.token0.id) ? "ETH" : poolData.token0.symbol}
          token1Ticker={isWETH(poolData.token1.id) ? "ETH" : poolData.token1.symbol}
          token0Amount={getValues("amount0")}
          token1Amount={getValues("amount1")}
          transactionUrl={txHash && ARBISCAN_URL + txHash}
          error={error}
        />
      )}

    </FormProvider >
  );
}
