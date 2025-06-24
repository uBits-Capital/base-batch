import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import { useAccount } from "wagmi";
import { PositionData } from "@/hooks/position/usePositions";
import { convertToFiat } from "@/hooks/useFiatValue";
import { parseLocaleString } from "@/hooks/useSumOfFiatValues";
import { useBundleData } from "@/hooks/token/useBundleData";
import { formatCurrency } from "@/utils/currency";

export type BalanceSummaryProps = {
  positions: Record<string, PositionData<true>>;
  onHideClosedPositions: (hide: boolean) => void;
};

export default function BalanceSummary({ positions, onHideClosedPositions = (hide) => {} }: BalanceSummaryProps) {
  const [hideClosedPositions, setHideClosedPositions] = useState(true);
  const { data: bundle } = useBundleData();
  const { isConnected } = useAccount();

  const sumValues = useCallback(
    (key0: keyof PositionData<true>, key1: keyof PositionData<true>) =>
      formatCurrency(
        Object.values(positions)
          .flatMap(
            (position) => [
              convertToFiat(position.token0, bundle, position[key0] as any),
              convertToFiat(position.token1, bundle, position[key1] as any),
            ],
            "0",
          )
          .map(parseLocaleString)
          .reduce((acc, cur) => acc + cur, 0),
      ),
    [bundle, positions],
  );

  const totalFiatInvestedBalance = useMemo(
    () => sumValues("amount0", "amount1"),
    [sumValues],
  );

  const totalFiatRewards = useMemo(
    () => sumValues("rewards0", "rewards1"),
    [sumValues],
  );

  const now = useMemo(() => format(Date.now(), "dd MMM, h:mmaaa"), []);

  return (
    <div className="sticky top-5  flex-col  justify-start items-start w-[320px] md:w-[664px] overflow-hidden rounded-3xl bg-[#12131a] border border-[#273345]">
      <div className=" flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 ">
        <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0 overflow-hidden p-8 gap-3">

          <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 relative gap-1">
            <p className="flex-grow-0 flex-shrink-0 text-[10px] md:text-xs text-left text-gray-300">
              Total Balance
            </p>
            <p className="flex-grow-0 flex-shrink-0 text-[20px] md:text-[40px] font-medium text-left text-white">
              {isConnected ? totalFiatInvestedBalance : "$0"}
            </p>
            <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-1">
              <p className="flex-grow-0 flex-shrink-0 text-[10px] md:text-xs text-left text-gray-400">
                {now}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 gap-6 px-4 py-3 rounded-lg bg-[#191d26]">
            <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-[120px] md:w-[200px] relative gap-1">
              <p className="flex-grow-0 flex-shrink-0 text-[10px] md:text-xs text-left text-gray-400">
                Total fees
              </p>
              <p className="flex-grow-0 flex-shrink-0 text-[15px] md:text-xl text-left text-white">
                {isConnected ? totalFiatRewards : "$0"}
              </p>
            </div>
          </div>

        </div>
      </div>
      <div
        className="flex justify-start items-center flex-grow-0 flex-shrink-0 gap-2 cursor-pointer pl-8 pt-0 pb-5"
        onClick={() => {
          setHideClosedPositions(!hideClosedPositions);
          onHideClosedPositions(!hideClosedPositions);
        }}
      >
        <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0  gap-1">
          <p className="flex-grow-0 flex-shrink-0 text-[15px] md:text-sm text-left text-gray-300">
            {hideClosedPositions
              ? "Hide Closed Positions"
              : "Show Closed Positions"}
          </p>
        </div>
        {!hideClosedPositions ? (
          <svg
            width={40}
            height={24}
            viewBox="0 0 40 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-grow-0 flex-shrink-0 w-10 h-6 relative"
            preserveAspectRatio="none"
          >
            <path
              d="M0 12C0 5.37258 5.37258 0 12 0H28C34.6274 0 40 5.37258 40 12C40 18.6274 34.6274 24 28 24H12C5.37258 24 0 18.6274 0 12Z"
              fill="#64D5E4"
            />
            <circle cx={28} cy={12} r={8} fill="white" />
          </svg>
        ) : (
          <svg
            width={40}
            height={24}
            viewBox="0 0 40 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-grow-0 flex-shrink-0 w-10 h-6 relative"
            preserveAspectRatio="none"
          >
            <path
              d="M0 12C0 5.37258 5.37258 0 12 0H28C34.6274 0 40 5.37258 40 12C40 18.6274 34.6274 24 28 24H12C5.37258 24 0 18.6274 0 12Z"
              fill="#3E4A5C"
            />
            <path
              d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z"
              fill="#F3F4F6"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
