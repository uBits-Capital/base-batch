"use client";

import Layout from "@/components/Layout";
import PoolsHeader from "@/components/PoolsHeader";
import PoolsTable from "@/components/PoolsTable";

export default function Page() {
  return (
    <Layout>
      <PoolsHeader />
      <PoolsTable />
    </Layout>
  );
}
