"use client";
import Row from "@/components/Portfolio/Table/Row";
import { PositionData } from "@/hooks/position/usePositions";
import { useAccount } from "wagmi";

export type TableProps = {
  positions: Record<string, PositionData<true>>;

  selectedPosition?: string;
  setSelectedPosition(positionId: string): void;
};

export default function Table({
  positions,
  selectedPosition,
  setSelectedPosition,
}: TableProps) {
  const { isConnected } = useAccount();

  return (
    <div className="z-[-1] flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 w-[320px] md:w-[664px] rounded-3xl bg-[#12131a] border border-[#273345]">
      <div className="sticky top-10 flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 h-16 gap-2 px-8 py-5 border-t-0 border-r-0 border-b border-l-0 border-[#273345]">
        <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white">
          My positions
        </p>
      </div>

      <div className=" flex flex-col justify-center items-center self-stretch flex-grow gap-4 p-6">
        {isConnected ? (
          Object.keys(positions).length ? (
            Object.values(positions).map((positionData) => (
              <Row
                key={positionData.positionId}
                position={positionData}
                selected={selectedPosition === positionData.positionId}
                onSelect={() => setSelectedPosition(positionData.positionId)}
              />
            ))
          ) : (
            <div className="w-full text-center text-gray-400">No results</div>
          )
        ) : (
          <div className="w-full text-center text-gray-400">
            Connect your wallet to check your Portfolio
          </div>
        )}
      </div>
    </div>
  );
}
