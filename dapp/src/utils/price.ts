import { tickToPrice, TickMath } from "@uniswap/v3-sdk";
import { Token, Price } from "@uniswap/sdk-core";
import JSBI from "jsbi";

const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
const Q192 = JSBI.exponentiate(Q96, JSBI.BigInt(2));

export const customTickToPrice = (
  base: Token,
  quote: Token,
  tick: number,
  inverted?: boolean
) => {
  const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick);
  const ratioX192 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96);

  let price = tickToPrice(base, quote, tick);

  // const newPrice = Number(price.toFixed(18));
  // const newPriceInverted = Number(price.invert().toFixed(18));
  // if (newPrice === 0 || newPriceInverted === 0) {
  //   price =
  //     newPrice === 0
  //       ? new Price(quote, base, ratioX192, Q192)
  //       : new Price(quote, base, Q192, ratioX192);
  // }
  if (inverted) {
    price = price.invert();
  }
  return price;
};
