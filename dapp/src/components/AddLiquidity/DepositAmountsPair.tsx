import React, { useEffect, useState } from "react";
import TokenAmountSection from "../TokenAmountSection";
import { useLiquidityAmount } from "@/hooks/liquidity/useLiquidityAmount";
import { Pool } from "@uniswap/v3-sdk";
import { Controller, useFormContext } from "react-hook-form";
import * as Yup from "yup";
import { TestContext } from "yup";
import { PriceRangeToggle } from "@/components/PriceRangeToggle";
import { useFiatValue } from "@/hooks/useFiatValue";
import { PoolData } from "@/hooks/pool/usePoolData";
import { useTokenBalance } from "@/hooks/token/useTokenBalance";
import { toInt } from "@/utils/math";

export type DepositAmountsPairProps = {
  showToggleTokenPairVisible?: boolean;
  showToggleSwapToRatio?: boolean;
  pool: Pool;
  poolData: PoolData;
  tickLower: number;
  tickUpper: number;
};

function amountsTest(maxAmountPath: string) {
  return (value: string, context: TestContext) => {
    const amount0 = parseFloat(context.parent["amount0"]);
    const amount1 = parseFloat(context.parent["amount1"]);

    const currentAmount = parseFloat(value);
    const maxCurrentAmount = context.parent[maxAmountPath];

    return (
      !isNaN(amount0) &&
      !isNaN(amount1) &&
      !isNaN(currentAmount) &&
      (amount0 > 0 || amount1 > 0) &&
      currentAmount <= maxCurrentAmount
    );
  };
}

export const depositAmountsPairSchema = Yup.object({
  tokenPairVisible: Yup.boolean().required().default(false),
  swapToRatio: Yup.boolean().required().default(false),
  amount0: Yup.string()
    .required()
    .default("")
    .test("amounts-test", "Invalid Amount", amountsTest("maxAmount0")),
  amount1: Yup.string()
    .required()
    .default("")
    .test("amounts-test", "Invalid Amount", amountsTest("maxAmount1")),
  maxAmount0: Yup.number().default(0),
  maxAmount1: Yup.number().default(0),
});

export type DepositAmountPairSchema = Yup.InferType<
  typeof depositAmountsPairSchema
>;

export default function DepositAmountsPair({
  showToggleTokenPairVisible,
  showToggleSwapToRatio,
  pool,
  poolData,
  tickLower,
  tickUpper,
}: DepositAmountsPairProps) {
  const { control, setValue, getFieldState } =
    useFormContext<DepositAmountPairSchema>();

  const [walletAmountToken0, setWalletAmountToken0] = useState(0);
  const [walletAmountToken1, setWalletAmountToken1] = useState(0);

  const { inRange, amount0, setAmount0, amount1, setAmount1 } =
    useLiquidityAmount(pool, tickLower, tickUpper);

  const fiatAmount0 = useFiatValue(
    poolData.token0,
    toInt(amount0, poolData.token0.decimals),
  );
  const fiatAmount1 = useFiatValue(
    poolData.token1,
    toInt(amount1, poolData.token1.decimals),
  );

  const { getFormattedBalance } = useTokenBalance(
    poolData.token0,
    poolData.token1,
  );

  useEffect(() => {
    (async () => {
      const [balance0, balance1] = await getFormattedBalance();
      balance0 && setWalletAmountToken0(balance0);
      balance1 && setWalletAmountToken1(balance1);
    })();
  }, [getFormattedBalance]);

  useEffect(() => {
    if (showToggleTokenPairVisible) setValue("tokenPairVisible", true);
    if (showToggleSwapToRatio) setValue("swapToRatio", true);
  }, [setValue, showToggleSwapToRatio, showToggleTokenPairVisible]);

  useEffect(() => {
    setValue("maxAmount0", walletAmountToken0);
    setValue("maxAmount1", walletAmountToken1);
  }, [setValue, walletAmountToken0, walletAmountToken1]);

  useEffect(() => {
    setValue("amount0", amount0, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue("amount1", amount1, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [amount0, amount1, setValue]);

  return (
    <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-6 pb-6 rounded-3xl bg-[#12131a] border border-[#273345]">
      <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 h-[68px] gap-[217px] px-8 py-6 border-t-0 border-r-0 border-b border-l-0 border-[#191d26]">
        <div className="flex flex-col justify-center items-start flex-grow relative gap-0.5">
          <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white">
            Deposit amounts
          </p>
        </div>
        {!showToggleSwapToRatio && showToggleTokenPairVisible && (
          <Controller
            render={({ field }) => (
              <PriceRangeToggle
                title="Token pair visible?"
                isEnabled={field.value}
                setIsEnabled={field.onChange}
              />
            )}
            name="tokenPairVisible"
            control={control}
          />
        )}
        {!showToggleTokenPairVisible && showToggleSwapToRatio && (
          <Controller
            render={({ field }) => (
              <PriceRangeToggle
                title="Swap to ratio"
                isEnabled={field.value}
                setIsEnabled={field.onChange}
              />
            )}
            name="swapToRatio"
            control={control}
          />
        )}
      </div>
      <div className="flex justify-around items-center self-stretch px-6 gap-3">
        {inRange !== 1 && (
          <TokenAmountSection
            value={amount0}
            fiatValue={fiatAmount0 ?? "-"}
            setValue={setAmount0}
            walletAmount={walletAmountToken0}
            token={pool.token0}
            disabled={inRange === 1}
            isValid={!getFieldState("amount0").invalid || inRange !== 1}
          />
        )}
        {inRange !== -1 && (
          <TokenAmountSection
            value={amount1}
            fiatValue={fiatAmount1 ?? "-"}
            setValue={setAmount1}
            walletAmount={walletAmountToken1}
            token={pool.token1}
            disabled={inRange === -1}
            isValid={!getFieldState("amount1").invalid || inRange !== -1}
          />
        )}
      </div>
    </div>
  );
}
