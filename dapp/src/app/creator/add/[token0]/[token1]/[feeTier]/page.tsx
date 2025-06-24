"use client";

import Layout from "@/components/Layout";
import CreatorAddLiquidity from "@/components/CreatorAddLiquidity";
import { usePoolData } from "@/hooks/pool/usePoolData";
import Failed from "@/components/TransactionModal/Failed";
import { redirectToPools } from "@/app/actions/redirects";
import { useParams } from "next/navigation";
import { POOL_DATA_REFRESH_INTERVAL } from "@/config";
import { useEffect } from "react";
import { interval } from "@/utils/interval";

export type Params = {
  token0: string;
  token1: string;
  feeTier: string;
};

export default function Page() {
  const { token0, token1, feeTier } = useParams<Params>();

  const {
    data: poolData,
    loading,
    refresh,
  } = usePoolData(token0, token1, feeTier);

  useEffect(() => interval(refresh, POOL_DATA_REFRESH_INTERVAL), [refresh]);

  if (loading)
    return (
      <Layout>
        <>Loading...</>
      </Layout>
    );

  if (!poolData)
    return (
      <Layout>
        <Failed error="" close={() => redirectToPools()} />
      </Layout>
    );

  return (
    <Layout>
      <CreatorAddLiquidity poolData={poolData} />
    </Layout>
  );
}
