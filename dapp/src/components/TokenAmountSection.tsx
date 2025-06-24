import CoinImage from "./CoinImage";
import { useCallback, useEffect, useMemo, useState } from "react";
import structuredTokens from "@/assets/coins/structured_tokens.json";
import { Token } from "@uniswap/sdk-core";

import { TokenData } from "@/hooks/token/useTokenData";
import { isWETH } from '@/utils/smartcontract';

export type TokenAmountSectionProps = {
  token: Token | TokenData;
  value: string;
  fiatValue: string;
  setValue(value: string): void;
  walletAmount: number;
  isValid: boolean;
  disabled?: boolean;
};

const debounce = (func: any, timeout = 300) => {
  let timer: any;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func?.apply(this, args);
    }, timeout);
  };
};

export default function TokenAmountSection({
  value,
  fiatValue,
  setValue,
  token,
  walletAmount,
  isValid,
  disabled,
}: TokenAmountSectionProps) {
  const [rawValue, setRawValue] = useState<string>("");

  const tokenIconUrl = useMemo(
    () =>
      structuredTokens[
        ("address" in token
          ? token.address.toLowerCase()
          : token.id.toLowerCase()) as keyof typeof structuredTokens
      ]?.iconUrl,
    [token],
  );

  const setValueWithDebounce = useMemo(() => debounce((value: any) => setValue(value), 600), [setValue]);

  useEffect(() => {
    setRawValue(value);
  }, [value]);

  return (
    <div
      className={`flex flex-col justify-center self-stretch h-[72px] gap-2 py-1 px-3 rounded-lg bg-[#191d26] border ${isValid ? "border-[#191d26]" : "border-[#C60F0F]"}`}
    >
      <div className="flex justify-center items-center gap-2">
        <input
          type="text"
          className="w-full text-lg font-medium text-left text-gray-400 bg-transparent border-none outline-none"
          value={rawValue === "0" || rawValue === "0.0" ? "" : rawValue}
          placeholder="0"
          onKeyUp={(e) => setValueWithDebounce(rawValue)}
          onChange={(e) => setRawValue(e.target.value)}
          onBlur={() => setValue(rawValue)}
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          pattern="^[0-9]*[.,]?[0-9]*$"
          minLength={1}
          maxLength={79}
          spellCheck={false}
          disabled={disabled}
        />

        <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5 p-1 rounded-[1000px] bg-[#273345]">
          <CoinImage imagePath={tokenIconUrl} />
          <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative px-1">
            <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-center text-gray-300">
              {isWETH(("address" in token
                ? token.address
                : token.id)) ? "ETH" : token.symbol}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-shrink justify-between items-start">
        <p className="flex-grow-0 flex-shrink-0 text-xs text-left text-gray-400">
          {fiatValue}
        </p>
        <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-1">
          <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-left text-gray-400">
            Balance: {walletAmount}
          </p>
          <p
            className="flex-grow-0 flex-shrink-0 text-xs font-medium text-left text-[#64d5e4] cursor-pointer"
            onClick={() => {
              setValue(walletAmount.toString());
            }}
          >
            Max
          </p>
        </div>
      </div>
    </div>
  );
}
