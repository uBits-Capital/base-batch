import React, { useEffect, useState } from "react";
import { sanitizeNumber } from "@/utils/math";

export type PriceInputProps = {
  price: string;
  setPrice: React.Dispatch<React.SetStateAction<string>>;
  incrementDecrementDisabled?: boolean;
  incrementPrice?(): void;
  decrementPrice?(): void;
  title: string;
  subtitle: string;
};

export default function PriceInput({
  price,
  setPrice,
  title,
  subtitle,
  incrementDecrementDisabled,
  incrementPrice,
  decrementPrice,
}: PriceInputProps) {
  const [rawPrice, setRawPrice] = useState(price);

  useEffect(() => setRawPrice(sanitizeNumber(price)), [price]);

  return (
    <div className="flex justify-between items-center flex-grow h-20 px-3 rounded-lg bg-[#191d26] border border-[#191d26]">
      <div className="flex flex-col justify-start items-start flex-grow relative">
        <p className="flex text-xs font-medium text-left text-gray-400">
          {title}
        </p>
        <input
          type="text"
          value={rawPrice}
          onChange={(e) => setRawPrice(sanitizeNumber(e.target.value))}
          onBlur={() => {
            // Because rawPrice is updated through price and price itself is derived from either tickLower or tickUpper,
            // if neither tick changes after a blur it might leave the input displaying the wrong value.
            // This can be seen (without the fix below) by inputting a value that doesn't conform to the tick spacing,
            // like 0.1, twice. The first time rawPrice will be updated after the blur to reflect the tick spacing,
            // but the second time it will get stuck at 0.1, even though price itself will be set to the correct value.
            // This can be fixed by always updating rawPrice on the next browser tick (setTimeout):
            setTimeout(() => {
              setPrice(rawPrice);
              setRawPrice((newRawPrice) =>
                newRawPrice === rawPrice ? sanitizeNumber(price) : newRawPrice,
              );
            });
          }}
          className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white bg-transparent border-none outline-none w-full"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          pattern="^([0-9]*[.]?[0-9]*)|^[∞]{0,1}$"
          minLength={1}
          maxLength={20}
          spellCheck={false}
        />
        <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-left text-gray-400">
          {subtitle}
        </p>
      </div>
      <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 gap-2">
        <div
          className={`flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5 p-1 rounded-[1000px] border border-[#273345] ${incrementDecrementDisabled ? "bg-[#15191f]" : "bg-[#191d26] cursor-pointer"}`}
          onClick={() => !incrementDecrementDisabled && incrementPrice?.()}
        >
          <svg
            width={12}
            height={12}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-grow-0 flex-shrink-0 w-3 h-3 relative"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.5001 2.2002C6.5001 1.92405 6.27624 1.7002 6.0001 1.7002C5.72396 1.7002 5.5001 1.92405 5.5001 2.2002V5.4002H2.2001C1.86873 5.4002 1.6001 5.66882 1.6001 6.0002C1.6001 6.33157 1.86873 6.60019 2.2001 6.60019H5.5001V9.8002C5.5001 10.0763 5.72396 10.3002 6.0001 10.3002C6.27624 10.3002 6.5001 10.0763 6.5001 9.8002V6.60019H9.8001C10.1315 6.60019 10.4001 6.33157 10.4001 6.0002C10.4001 5.66882 10.1315 5.4002 9.8001 5.4002H6.5001V2.2002Z"
              fill={`${incrementDecrementDisabled ? "#273345" : "#D1D5DB"}`}
            />
          </svg>
        </div>
        <div
          className={`flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5 p-1 rounded-[1000px] border border-[#273345] ${incrementDecrementDisabled ? "bg-[#15191f]" : "bg-[#191d26] cursor-pointer"}`}
          onClick={() => !incrementDecrementDisabled && decrementPrice?.()}
        >
          <svg
            width={12}
            height={12}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-grow-0 flex-shrink-0 w-3 h-3 relative"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.6001 5.9999C1.6001 5.66853 1.86873 5.3999 2.2001 5.3999H9.8001C10.1315 5.3999 10.4001 5.66853 10.4001 5.9999C10.4001 6.33127 10.1315 6.5999 9.8001 6.5999H2.2001C1.86873 6.5999 1.6001 6.33127 1.6001 5.9999Z"
              fill={`${incrementDecrementDisabled ? "#273345" : "#D1D5DB"}`}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
