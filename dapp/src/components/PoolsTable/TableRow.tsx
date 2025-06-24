"use client";

import { JSX } from "react";
import { formatCurrency } from "@/utils/currency";

interface TableRow {
  name: string;
  pair: JSX.Element;
  tvl: string | number;
  performance: string;
  investors: number;
  strategy: string;
  onSelected?: () => void;
}

export default function TableRow({
  name,
  pair,
  tvl,
  performance,
  investors,
  strategy,
  onSelected,
}: TableRow) {
  return (
    <div className="cursor-pointer w-[320px] md:w-[1000px]" onClick={onSelected}>
      <svg
        height={2}
        viewBox="0 0 1008 2"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="self-stretch flex-grow-0 flex-shrink-0"
        preserveAspectRatio="none"
      >
        <path d="M0 1C319.313 1 967.951 1 1008 1" stroke="#191D26" />
      </svg>
      <div className="flex justify-start items-center self-stretch   w-full px-8 py-5 ">
        <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 w-[200px] relative gap-2">
          <p className="flex-grow-0 flex-shrink-0 w-[124px] text-sm font-bold text-left text-white">
            {name}
          </p>
        </div>
        <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 w-[220px] gap-3">
          {pair}
        </div>
        <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 w-[140px] relative gap-3">
          <p className="flex-grow w-[110px] text-xs text-left text-white">
            {formatCurrency(tvl)}
          </p>
        </div>
        <div className="flex justify-start items-center flex-grow-0 flex-shrink-0  w-[110px] relative gap-3">
          <p className="flex-grow   text-xs text-left text-white">
            {performance}%
          </p>
        </div>
        <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 w-[100px] gap-3">
          <p className="flex-grow   text-xs text-left text-white">
            {investors > 0 ? investors : "0"}
          </p>
        </div>
        <div className="flex justify-start items-center flex-grow relative  gap-2">
          <p className="flex-grow w-[204px] text-xs text-left text-gray-400 break-words whitespace-normal">
            {strategy}
          </p>
        </div>
      </div>
    </div>
  );
}
