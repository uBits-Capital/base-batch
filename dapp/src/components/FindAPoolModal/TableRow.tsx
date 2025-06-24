"use client";

import PairToken from "@/components/PairToken";
import { formatCurrency } from "@/utils/currency";
import { TopPool } from "@/hooks/pool/useTopPools";

export type TableRow = {
  data: TopPool;
  onSelected?: () => void;
};

const TableRow = ({ data, onSelected = () => {} }: TableRow) => (
  <>
    <div
      className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 px-8 py-5 cursor-pointer"
      onClick={onSelected}
    >
      <div className="flex justify-start items-center flex-grow gap-2">
        <PairToken
          token0={data.token0}
          token1={data.token1}
          feeTier={data.feeTierScaled}
        />
      </div>
      <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 gap-2">
        <p className="flex-grow-0 flex-shrink-0 w-[124px] text-xs text-left text-white">
          {formatCurrency(data.tvl)}
        </p>
        <p className="flex-grow-0 flex-shrink-0 w-[124px] text-xs text-left text-white">
          {data.apr24hrs.toFixed(3)}%
        </p>
        <p className="flex-grow-0 flex-shrink-0 w-[124px] text-xs text-left text-white">
          {formatCurrency(data.volume24hrs)}
        </p>
      </div>
    </div>
    <svg
      height={2}
      viewBox="0 0 900 2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="self-stretch flex-grow-0 flex-shrink-0"
      preserveAspectRatio="none"
    >
      <path d="M0 1C285.101 1 864.242 1 900 1" stroke="#191D26" />
    </svg>
  </>
);

export default TableRow;
