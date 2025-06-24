import { Price, Token } from "@uniswap/sdk-core";
import JSBI from "jsbi";

const LOCALE_STRING_OPTIONS = {
  maximumFractionDigits: 2,
};

export function formatCurrency(
  currency: number | string,
  fractionDigits?: number,
) {
  currency = typeof currency === "string" ? parseFloat(currency) : currency;
  if (currency < 1_000_000) {
    const potions = fractionDigits
      ? {
          maximumFractionDigits: fractionDigits,
        }
      : LOCALE_STRING_OPTIONS;
    return `$${currency.toLocaleString("en-US", potions)}`;
  } else if (currency < 1_000_000_000) {
    return `$${(currency / 1_000_000).toLocaleString("en-US", LOCALE_STRING_OPTIONS)}M`;
  } else if (currency < 1_000_000_000_000) {
    return `$${(currency / 1_000_000_000).toLocaleString("en-US", LOCALE_STRING_OPTIONS)}B`;
  } else {
    return `$${currency.toExponential(2)}`;
  }
}

export function tryParsePrice(
  baseToken?: Token,
  quoteToken?: Token,
  value?: string,
) {
  if (!baseToken || !quoteToken || !value) {
    return undefined;
  }

  if (!value.match(/^\d*\.?\d+$/)) {
    return undefined;
  }

  const [whole, fraction] = value.split(".");

  const decimals = fraction?.length ?? 0;
  const withoutDecimals = JSBI.BigInt((whole ?? "") + (fraction ?? ""));

  return new Price(
    baseToken,
    quoteToken,
    JSBI.multiply(
      JSBI.BigInt(10 ** decimals),
      JSBI.BigInt(10 ** baseToken.decimals),
    ),
    JSBI.multiply(withoutDecimals, JSBI.BigInt(10 ** quoteToken.decimals)),
  );
}
