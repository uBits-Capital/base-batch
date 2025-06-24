import { Dispatch, SetStateAction } from "react";

export type PriceRangeToggleProps = {
  isEnabled: boolean;
  setIsEnabled: Dispatch<SetStateAction<boolean>>;
  title: string;
};

export function PriceRangeToggle({
  isEnabled,
  setIsEnabled,
  title,
}: PriceRangeToggleProps) {
  const toggleVisibility = () => {
    setIsEnabled(!isEnabled);
  };

  return (
    <div className="flex justify-end items-center flex-grow-0 flex-shrink-0 gap-2">
      <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5">
        <p className="flex-grow-0 flex-shrink-0 text-xs text-right text-white">
          {title}
        </p>
        <svg
          width={112}
          height={2}
          viewBox="0 0 112 2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="self-stretch flex-grow-0 flex-shrink-0"
          preserveAspectRatio="none"
        >
          <path
            d="M1 1H111"
            stroke="#4B5563"
            strokeLinecap="square"
            strokeDasharray="2 3"
          />
        </svg>
      </div>
      <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
        <div
          onClick={toggleVisibility}
          className="focus:outline-none cursor-pointer"
        >
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
              fill={isEnabled ? "#64D5E4" : "#4B5563"}
            />
            <circle cx={isEnabled ? 28 : 12} cy={12} r={8} fill="white" />
          </svg>
        </div>
      </div>
    </div>
  );
}
