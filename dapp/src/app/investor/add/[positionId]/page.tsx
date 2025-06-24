"use client";

import Layout from "@/components/Layout";
import InvestorAddLiquidity from "@/components/InvestorAddLiquidity";
import { useParams } from "next/navigation";

export type Params = {
  positionId: string;
};

export default function Page() {
  const { positionId } = useParams<Params>();
  return (
    <Layout>
      <InvestorAddLiquidity positionId={positionId} />
    </Layout>
  );
}
