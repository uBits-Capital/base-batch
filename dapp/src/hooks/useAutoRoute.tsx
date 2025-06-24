"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { TokenData } from './token/useTokenData';
import { Token } from '@uniswap/sdk-core';
import { getBestSwapRoutes, BestRoute } from '@/app/actions/query/bestSwapRoute';


export const useAutoRoute = (_tokenOut: Token | TokenData, _amountIn: string, _slippage: number) => {
  const { chain } = useAccount();

  const [bestRoute, setBestRoute] = useState<BestRoute | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBestRoute(null);
  }, [_amountIn, _slippage, _tokenOut]);

  useEffect(() => {
    if (!chain) {
      return;
    }
    if (_amountIn === "" || _amountIn === "0" || _amountIn === "0.0") {
      return;
    }

    const tokenOutUSDC = new Token(
      chain.id,
      "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      6,
      "USDC",
      "USDC Coin"
    );

    const address = _tokenOut instanceof Token ? _tokenOut.address : _tokenOut.id;

    setLoading(true);
    getBestSwapRoutes({
      tokenIn: tokenOutUSDC.address,
      tokenOut: address,
      decimalsIn: tokenOutUSDC.decimals,
      decimalsOut: _tokenOut.decimals,
      symbolIn: tokenOutUSDC.symbol || "",
      symbolOut: _tokenOut.symbol || "",
      nameIn: tokenOutUSDC.name || "",
      nameOut: _tokenOut.name || "",
      amountIn: _amountIn,
      slippage: _slippage,
    })
      .then((route) => {
        setBestRoute(route);
      }).catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [chain, _amountIn, _tokenOut, _slippage]);


  return useMemo(
    () => {
      console.log("bestRoute", bestRoute);
      if (!chain || !bestRoute) return { bestRoute: null, loading };
      setLoading(false);
      return { bestRoute, loading: false };
    },
    [chain, loading, bestRoute],
  );

};



