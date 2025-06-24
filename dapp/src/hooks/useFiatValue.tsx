import { useMemo } from "react";
import JSBI from "jsbi";
import { BundleData, useBundleData } from "@/hooks/token/useBundleData";
import { formatCurrency } from "@/utils/currency";
import { TokenData } from "@/hooks/token/useTokenData";

export function convertToFiat(
  tokenData: TokenData | undefined,
  bundle: undefined | BundleData,
  value: bigint,
  fractionDigits?: number,
) {
  if (!tokenData || !bundle || !value) return undefined;

  const fiatAmount = tokenData.derivedETH
    .multiply(JSBI.BigInt(value.toString()))
    .divide(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(tokenData.decimals)))
    .multiply(bundle.ethPriceUSD);

  return formatCurrency(
    parseFloat(fiatAmount.toFixed(fractionDigits || 2)),
    fractionDigits,
  );
}

export function useFiatValue(
  tokenData?: TokenData,
  value?: bigint,
  fractionDigits?: number,
) {
  const { data: bundle } = useBundleData();

  return useMemo(
    () => convertToFiat(tokenData, bundle, value || BigInt(0), fractionDigits),
    [bundle, tokenData, value, fractionDigits],
  );
}
