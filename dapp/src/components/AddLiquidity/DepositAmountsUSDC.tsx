import TokenAmountSection, {
  TokenAmountSectionProps,
} from "../TokenAmountSection";
import { useTokenBalance } from "@/hooks/token/useTokenBalance";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { Controller, useFormContext } from "react-hook-form";

export type DepositAmountsUSDCProps = {} & Omit<
  TokenAmountSectionProps,
  "walletAmount"
>;

export const depositAmountsUSDCSchema = Yup.object({
  maxAmount: Yup.number().default(0),
  amount: Yup.string()
    .required()
    .default("")
    .test(
      "amount-test",
      "Invalid Amount",
      (value, context) =>
        parseFloat(value) <= context.parent.maxAmount && parseFloat(value) > 0,
    ),
});

export type DepositAmountUSDCSchema = Yup.InferType<
  typeof depositAmountsUSDCSchema
>;

export default function DepositAmountsUSDC({
  value,
  setValue,
  fiatValue,
  token,
}: DepositAmountsUSDCProps) {
  const { control, setValue: setValueForm } =
    useFormContext<DepositAmountUSDCSchema>();

  const [walletAmount, setWalletAmount] = useState(0);

  const { getFormattedBalance } = useTokenBalance(token, token);

  useEffect(() => {
    (async () => {
      const [balance] = await getFormattedBalance();
      balance && setWalletAmount(balance);
    })();
  }, [getFormattedBalance]);

  useEffect(
    () => setValueForm("maxAmount", walletAmount),
    [setValueForm, walletAmount],
  );

  useEffect(
    () =>
      setValueForm("amount", value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      }),
    [value, setValueForm],
  );

  return (
    <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-6 pb-6 rounded-3xl bg-[#12131a] border border-[#273345]">
      <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 h-[68px] px-8 py-6 border-t-0 border-r-0 border-b border-l-0 border-[#191d26]">
        <div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 w-[216.5px] relative gap-0.5">
          <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white">
            Deposit amounts
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 px-1 gap-3">
        <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-full md:w-[308px] gap-2">
          <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 h-[72px] rounded-lg bg-[#191d26] border border-[#191d26]">
            <Controller
              render={({ field, fieldState }) => (
                <TokenAmountSection
                  value={field.value}
                  setValue={(value) => {
                    field.onBlur();
                    setValue(value);
                  }}
                  walletAmount={walletAmount}
                  token={token}
                  fiatValue={fiatValue ?? "-"}
                  isValid={!fieldState.invalid}
                />
              )}
              name="amount"
              control={control}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
