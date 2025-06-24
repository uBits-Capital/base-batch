"use client";

import BalanceSummary from "./BalanceSummary";
import Table from "./Table";
import { useCallback, useEffect, useState } from "react";
import { PositionData, usePositions } from "@/hooks/position/usePositions";
import { useAccount } from "wagmi";
import ActionSelector from "@/components/Portfolio/Actions";
import { watchAccount } from 'wagmi/actions';
import { wagmiConfig } from "@/wagmi";

interface Layout {
  className?: string;
  close: () => void;
  children: React.ReactNode;
}

const ModalMobile = ({ children, close }: Layout) => {
  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 z-10 h-screen ">
        <div className="w-full h-screen absolute bottom-0 bg-[#ffff]/30 backdrop-blur m-auto" />
        <div className="flex  items-center justify-center  text-center">
          <div className="flex flex-col justify-center items-center  bg-[#12131a] ">
            <div className="fixed z-10 w-screen flex justify-center items-center bottom-0 px-1 mx-auto  overflow-hidden bg-[#12131a] rounded-t-2xl ">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>);
};

export default function Portfolio() {
  const [selectedPosition, setSelectedPosition] = useState<string>();
  const [positions, setPositions] = useState<
    Record<string, PositionData<true>>
  >({});

  const { isDisconnected, address } = useAccount();
  const { data, loading, refresh } = usePositions<true>({
    accountAddress: address ?? "0x",
  });

  const updatePositionsHandler = useCallback((hide: boolean = true) => {
    if (!data) return;
    const positionsData: Record<string, PositionData<true>> = {};
    for (let i = 0; i < data?.length; i++) {
      if (hide && data[i].closed && data[i].amount0 === BigInt(0) && data[i].amount1 === BigInt(0)) {
        continue;
      } else {
        positionsData[data[i].positionId] = data[i];
      }
    }
    setPositions(positionsData);
  }, [data]);

  useEffect(() => {
    updatePositionsHandler();
  }, [data]);

  useEffect(() => {
    if (isDisconnected) {
      setSelectedPosition(undefined);
    }
  }, [isDisconnected]);

  useEffect(() => {
    const unwatch = watchAccount(wagmiConfig, {
      onChange(data) {
        if (data.address !== address) {
          setSelectedPosition(undefined);
        }
      }
    });
    // Cleanup by calling unwatch to unsubscribe from the account change event
    return () => unwatch();
  }, [address]);

  useEffect(() => {
    if (selectedPosition && positions[selectedPosition]?.operator === address && positions[selectedPosition]?.closed) {
      setSelectedPosition(undefined);
    }
  }, [address, positions, selectedPosition]);

  return (
    <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 gap-5">
      <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 gap-8">
        <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 gap-2">
          <p className="flex-grow-0 flex-shrink-0 text-3xl font-medium text-left text-white">
            Portfolio
          </p>
        </div>

        {loading ? (
          <>Loading...</>
        ) : (
          <div className="z-[0] flex justify-start items-start flex-grow-0 flex-shrink-0 gap-5">
            <div className="z-[0] flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 gap-6 ">
              <BalanceSummary positions={positions}
                onHideClosedPositions={(hide) => {
                  setSelectedPosition(undefined);
                  updatePositionsHandler(hide);
                }} />

              <Table
                positions={positions}
                selectedPosition={selectedPosition}
                setSelectedPosition={(positionId) => {
                  setSelectedPosition(undefined);
                  setTimeout(() => {
                    setSelectedPosition(positionId);
                  }, 150);
                }}
              />
            </div>

            {selectedPosition && (
              <div className="hidden md:flex sticky top-5" >
                <ActionSelector
                  positionData={positions[selectedPosition]}
                  onActionSuccess={() => {
                    refresh();
                  }}
                />
              </div>
            )}
            {selectedPosition && (<div className="flex md:hidden" >
              <ModalMobile
                close={() => {
                  setSelectedPosition(undefined);
                }}
              > <ActionSelector
                  positionData={positions[selectedPosition]}
                  onActionSuccess={() => {
                    refresh();
                  }}
                  close={() => {
                    setSelectedPosition(undefined);
                  }}
                />
              </ModalMobile>
            </div>)}
            {!selectedPosition && (
              <>
                <div className="hidden md:flex sticky top-5 flex-col justify-center items-center flex-grow-0 flex-shrink-0 w-[516px] rounded-3xl bg-[#12131a] border border-[#273345] ">
                  <div className="flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 h-[68px] px-8 py-6 border-t-0 border-r-0 border-b border-l-0 border-[#191d26]">
                    <div className="flex justify-center items-center flex-grow relative">
                      <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white">
                        Select your position
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center items-start self-stretch flex-grow-0 flex-shrink-0 px-8 pt-6 pb-8">
                    <div className="flex flex-col justify-center items-start flex-grow overflow-hidden gap-8">
                      <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 gap-6">
                        <div className="flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0">
                          <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5">
                            <p className="flex-grow-0 flex-shrink-0 text-sm text-right text-gray-400">
                              Select the position you want to manage.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
