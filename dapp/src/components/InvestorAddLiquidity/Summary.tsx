import { useFormState } from "react-hook-form";
import { useAccount } from "wagmi";

export type SummaryProps = {
  feeValue: string;
  depositCost: string;
  slippage: string;
  maxInvestorsLimitReached: boolean;
};

export default function Summary({ feeValue, depositCost, slippage, maxInvestorsLimitReached }: SummaryProps) {
  const { isDisconnected } = useAccount();
  const { isValid } = useFormState();

  return (
    <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-[320px] md:w-[400px] rounded-3xl bg-[#12131a] border border-[#273345]">
      <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 h-[68px] px-8 py-6 border-t-0 border-r-0 border-b border-l-0 border-[#191d26]">
      <div className="flex justify-start items-center flex-grow relative gap-0.5">
          <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white">
            Summary
          </p>
        </div>
      </div>

      <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 px-8 pt-6 pb-8">
        <div className="flex flex-col justify-start items-start flex-grow w-full gap-8">
          <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-6">
            <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-3">
              <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0 relative">
                <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative">
                  <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-300">
                    Fee (0,25%)
                  </p>
                  <svg
                    width={82}
                    height={2}
                    viewBox="0 0 82 2"
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
                  {feeValue}
                </p>
              </div>
              {/* TODO: Calculate the values based on PP-28 */}
              {/* <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0 relative">
                <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-300">
                  Price Impact
                </p>
                <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-400">
                  N/A
                </p>
              </div> */}
              <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0 relative">
                <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-300">
                  Max. Slippage
                </p>
                <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-400">
                  {slippage}%
                </p>
              </div>
              {/* <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0 relative">
                <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-300">
                  Receive at least
                </p>
                <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-400">
                  N/A
                </p>
              </div> */}
              <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0 relative">
                <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-300">
                  Total deposit cost
                </p>
                <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-400">
                  {depositCost}
                </p>
              </div>
            </div>
          </div>
          <div
            className={`flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-1 rounded-[1000px] ${isValid && !isDisconnected && !maxInvestorsLimitReached ? "text-[#12131A] bg-white" : "text-gray-500 bg-[#273345]"}`}
          >
            <button
              className="flex justify-center items-center w-full h-full px-5 py-3 relative"
              disabled={!isValid || isDisconnected || maxInvestorsLimitReached}
            >
              <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left">
                {maxInvestorsLimitReached? "Max investors reached" : !isValid ? "Enter amounts" : "Add liquidity"} 
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
