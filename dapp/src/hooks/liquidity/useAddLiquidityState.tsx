"use client";

import { useCallback, useMemo, useState } from "react";
import { useTokenData } from "@/hooks/token/useTokenData";
import { SWAP_FEE_AMOUNT, USDC_CONTRACT } from "@/config";
import { parseTokenDataToCurrency } from "@/hooks/pool/usePoolData";
import { formatFixed } from "@ethersproject/bignumber";
import { convertToFiat, useFiatValue } from "@/hooks/useFiatValue";
import JSBI from "jsbi";
import { useBundleData } from "@/hooks/token/useBundleData";
import { toInt } from "@/utils/math";

export function useAddLiquidityState() {
  const [_amountToAdd, _setAmountToAdd] = useState<bigint>(BigInt(0));
  const { loading, data: tokenData } = useTokenData(USDC_CONTRACT);
  const fiatAmount = useFiatValue(tokenData, _amountToAdd);
  const { data: bundle } = useBundleData();

  const token = useMemo(
    () => tokenData && parseTokenDataToCurrency(tokenData),
    [tokenData],
  );

  const amountToAdd = useMemo(
    () => formatFixed(_amountToAdd.toString(), 6),
    [_amountToAdd],
  );

  const setAmountToAdd = useCallback(
    (value: string) => _setAmountToAdd(toInt(value, tokenData?.decimals || 0)),
    [tokenData],
  );

  const totalDepositCost = useMemo(() => {
    if (!tokenData || !bundle) return "-";

    return (
      convertToFiat(
        tokenData,
        bundle,
        BigInt(
          JSBI.divide(
            JSBI.multiply(
              JSBI.BigInt(_amountToAdd.toString()),
              JSBI.BigInt((1 + SWAP_FEE_AMOUNT) * 10_000),
            ),
            JSBI.BigInt(10_000),
          ).toString(),
        ),
      ) ?? "-"
    );
  }, [tokenData, bundle, _amountToAdd]);

  const feeCost = useMemo(() => {
    if (!tokenData || !bundle) return "-";

    return (
      convertToFiat(
        tokenData,
        bundle,
        BigInt(
          JSBI.divide(
            JSBI.multiply(
              JSBI.BigInt(_amountToAdd.toString()),
              JSBI.BigInt(SWAP_FEE_AMOUNT * 10_000),
            ),
            JSBI.BigInt(10_000),
          ).toString(),
        ),
      ) ?? "-"
    );
  }, [tokenData, bundle, _amountToAdd]);

  return {
    token,
    loading,
    amountToAdd,
    rawAmountToAdd: _amountToAdd,
    setAmountToAdd,
    fiatAmount: fiatAmount ?? "-",
    totalDepositCost,
    feeCost,
  };
}
