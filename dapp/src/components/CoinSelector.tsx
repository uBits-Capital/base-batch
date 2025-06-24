import React, { useMemo, useState } from "react";
import structuredTokens from "../assets/coins/structured_tokens.json";
import CoinImage from "./CoinImage";

export type CoinSelectorProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filteredTokens: string[];
  selectedTokenId?: string;
  setSelectedTokenId(newToken: string | undefined): void;
};

const DefaultPlaceholder = () => (
  <span className="flex-grow text-base text-left text-gray-400">
    Select a token
  </span>
);

export default function CoinSelector({
  isOpen,
  setIsOpen,
  filteredTokens,
  selectedTokenId,
  setSelectedTokenId,
}: CoinSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const selectedToken = useMemo(
    () =>
      selectedTokenId
        ? structuredTokens[selectedTokenId as keyof typeof structuredTokens]
        : undefined,
    [selectedTokenId],
  );

  const _filteredTokens = useMemo(
    () =>
      Object.keys(structuredTokens).filter(
        (id) =>
          structuredTokens[id as keyof typeof structuredTokens].ticker
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) && !filteredTokens.includes(id),
      ),
    [searchTerm, filteredTokens],
  );

  return (
    <div className="relative">
      <button
        className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 h-11 w-[197px] px-3 rounded-lg bg-[#191d26] border border-[#191d26] text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {selectedToken && <CoinImage imagePath={selectedToken.iconUrl} />}
          <p className="ml-2 text-base">
            {selectedToken ? selectedToken.ticker : <DefaultPlaceholder />}
          </p>
        </div>
        <svg
          width={20}
          height={20}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-grow-0 flex-shrink-0 w-5 h-5"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.64645 8.31319C5.84171 8.11793 6.15829 8.11793 6.35355 8.31319L10 11.9596L13.6464 8.31319C13.8417 8.11793 14.1583 8.11793 14.3536 8.31319C14.5488 8.50846 14.5488 8.82504 14.3536 9.0203L10.3536 13.0203C10.1583 13.2156 9.84171 13.2156 9.64645 13.0203L5.64645 9.0203C5.45118 8.82504 5.45118 8.50846 5.64645 8.31319Z"
            fill="#9CA3AF"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-[197px] mt-1 bg-[#191d26] border border-[#191d26] rounded-lg shadow-lg">
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-[#191d26] text-white border-b border-[#2D3748] focus:outline-none"
          />
          <ul className="py-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-[#191d26] scrollbar-track-[#191d26]">
            {selectedTokenId && (
              <li
                className="px-3 py-2 hover:bg-[#2D3748] cursor-pointer flex items-center"
                onClick={() => {
                  setSelectedTokenId(undefined);
                  setIsOpen(false);
                }}
              >
                <span className="ml-2">Clear Selection</span>
              </li>
            )}

            {_filteredTokens.map((id) => (
              <li
                key={id}
                className="px-3 py-2 hover:bg-[#2D3748] cursor-pointer flex items-center"
                onClick={() => {
                  setSelectedTokenId(id);
                  setIsOpen(false);
                }}
              >
                <CoinImage
                  imagePath={
                    structuredTokens[id as keyof typeof structuredTokens]
                      .iconUrl
                  }
                />
                <span className="ml-2">
                  {structuredTokens[id as keyof typeof structuredTokens].ticker}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
