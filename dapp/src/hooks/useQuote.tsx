import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import JSBI from "jsbi";
import QuoterV2 from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import { FeeAmount } from "@uniswap/v3-sdk";
import { useEthersWeb3Provider } from "@/hooks/useEthersWeb3Provider";
import { QUOTER_CONTRACT } from "@/config";
import { Percent } from '@uniswap/sdk-core';

export const useQuote = (poolFeeTier?: FeeAmount, slippage?: Percent) => {
  const { chain } = useAccount();
  const ethersProvider = useEthersWeb3Provider({ chainId: chain?.id });

  const [feeAmount, setFeeAmount] = useState(FeeAmount.MEDIUM);
  const [amountOut, setAmountOut] = useState(BigInt(0));
  const [loading, setLoading] = useState(false);

  const defaultFee = useMemo(() => {
    return poolFeeTier?.toString().includes(".")
      ? poolFeeTier * 10_000
      : poolFeeTier || FeeAmount.MEDIUM;
  }, [poolFeeTier]);

  const slippageInt = useMemo(() => {
    return JSBI.BigInt(10000000 - Number(slippage?.asFraction?.toFixed(2) || 0) * 100000);
  }, [slippage]);

  useEffect(() => {
    setLoading(false);
  }, [feeAmount, amountOut]);

  const quoteMaxAmountOut = useCallback(
    async (tokenIn: string, tokenOut: string, amountIn: string) => {
      setLoading(true);
      if (!ethersProvider) {
        setLoading(false);
        return;
      }

      const bestPoolFeeTier = await GetBestPoolFeeTier(
        tokenIn,
        tokenOut,
        amountIn,
        ethersProvider
      );

      if (bestPoolFeeTier[1] === BigInt(0)) {
        setFeeAmount(defaultFee);
      } else {
        setFeeAmount(bestPoolFeeTier[0]);
      }
      const amountOut = JSBI.BigInt(bestPoolFeeTier[1].toString());
      const amountMinOut = JSBI.divide(
        JSBI.multiply(amountOut, slippageInt),
        JSBI.BigInt(10000000)
      );
      setAmountOut(BigInt(amountMinOut.toString()));
      setLoading(false);
    },
    [defaultFee, slippageInt, ethersProvider],
  );

  return {
    quoteMaxAmountOut,
    feeAmount,
    amountOut,
    loading,
  };
};

function max(...values: [FeeAmount, JSBI][]): [FeeAmount, bigint] {
  if (values.length < 1) {
    return [FeeAmount.MEDIUM, BigInt(0)];
  }

  const first = values.shift() || [];
  let key = first[0] || 0;
  let maxValue = first[1] || 0;
  for (const v of values) {
    if (v[1] > maxValue) {
      maxValue = v[1];
      key = v[0];
    }
  }

  return [key, BigInt(maxValue.toString())];
}

export async function GetBestPoolFeeTier(tokenIn: string, tokenOut: string, amountIn: string, ethersProvider: any) {
  let amountOutLowest = JSBI.BigInt(0);
  let amountOutLow = JSBI.BigInt(0);
  let poolFeeTierMedium = JSBI.BigInt(0);
  let poolFeeTierHigh = JSBI.BigInt(0);

  const errorMsg = `tokenIn: ${tokenIn}, tokenOut: ${tokenOut}, feeTier: `;
  const statusOk = "fulfilled";
  try {
    const result = await Promise.allSettled([
      QuoteExactIn(tokenIn, tokenOut, FeeAmount.LOWEST, amountIn, ethersProvider),
      QuoteExactIn(tokenIn, tokenOut, FeeAmount.LOW, amountIn, ethersProvider),
      QuoteExactIn(tokenIn, tokenOut, FeeAmount.MEDIUM, amountIn, ethersProvider),
      QuoteExactIn(tokenIn, tokenOut, FeeAmount.HIGH, amountIn, ethersProvider),
    ]);

    if (result[0].status === statusOk) {
      amountOutLowest = result[0].value;
    } else {
      console.error(
        errorMsg,
        FeeAmount.LOWEST,
        "error: ",
        result[0].reason,
      );
    }
    if (result[1].status === statusOk) {
      amountOutLow = result[1].value;
    } else {
      console.error(
        errorMsg,
        FeeAmount.LOWEST,
        "error: ",
        result[1].reason,
      );
    }
    if (result[2].status === statusOk) {
      poolFeeTierMedium = result[2].value;
    } else {
      console.error(
        errorMsg,
        FeeAmount.MEDIUM,
        "error: ",
        result[2].reason,
      );
    }
    if (result[3].status === statusOk) {
      poolFeeTierHigh = result[3].value;
    } else {
      console.error(
        errorMsg,
        FeeAmount.HIGH,
        "error: ",
        result[3].reason,
      );
    }

  } catch (error) {
    console.error(errorMsg,
      "error: ",
      error,
    );
  }
  return max(
    [FeeAmount.LOWEST, amountOutLowest],
    [FeeAmount.LOW, amountOutLow],
    [FeeAmount.MEDIUM, poolFeeTierMedium],
    [FeeAmount.HIGH, poolFeeTierHigh]
  );
}

export async function QuoteExactIn(
  tokenIn: string,
  tokenOut: string,
  fee: number,
  amountIn: string,
  provider?: any,
): Promise<JSBI> {
  const V3quoter = new ethers.Contract(QUOTER_CONTRACT, QuoterV2.abi, provider);
  const encoded = {
    tokenIn,
    tokenOut,
    fee,
    amountIn,
    sqrtPriceLimitX96: "0",
  };
  try {
    const resp = await V3quoter.quoteExactInputSingle.staticCall(encoded);
    return JSBI.BigInt(resp.amountOut.toString());
  } catch (error) {
    // console.error("QuoteExactIn error: ", error);
    return JSBI.BigInt(0);
  }
}
