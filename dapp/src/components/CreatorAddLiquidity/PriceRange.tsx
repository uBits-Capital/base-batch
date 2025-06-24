import { Dispatch, SetStateAction, useEffect, useMemo } from "react";

import { PriceRangeToggle } from "@/components/PriceRangeToggle";
import PriceInput from "./PriceInput";
import { useLiquidityPriceRange } from "@/hooks/liquidity/useLiquidityPriceRange";
import { Pool } from "@uniswap/v3-sdk";
import PriceLabel from "@/components/CreatorAddLiquidity/PriceLabel";
import { useCurrentPrice } from "@/hooks/useCurrentPrice";
import { Controller, useFormContext } from "react-hook-form";
import * as Yup from "yup";
import { sanitizeNumber } from "@/utils/math";
import { useLiquidityAmount } from "@/hooks/liquidity/useLiquidityAmount";
import InRange from "../InRange";
import { isWETH } from '@/utils/smartcontract';

export type PriceRangeProps = {
  pool: Pool;
  tickLower: number;
  setTickLower: Dispatch<SetStateAction<number>>;
  tickUpper: number;
  setTickUpper: Dispatch<SetStateAction<number>>;
};

export const priceRangeSchema = Yup.object({
  priceRangeVisible: Yup.boolean().required().default(true),
  inOrOutRangeVisible: Yup.boolean().required().default(true),
  priceLower: Yup.string().default("").required(),
  priceUpper: Yup.string().default("").required(),
});

export type PriceRangeSchema = Yup.InferType<typeof priceRangeSchema>;

export default function PriceRange({
  pool,
  tickLower,
  setTickLower,
  tickUpper,
  setTickUpper,
}: PriceRangeProps) {
  const { control, setValue } = useFormContext<PriceRangeSchema>();

  const {
    priceLower,
    setPriceLower,
    incrementPriceLower,
    decrementPriceLower,
    priceUpper,
    setPriceUpper,
    incrementPriceUpper,
    decrementPriceUpper,
    setFullRange,
    isFullRange,
    inverted,
    toggleInverted,
  } = useLiquidityPriceRange(
    pool,
    tickLower,
    setTickLower,
    tickUpper,
    setTickUpper,
  );

  const { inRange } = useLiquidityAmount(pool, tickLower, tickUpper);

  const currentPrice = useCurrentPrice(pool, inverted);

  const subtitle = useMemo(
    () => {
      const symbol0 = isWETH(pool.token0.address) ? "ETH" : pool.token0.symbol;
      const symbol1 = isWETH(pool.token1.address) ? "ETH" : pool.token1.symbol;

      return inverted
        ? `${symbol0} per ${symbol1}`
        : `${symbol1} per ${symbol0}`;
    },
    [inverted, pool.token0.symbol, pool.token1.symbol],
  );

  useEffect(() => {
    setValue("priceLower", priceLower);
    setValue("priceUpper", priceUpper);
  }, [priceLower, priceUpper, setValue]);

  return (
    <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 overflow-hidden gap-4 rounded-3xl bg-[#12131a] border border-[#273345]">
      <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 h-[68px] gap-2 px-8 py-5 border-t-0 border-r-0 border-b border-l-0 border-[#191d26]">
        <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
          <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white">
            Price Range
          </p>
        </div>
        <div className="flex justify-end items-center flex-grow gap-6">
          <Controller
            render={({ field }) => (
              <PriceRangeToggle
                title="Price range visible?"
                isEnabled={field.value}
                setIsEnabled={field.onChange}
              />
            )}
            name="priceRangeVisible"
            control={control}
          />

          <Controller
            render={({ field }) => (
              <PriceRangeToggle
                title=" In/out of range visible?"
                isEnabled={field.value}
                setIsEnabled={field.onChange}
              />
            )}
            name="inOrOutRangeVisible"
            control={control}
          />
        </div>
      </div>
      <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 pb-6">
        <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-3 px-6">
          <div className="flex w-full justify-between items-center gap-3">
            <InRange inRange={inRange} />
            <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 gap-3">
              <button
                className={`rounded-md px-2 py-1 text-xs font-medium text-white ${isFullRange ? "bg-[#273345]" : "bg-[#191D26]"}`}
                type="button"
                onClick={setFullRange}
              >
                Full range
              </button>

              <button
                className="flex rounded-lg bg-[#191D26] p-[2px] text-xs font-medium text-white"
                type="button"
                onClick={toggleInverted}
              >
                <div
                  className={`rounded-lg px-2 py-1 ${!inverted && "bg-[#273345]"}`}
                >
                  {isWETH(pool.token0.address) ? "ETH" : pool.token0.symbol}
                </div>

                <div
                  className={`rounded-lg px-2 py-1 ${inverted && "bg-[#273345]"}`}
                >
                  {isWETH(pool.token1.address) ? "ETH" : pool.token1.symbol}
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-end items-center self-stretch flex-grow-0 flex-shrink-0 gap-3">
            {inverted ? (
              <>
                <PriceInput
                  price={priceUpper}
                  setPrice={setPriceUpper}
                  incrementPrice={incrementPriceUpper}
                  decrementPrice={decrementPriceUpper}
                  incrementDecrementDisabled={isFullRange}
                  title={"Low price"}
                  subtitle={subtitle}
                />
                <PriceInput
                  price={priceLower}
                  setPrice={setPriceLower}
                  incrementPrice={incrementPriceLower}
                  decrementPrice={decrementPriceLower}
                  incrementDecrementDisabled={isFullRange}
                  title={"High price"}
                  subtitle={subtitle}
                />
              </>
            ) : (
              <>
                <PriceInput
                  price={priceLower}
                  setPrice={setPriceLower}
                  incrementPrice={incrementPriceLower}
                  decrementPrice={decrementPriceLower}
                  incrementDecrementDisabled={isFullRange}
                  title={"Low price"}
                  subtitle={subtitle}
                />
                <PriceInput
                  price={priceUpper}
                  setPrice={setPriceUpper}
                  incrementPrice={incrementPriceUpper}
                  decrementPrice={decrementPriceUpper}
                  incrementDecrementDisabled={isFullRange}
                  title={"High price"}
                  subtitle={subtitle}
                />
              </>
            )}
          </div>

          <PriceLabel
            price={sanitizeNumber(currentPrice)}
            title="Current price"
            subtitle={subtitle}
          />
        </div>
      </div>
    </div>
  );
}
