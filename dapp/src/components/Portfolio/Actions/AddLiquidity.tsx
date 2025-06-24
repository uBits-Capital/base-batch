import { useEffect, useMemo, useState } from "react";
import { PositionData } from "@/hooks/position/usePositions";
import { useAddLiquidityState } from "@/hooks/liquidity/useAddLiquidityState";
import { useTokenBalance } from "@/hooks/token/useTokenBalance";
import TokenAmountSection from "@/components/TokenAmountSection";
import AddLiquidityModal from "../Modals/AddLiquidity";
import { toInt } from "@/utils/math";
import Gear from "@/assets/gear.svg";
import Image from "next/image";
import SlippageSettings from '../../SlippageSettings';
import { SLIPPAGE_TOLERANCE } from '@/config';
import { Percent } from '@uniswap/sdk-core';

interface AddLiquidityProps {
  back: () => void;
  onSuccess: () => void;
  positionData: PositionData<true>;
}

export default function AddLiquidity({
  positionData,
  onSuccess,
  back,
}: AddLiquidityProps) {
  const {
    token,
    loading,
    amountToAdd,
    rawAmountToAdd,
    fiatAmount,
    setAmountToAdd,
    totalDepositCost,
  } = useAddLiquidityState();

  const [showModal, setShowModal] = useState(false);
  const [walletAmountToken0, setWalletAmountToken0] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState(SLIPPAGE_TOLERANCE.toFixed(2));

  const { getFormattedBalance } = useTokenBalance(token, token);

  const isValid = useMemo(
    () =>
      rawAmountToAdd > 0 &&
      toInt(walletAmountToken0, token?.decimals || 6) >= rawAmountToAdd,
    [walletAmountToken0, rawAmountToAdd, token],
  );

  useEffect(() => {
    (async () => {
      const [balance] = await getFormattedBalance();
      balance && setWalletAmountToken0(balance);
    })();
  }, [getFormattedBalance]);

  return (
    <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-full md:w-[400px] min-h-[450px] md:h-full rounded-3xl bg-[#12131a] md:border md:border-[#273345]">
      <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 h-[68px] px-8 py-6 border-t-0 border-r-0 border-b border-l-0 border-[#191d26]">
        <div
          className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5 p-2 rounded-[1000px] cursor-pointer"
          onClick={() => showSettings ? setShowSettings(false) : back()}
        >
          <svg
            width={16}
            height={16}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-grow-0 flex-shrink-0 w-4 h-4 relative"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.28672 3.37978C7.48199 3.57505 7.48199 3.89163 7.28672 4.08689L3.87361 7.5H13.3332C13.6093 7.5 13.8332 7.72386 13.8332 8C13.8332 8.27615 13.6093 8.5 13.3332 8.5H3.87361L7.28672 11.9131C7.48199 12.1084 7.48199 12.425 7.28672 12.6202C7.09146 12.8155 6.77488 12.8155 6.57962 12.6202L2.31295 8.35356C2.11769 8.1583 2.11769 7.84171 2.31295 7.64645L6.57962 3.37978C6.77488 3.18452 7.09146 3.18452 7.28672 3.37978Z"
              fill="#9CA3AF"
            />
          </svg>
        </div>
        <div className="flex justify-between items-center flex-grow relative pr-4">
          <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white break-words max-w-[30ch] whitespace-normal">
            {positionData.featureSettings.name}
          </p>
        </div>
        <Image
          src={Gear}
          width={204}
          height={204}
          alt="Gear"
          className="w-6 h-6 object-cover cursor-pointer"
          onClick={() => setShowSettings(!showSettings)}
        />
      </div>
      {
        !showSettings ? (<div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0">
          <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 h-[68px] px-8 py-6 border-t-0 border-r-0 border-b border-l-0 border-[#191d26]">
            <div className="flex justify-between items-center flex-grow relative">
              <p className="flex-grow-0 flex-shrink-0 text-3xl font-medium text-left text-white">
                Add liquidity
              </p>
            </div>
          </div>
          {!token || loading ? (
            <div className="pt-8 pb-12 text-gray-400 text-center w-full">
              Loading...
            </div>
          ) : (
            <>
              <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-6 px-6">
                <TokenAmountSection
                  token={token}
                  value={amountToAdd}
                  fiatValue={fiatAmount}
                  setValue={setAmountToAdd}
                  walletAmount={walletAmountToken0}
                  isValid={isValid}
                />
              </div>
              <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 px-8 pt-6 pb-8">
                <div className="flex flex-col justify-start items-start flex-grow overflow-hidden gap-2">
                  <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0 relative">
                    <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-300">
                      Max. Slippage
                    </p>
                    <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-400">
                      {slippage}%
                    </p>
                  </div>
                  <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0">
                    <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5">
                      <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-300">
                        Total deposit cost
                      </p>
                    </div>
                    <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5">
                      <p className="flex-grow-0 flex-shrink-0 text-sm font-medium text-right text-white">
                        {totalDepositCost}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-6 pb-6">
                    <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0">
                      <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5">
                        <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-300">
                          Your new position in this pool
                        </p>
                      </div>
                      <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5">
                        <p className="flex-grow-0 flex-shrink-0 text-sm font-medium text-right text-white">
                          {fiatAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-1 px-4 py-3 rounded-[1000px] ${isValid ? "text-[#12131A] bg-white" : "text-gray-500 bg-[#273345]"}`}
                  >
                    <button
                      className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-1"
                      disabled={!isValid}
                      onClick={() => setShowModal(true)}
                    >
                      <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left">
                        {isValid ? "Add Liquidity (preview)" : "Enter amounts"}
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>) :
          (<SlippageSettings
            show={showSettings}
            initialSlippage={new Percent(Number((parseFloat(slippage) * 100).toFixed(0)), 10_000)}
            onSlippageChanged={(slippage: Percent) => {
              setSlippage(slippage.toFixed(2));
            }} />)
      }


      {
        showModal && (
          <AddLiquidityModal
            positionData={positionData}
            usdcAmount={rawAmountToAdd}
            fiatAmount={fiatAmount}
            slippage={Number(slippage)}
            onClose={() => setShowModal(false)}
            onSuccess={onSuccess}
          />
        )
      }
    </div >
  );
}
