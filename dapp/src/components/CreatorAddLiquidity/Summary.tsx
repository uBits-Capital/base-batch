import { SLIPPAGE_TOLERANCE } from "@/config";
import { useFiatValue } from "@/hooks/useFiatValue";
import { useSumOfFiatValues } from "@/hooks/useSumOfFiatValues";
import { PoolData } from "@/hooks/pool/usePoolData";
import { useFormState } from "react-hook-form";
import { toInt } from "@/utils/math";
import { useAccount } from "wagmi";

export type SummaryProps = {
  poolData: PoolData;
  amount0: string;
  amount1: string;
  slippage: string;
};

export default function Summary({ poolData, amount0, amount1, slippage }: SummaryProps) {
  const { isValid } = useFormState();
  const { isDisconnected } = useAccount();

  const fiatAmount0 = useFiatValue(
    poolData.token0,
    toInt(amount0, poolData.token0.decimals),
  );
  const fiatAmount1 = useFiatValue(
    poolData.token1,
    toInt(amount1, poolData.token1.decimals),
  );
  const [, , totalAmount] = useSumOfFiatValues([], [fiatAmount0, fiatAmount1]);

  return (
    <div className="sticky top-10 mt-[-95px] flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-[400px] rounded-3xl bg-[#12131a] border border-[#273345]">
      <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 h-[68px] px-8 py-6 border-t-0 border-r-0 border-b border-l-0 border-[#191d26]">
        <div className="flex justify-start items-center flex-grow relative gap-0.5">
          <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white">
            Summary
          </p>
        </div>
      </div>

      <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 px-8 pt-6 pb-8">
        <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-[336px] overflow-hidden gap-8">
          <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-6">
            <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-3">
              <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0 relative">
                <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5">
                  <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-300">
                    Max. slippage
                  </p>
                  <svg
                    width={93}
                    height={2}
                    viewBox="0 0 93 2"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="self-stretch flex-grow-0 flex-shrink-0"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 1H92"
                      stroke="#4B5563"
                      strokeLinecap="square"
                      strokeDasharray="2 3"
                    />
                  </svg>
                </div>
                <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-400">
                  {slippage}%
                </p>
              </div>
              <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0 relative">
                <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-300">
                  Total deposit cost
                </p>
                <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-400">
                  {totalAmount}
                </p>
              </div>
            </div>
          </div>
          <div
            className={`flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-1 px-4 py-3 rounded-[1000px] ${isValid ? "text-[#12131A] bg-white" : "text-gray-500 bg-[#273345]"}`}
          >
            <button
              className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-1"
              disabled={!isValid || isDisconnected}
            >
              <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left">
                {isDisconnected
                  ? "Connect your wallet"
                  : !isValid
                    ? "Enter amounts"
                    : "Add liquidity"}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
