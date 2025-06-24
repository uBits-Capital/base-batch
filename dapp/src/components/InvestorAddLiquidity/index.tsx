"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DepositAmountsUSDC, {
  depositAmountsUSDCSchema,
} from "@/components/AddLiquidity/DepositAmountsUSDC";
import PairTokenHeader from "@/components/PairToken/Header";
import Summary from "./Summary";
import { PositionData, usePositions } from "@/hooks/position/usePositions";
import { usePoolData } from "@/hooks/pool/usePoolData";
import { BIPS_BASE } from "@/constants";
import Failed from "@/components/TransactionModal/Failed";
import { redirectToPools, redirectToPortfolio } from "@/app/actions/redirects";
import { useAddLiquidityState } from "@/hooks/liquidity/useAddLiquidityState";
import { useAccount } from "wagmi";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import AddLiquidity from "@/components/Portfolio/Modals/AddLiquidity";
import ConnectWalletModal from '../ConnectWalletModal';
import { MAX_INVESTORS, SLIPPAGE_TOLERANCE } from '@/config';
import SlippageSettings from '../SlippageSettings';
import { Percent } from '@uniswap/sdk-core';
import Image from "next/image";
import Gear from "@/assets/gear.svg";
// import { useAutoRoute } from '@/hooks/useAutoRoute';

export type InvestorAddLiquidityParams = {
  positionId: string;
};

const schema = Yup.object().concat(depositAmountsUSDCSchema);

type FormData = Yup.InferType<typeof schema>;

export default function InvestorAddLiquidity({
  positionId,
}: InvestorAddLiquidityParams) {

  const { data: positionData, loading } = usePositions({
    poolAddress: positionId,
  });


  const [showModal, setShowModal] = useState(false);
  const [showModalConnectWallet, setShowModalConnectWallet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState(SLIPPAGE_TOLERANCE.toFixed(2));

  const position = useMemo(() => {
    return positionData?.[0] || {} as PositionData;
  }, [positionData]);

  const { isDisconnected, isConnecting } = useAccount();
  const { data: poolData, loading: tokenLoading } = usePoolData(
    position.token0?.id || "",
    position.token1?.id || "",
    ((position.fee ? position.fee : 100) * BIPS_BASE).toString(),
  );

  const {
    token,
    amountToAdd,
    setAmountToAdd,
    fiatAmount,
    loading: addLiquidityLoading,
    totalDepositCost,
    feeCost,
    rawAmountToAdd,
  } = useAddLiquidityState();

  // const {
  //   bestRoute: bestRoute0,
  //   loading: bestRoute0Loading,
  // } = useAutoRoute(positionData.token0, amountToAdd, Number(slippage));

  // useEffect(() => {
  //   if (!bestRoute0) return;
  //   console.log("bestRoute0", bestRoute0);
  // }, [bestRoute0, bestRoute0Loading]);

  const methods = useForm<FormData>({
    defaultValues: schema.cast({}),
    resolver: yupResolver(schema),
    mode: "onBlur",
    criteriaMode: "all",
  });
  const { handleSubmit } = methods;

  const onSubmit = useCallback(() => setShowModal(true), []);

  useEffect(() => {
    setShowModalConnectWallet(isDisconnected || isConnecting);
    setShowModal(false);
  }, [isDisconnected, isConnecting]);

  const maxInvestorsLimitReached = useMemo(() => {
    return position?.totalInvestors >= MAX_INVESTORS;
  }, [position]);

  if (tokenLoading || addLiquidityLoading || loading) return <>Loading...</>;

  if ((!positionData?.length && !loading) || !poolData || !token) {
    return <Failed error="" close={() => redirectToPools()} />;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 gap-5">
          <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 gap-8">
            <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 gap-2">
              <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 gap-3">
                <div
                  className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2 cursor-pointer"
                  onClick={() => redirectToPools()}
                >
                  <svg
                    width="6"
                    height="10"
                    viewBox="0 0 6 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M5.40838 0.368387C5.60983 0.557252 5.62004 0.87367 5.43117 1.07513L1.75177 4.99982L5.43117 8.92452C5.62004 9.12598 5.60983 9.44239 5.40838 9.63126C5.20692 9.82012 4.8905 9.80992 4.70164 9.60846L0.701638 5.34179C0.521329 5.14946 0.521329 4.85018 0.701638 4.65785L4.70164 0.391185C4.8905 0.189729 5.20692 0.179522 5.40838 0.368387Z"
                      fill="#D1D5DB"
                    />
                  </svg>
                  <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-gray-300">
                    All Pools
                  </p>
                </div>

                <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
                  <p className="flex-grow-0 flex-shrink-0 text-3xl font-medium text-left text-white">
                    Add liquidity
                  </p>
                </div>
                {/* {bestRoute0Loading && <div role="status">
                  <svg className="w-[50px] h-[50px] text-gray-200 animate-spin dark:text-gray-600 fill-green-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                  </svg>
                </div>} */}
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
            <div className="flex flex-col md:flex-row justify-start items-start flex-grow-0 flex-shrink-0 gap-5">

              <div className="flex flex-col w-[320px] md:w-[692px] justify-start items-start flex-grow-0 flex-shrink-0 gap-5">

                {showSettings &&
                  (<div className="flex md:hidden">
                    <SlippageSettings
                      show={showSettings}
                      initialSlippage={new Percent(Number((parseFloat(slippage) * 100).toFixed(0)), 10_000)}
                      onSlippageChanged={(slippage: Percent) => {
                        setSlippage(slippage.toFixed(2));
                      }} />
                  </div>)
                }
                <PairTokenHeader
                  token0={poolData.token0}
                  token1={poolData.token1}
                  poolName={position.featureSettings.name}
                  performanceFee={position.featureSettings.operatorFee}
                  feeTierScaled={poolData.feeTierScaled}
                />

                <DepositAmountsUSDC
                  value={amountToAdd}
                  setValue={setAmountToAdd}
                  fiatValue={fiatAmount}
                  token={token}
                  isValid={true}
                />
              </div>

              {!showSettings ?
                (<Summary
                  slippage={slippage}
                  feeValue={feeCost}
                  depositCost={totalDepositCost}
                  maxInvestorsLimitReached={maxInvestorsLimitReached} />) :
                (<div className="hidden md:flex">
                  <SlippageSettings
                    show={showSettings}
                    initialSlippage={new Percent(Number((parseFloat(slippage) * 100).toFixed(0)), 10_000)}
                    onSlippageChanged={(slippage: Percent) => {
                      setSlippage(slippage.toFixed(2));
                    }} />
                </div>)
              }

              {!isDisconnected && showModal && (
                <AddLiquidity
                  positionData={position}
                  usdcAmount={rawAmountToAdd}
                  fiatAmount={totalDepositCost}
                  slippage={Number(slippage)}
                  onClose={() => setShowModal(false)}
                  onSuccess={() => redirectToPortfolio()}
                />
              )}
              {showModalConnectWallet && <ConnectWalletModal />}
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
