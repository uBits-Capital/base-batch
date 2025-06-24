"use client";

import TableSearchbar from "@/components/PoolsTable/TableSearchbar";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import Header from "./Header";

import { redirectToCreatorAddLiquidity } from "@/app/actions/redirects";
import { useState } from "react";
import { WETH_CONTRACT } from "@/config";
import { useTopPools } from "@/hooks/pool/useTopPools";

export type FindAPoolModalProps = {
  close(): any;
};

export default function FindAPoolModal({ close }: FindAPoolModalProps) {
  const [token0, setToken0] = useState<string | undefined>(WETH_CONTRACT);
  const [token1, setToken1] = useState<string | undefined>();
  const [search, setSearch] = useState<string>();

  const { data: pools, loading } = useTopPools(token0, token1, search);

  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
      />

      <div className="fixed inset-0 w-screen">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 gap-[9px] rounded-3xl bg-[#12131a] border border-[#273345] max-h-[75vh]">
            <Header close={close} />

            <TableSearchbar
              token0={token0}
              setToken0={setToken0}
              token1={token1}
              setToken1={setToken1}
              search={search}
              setSearch={setSearch}
            />

            <TableHeader />

            <div className="flex flex-col items-center self-stretch rounded-2xl overflow-scroll h-full">
              {!loading && pools ? (
                pools.length ? (
                  pools.map((pool) => (
                    <TableRow
                      key={pool.id}
                      data={pool}
                      onSelected={() =>
                        redirectToCreatorAddLiquidity(
                          pool.token0.id,
                          pool.token1.id,
                          pool.feeTier,
                        )
                      }
                    />
                  ))
                ) : (
                  <div className="pt-8 pb-12 text-gray-400">No results</div>
                )
              ) : (
                <div className="pt-8 pb-12 text-gray-400">Loading...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
