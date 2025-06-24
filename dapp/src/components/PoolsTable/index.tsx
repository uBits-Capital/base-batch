"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { redirectToInvestorAddLiquidity } from "@/app/actions/redirects";
import PairToken from "@/components/PairToken";
import TableSearchbar from "./TableSearchbar";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import { PositionData, usePositions } from "@/hooks/position/usePositions";
import { AlertSnackbar } from "../AlertSnackbar";

export type PoolsTableProps = {};

function filterPosition(token0?: string, token1?: string, search?: string) {
  return (position: PositionData) => {
    if (!search?.length && !token0 && !token1) return true;

    if (search?.length)
      return (
        position.pool +
        position.token0.id +
        position.token1.id +
        position.featureSettings.name +
        position.featureSettings.description
      )
        .toLowerCase()
        .includes(search.toLowerCase());

    if (token0)
      return position.token0.id.toLowerCase().includes(token0.toLowerCase());

    if (token1)
      return position.token1.id.toLowerCase().includes(token1.toLowerCase());
  };
}

export default function PoolsTable({}: PoolsTableProps) {
  const [token0, setToken0] = useState<string>();
  const [token1, setToken1] = useState<string>();
  const [search, setSearch] = useState<string>();
  const [showAlert, setShowAlert] = useState(false);

  const { loading, data: rawPositions } = usePositions();
  const { isConnected } = useAccount();

  const positions = useMemo(
    () =>
      rawPositions &&
      rawPositions.filter(filterPosition(token0, token1, search)),
    [rawPositions, search, token0, token1],
  );

  return (
    <div >
      {loading && <>Loading...</>}
      {!loading && !positions && <>No pools..</>}

      {!loading && positions && <>
        <div className="flex flex-col overflow-x-scroll md:overflow-hidden justify-start items-start w-[320px] md:w-[1008px] gap-6 rounded-3xl bg-[#12131a] border border-[#273345]">
          <div className="hidden md:flex">
            <TableSearchbar
              token0={token0}
              setToken0={setToken0}
              token1={token1}
              setToken1={setToken1}
              search={search}
              setSearch={setSearch}
            />
          </div>

          <div className="flex flex-col justify-center items-center self-stretch rounded-2xl pt-3 pr-5">
            <TableHeader />

            {positions?.length ? (
              positions
                .filter((position) => !position.closed)
                .map((position) => (
                  <TableRow
                    key={position.pool}
                    name={position.featureSettings.name}
                    pair={
                      <PairToken
                        token0={position.token0}
                        token1={position.token1}
                        feeTier={position.fee}
                      />
                    }
                    tvl={position.tvl.toString()}
                    performance={position.featureSettings.operatorFee}
                    investors={position.totalInvestors}
                    strategy={position.featureSettings.description}
                    onSelected={() => {
                      isConnected && redirectToInvestorAddLiquidity(position.pool);
                      !isConnected && setShowAlert(true);
                    }}
                  />
                ))
            ) : (
              <div className="pt-8 pb-12 text-gray-400">No results</div>
            )}
            <div className="flex justify-between items-center self-stretch  h-[60px] px-8 py-5" />
          </div>
        </div>
      </>}
      <AlertSnackbar
        message="To select a pool you must connect your wallet"
        show={showAlert}
        setShow={setShowAlert}
      />
    </div>
  );
}
