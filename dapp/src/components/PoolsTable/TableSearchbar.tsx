"use client";

import { useEffect, useRef, useState } from "react";
import SearchTokensNPools from "../SearchTokensNPools";
import CoinSelector from "../CoinSelector";

export type TableSearchbarProps = {
  token0?: string;
  token1?: string;
  search?: string;
  setToken0(newToken: string | undefined): void;
  setToken1(newToken: string | undefined): void;
  setSearch(newSearch: string): void;
};

function useClickOutside(ref: any, onClickOutside: () => void) {
  useEffect(() => {
    /**
     * Invoke Function onClick outside of element
     */
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClickOutside();
      }
    }
    // Bind
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // dispose
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, onClickOutside]);
}

export default function TableSearchbar({
  token0,
  token1,
  search,
  setToken0,
  setToken1,
  setSearch,
}: TableSearchbarProps) {
  const [isTokenZeroOpen, setIsTokenZeroOpen] = useState(false);
  const [isTokenOneOpen, setIsTokenOneOpen] = useState(false);
  const wrapperRef = useRef(null);

  useClickOutside(wrapperRef, () => {
    setIsTokenZeroOpen(false);
    setIsTokenOneOpen(false);
  });

  useEffect(() => {
    if (isTokenZeroOpen) setIsTokenOneOpen(false);
    if (isTokenOneOpen) setIsTokenZeroOpen(false);
  }, [isTokenZeroOpen, setIsTokenZeroOpen, isTokenOneOpen, setIsTokenOneOpen]);

  return (
    <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 gap-4 px-6 py-5">
      <div
        className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-[402px] gap-2"
        ref={wrapperRef}
      >
        <div className="flex gap-3">
          <CoinSelector
            isOpen={isTokenZeroOpen}
            setIsOpen={setIsTokenZeroOpen}
            selectedTokenId={token0}
            filteredTokens={[token1 || ""]}
            setSelectedTokenId={setToken0}
          />
          <CoinSelector
            isOpen={isTokenOneOpen}
            setIsOpen={setIsTokenOneOpen}
            selectedTokenId={token1}
            filteredTokens={[token0 || ""]}
            setSelectedTokenId={setToken1}
          />
        </div>
      </div>
      <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 h-11 w-[534px] gap-2">
        <SearchTokensNPools searchInput={search} setSearchInput={setSearch} />
      </div>
    </div>
  );
}
