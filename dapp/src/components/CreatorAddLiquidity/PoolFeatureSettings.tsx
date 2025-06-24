import * as Yup from "yup";
import { useFormContext } from "react-hook-form";
import { useCallback } from "react";

const MIN_PERFORMANCE_FEE = 10;
const MAX_PERFORMANCE_FEE = 90;
const POOL_NAME_MAX_SIZE = 50;
const POOL_STRATEGY_DESCRIPTION_MAX_SIZE = 300;

export const poolFeatureSettingsSchema = Yup.object({
  performanceFee: Yup.number()
    .required()
    .min(MIN_PERFORMANCE_FEE)
    .max(MAX_PERFORMANCE_FEE)
    .default(10),
  poolName: Yup.string().required().max(POOL_NAME_MAX_SIZE).default(""),
  strategyDescription: Yup.string().max(POOL_STRATEGY_DESCRIPTION_MAX_SIZE),
});

export type PoolFeatureSettingsSchema = Yup.InferType<
  typeof poolFeatureSettingsSchema
>;

export default function PoolFeatureSettings() {
  const { register, setValue, watch } =
    useFormContext<PoolFeatureSettingsSchema>();

  const clampPerformanceFee = useCallback(
    ({ target: { value } }: any) =>
      setValue("performanceFee", Math.max(10, Math.min(value, 90))),
    [setValue],
  );

  return (
    <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-6 rounded-3xl bg-[#12131a] border border-[#273345]">
      <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 h-[68px] gap-[217px] px-8 py-6 border-t-0 border-r-0 border-b border-l-0 border-[#191d26]">
        <div className="flex justify-start items-center flex-grow relative gap-0.5">
          <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white">
            Pool feature settings
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-8 px-8">
        <div className="flex justify-between items-center flex-grow-0 flex-shrink-0 w-[628px]">
          <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-[487px] gap-2">
            <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-2">
              <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
                <p className="flex-grow-0 flex-shrink-0 text-sm text-left text-white">
                  Performance fee
                </p>
              </div>
              <p className="self-stretch flex-grow-0 flex-shrink-0 w-[487px] text-xs font-medium text-left text-gray-300">
                Add the performance fee that will be charged on top of the
                collected fees (min. 10%)
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 gap-2">
            <div className="flex justify-end items-center self-stretch flex-grow-0 flex-shrink-0 h-11 relative px-3 rounded-lg bg-[#191d26] border border-[#191d26]">
              <input
                type="number"
                min="10" 
                max="90"
                className="flex-grow-0 flex-shrink-0 text-base text-left text-white bg-transparent w-12 outline-none"
                {...register("performanceFee", { onBlur: clampPerformanceFee })}
              />
              <span className="flex-grow-0 flex-shrink-0 text-base text-left text-gray-400">
                %
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-6 px-8 pb-8">
        <div className="flex justify-between items-center flex-grow-0 flex-shrink-0 w-[628px]">
          <div className="flex flex-col justify-start items-start flex-grow gap-2">
            <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-2">
              <p className="flex-grow-0 flex-shrink-0 text-sm text-left text-white">
                Pool Name
              </p>
              <div className="flex justify-between w-full">
                <p className="self-stretch flex-grow-0 flex-shrink-0 text-xs font-medium text-left text-gray-300">
                  Name your pool
                </p>
                <p className="flex-grow-0 flex-shrink-0 text-[10px] text-left text-gray-400">
                  {watch("poolName").length}/{POOL_NAME_MAX_SIZE}
                </p>
              </div>
              <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 h-11 relative px-3 rounded-lg bg-[#273345] border border-[#191d26]">
                <input
                  type="text"
                  maxLength={POOL_NAME_MAX_SIZE}
                  className="flex-grow w-[581px] text-base text-left text-gray-400 bg-transparent border-none outline-none"
                  placeholder="Enter pool name"
                  {...register("poolName")}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-2">
          <p className="flex-grow-0 flex-shrink-0 text-sm text-left text-white">
            Strategy Description
          </p>
          <div className="flex justify-between w-full">
            <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-left text-gray-300">
              Describe your pool strategy
            </p>
            <p className="flex-grow-0 flex-shrink-0 text-[10px] text-left text-gray-400">
              {watch("strategyDescription")?.length ?? 0}/
              {POOL_STRATEGY_DESCRIPTION_MAX_SIZE}
            </p>
          </div>
          <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 min-h-11 relative p-3 rounded-lg bg-[#273345] border border-[#191d26]">
            <textarea
              maxLength={300}
              className="flex-grow w-[581px] text-base text-left text-gray-400 bg-transparent border-none outline-none"
              placeholder="Enter pool strategy"
              {...register("strategyDescription")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
