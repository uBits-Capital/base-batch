import { useEffect, useMemo, useState } from "react";
import { SLIPPAGE_TOLERANCE } from "@/config";
import { Percent } from '@uniswap/sdk-core';

interface SlippageSettingsProps {
  show: boolean;
  initialSlippage: Percent;
  onSlippageChanged: (slippage: Percent) => void;
}

export default function SlippageSettings({
  show,
  initialSlippage,
  onSlippageChanged,
}: SlippageSettingsProps) {
  const [slippage, setSlippage] = useState(initialSlippage);
  const [slippageFloat, setSlippageFloat] = useState(initialSlippage.toFixed(2));
  const [auto, setAuto] = useState(initialSlippage.equalTo(SLIPPAGE_TOLERANCE));

  const tooLow = useMemo(() => slippage.lessThan(new Percent(5, 10_000)), [slippage]);
  const tooHigh = useMemo(() => slippage.greaterThan(new Percent(100, 10_000)), [slippage]);

  useEffect(() => {
    if (auto) {
      setSlippageFloat(SLIPPAGE_TOLERANCE.toFixed(2));
      setSlippage(SLIPPAGE_TOLERANCE);
      onSlippageChanged(SLIPPAGE_TOLERANCE);
    }
  }, [auto]);

  if (!show) return null;

  return (
    <>
      <div className="flex flex-col justify-start items-center w-full md:w-[400px] gap-5 p-6 rounded-2xl bg-[#12131a] border border-[#273345]">
        <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-3">
          <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0">
            <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5">
              <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-300">Max. slippage</p>
              <svg
                width={94}
                height={2}
                viewBox="0 0 94 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="self-stretch flex-grow-0 flex-shrink-0"
                preserveAspectRatio="none"
              >
                <path d="M1 1H93" stroke="#4B5563" strokeLinecap="square" strokeDasharray="2 3" />
              </svg>
            </div>
            <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
              <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-white">{auto ? "Auto" : "Custom"} ({slippage.toFixed(2)}%)</p>
            </div>
          </div>
          <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 h-11 ">
            <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 gap-0.5 p-0.5 rounded-lg bg-[#191d26] border border-[#191d26] cursor-pointer "
              onClick={() => setAuto(!auto)}>
              <div className={`flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-1 px-2 py-1.5 rounded-md ${auto ? "bg-[#273345]" : ""}  `}>
                <p className={`flex-grow-0 flex-shrink-0 text-sm font-medium text-left ${!auto ? "text-gray-400" : "text-white"} `}>Auto</p>
              </div>
              <div className={`flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-1 px-2 py-1.5 rounded-md ${!auto ? "bg-[#273345]" : ""}  `}>
                <p className={`flex-grow-0 flex-shrink-0 text-sm font-medium text-left ${!auto ? "text-white" : "text-gray-400"} `}>
                  Custom
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-[80px] gap-2">
              <input
                className="flex w-full h-11 text-base text-left text-gray-400 pl-3 rounded-lg bg-[#191d26] border border-[#191d26]"
                type="number"
                min="0.01"
                max="5"
                step="0.01"
                value={slippageFloat}
                disabled={auto}
                onChange={(e) => {
                  let value = parseFloat(e.target.value);
                  if (value != 0 && value < 0.01) return;
                  setSlippageFloat(e.target.value);
                  value = Number((value * 100).toFixed(0));;
                  const percent = new Percent(value, 10_000);
                  setSlippage(percent);
                  onSlippageChanged(percent);
                }} />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center gap-3 ">
          {(tooLow || tooHigh) && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-yellow-500">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"> </path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          )}
          {tooHigh && (<p className="text-yellow-500">Your transaction may be frontrun and result in an unfavorable trade.</p>)}
          {tooLow && (<p className="text-yellow-500">Slippage below 0.05% may result in a failed transaction</p>)}
        </div>
      </div>
    </>
  );
}
