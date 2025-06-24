import { PositionData } from "@/hooks/position/usePositions";
import { fromInt } from "@/utils/math";
import { TokenImage } from "@/components/TokenImage";
import { isWETH } from '@/utils/smartcontract';

export const TokenPairAmount = ({
  positionData,
  amount0,
  amount1,
}: {
  positionData: PositionData<true>;
  amount0?: number;
  amount1?: number;
}) => {
  return (
    <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 gap-4 p-3 md:p-6 rounded-2xl bg-[#191d26]">
      <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-3">
        <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-2">
          <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
            <TokenImage token={positionData?.token0} />
            <p className="flex-grow-0 flex-shrink-0 text-[12px] md:text-sm text-left text-gray-300">
              {isWETH(positionData?.token0?.id) ? "ETH" : positionData?.token0?.symbol}
            </p>
          </div>
          <p className="flex-grow-0 flex-shrink-0 text-[12px] md:text-sm font-medium text-left text-white">
            {amount0
              ? amount0
              : fromInt(positionData?.rewards0, positionData?.token0?.decimals)}
          </p>
        </div>
        <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-2">
          <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
            <TokenImage token={positionData?.token1} />
            <p className="flex-grow-0 flex-shrink-0 text-[12px] md:text-sm text-left text-gray-300">
              {isWETH(positionData?.token1?.id) ? "ETH" : positionData?.token1?.symbol}
            </p>
          </div>
          <p className="flex-grow-0 flex-shrink-0 text-[12px] md:text-sm font-medium text-left text-white">
            {amount1
              ? amount1
              : fromInt(positionData?.rewards1, positionData?.token1?.decimals)}
          </p>
        </div>
      </div>
    </div>
  );
};

export const TokenUSDCAmount = ({ amount }: { amount: string; }) => {
  return (
    <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 gap-1 p-3 md:p-6 rounded-2xl bg-[#191d26]">
      <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 gap-3">
        <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 relative">
          <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-grow-0 flex-shrink-0 w-6 h-6 relative"
              preserveAspectRatio="xMidYMid meet"
            >
              <rect width={24} height={24} rx={12} fill="#2775CA" />
              <path
                d="M15.2996 13.9C15.2996 12.15 14.2496 11.55 12.1496 11.3001C10.6496 11.1 10.3496 10.7001 10.3496 9.99998C10.3496 9.2999 10.8496 8.85002 11.8496 8.85002C12.7496 8.85002 13.2496 9.15002 13.4996 9.90002C13.5496 10.05 13.6996 10.15 13.8496 10.15H14.6495C14.8496 10.15 14.9996 9.99998 14.9996 9.80006V9.75002C14.7995 8.64998 13.8995 7.80002 12.7496 7.70006V6.50006C12.7496 6.30002 12.5996 6.15002 12.3496 6.09998H11.5996C11.3996 6.09998 11.2496 6.24998 11.1995 6.50006V7.65002C9.69953 7.85006 8.74961 8.85002 8.74961 10.1001C8.74961 11.7501 9.74957 12.4 11.8496 12.6501C13.2496 12.9 13.6996 13.2 13.6996 14.0001C13.6996 14.8001 12.9995 15.3501 12.0496 15.3501C10.7495 15.3501 10.2995 14.8 10.1495 14.05C10.0996 13.8501 9.94961 13.75 9.79961 13.75H8.94953C8.74961 13.75 8.59961 13.9 8.59961 14.1V14.1501C8.79953 15.4 9.59957 16.3 11.2496 16.5501V17.7501C11.2496 17.95 11.3996 18.1 11.6495 18.15H12.3995C12.5996 18.15 12.7496 18 12.7996 17.7501V16.5501C14.2996 16.3 15.2996 15.25 15.2996 13.9Z"
                fill="white"
              />
              <path
                d="M9.45 19.15C5.55 17.7501 3.54996 13.4001 5.00004 9.54998C5.75004 7.44998 7.40004 5.85002 9.45 5.10002C9.65004 5.00006 9.75 4.85006 9.75 4.59998V3.90002C9.75 3.69998 9.65004 3.54998 9.45 3.50006C9.39996 3.50006 9.3 3.50006 9.24996 3.54998C4.5 5.04998 1.89996 10.1001 3.39996 14.85C4.29996 17.65 6.45 19.8 9.24996 20.7C9.45 20.8 9.65004 20.7 9.69996 20.5C9.75 20.4501 9.75 20.4 9.75 20.3001V19.6C9.75 19.45 9.6 19.2501 9.45 19.15ZM14.75 3.54998C14.55 3.45002 14.35 3.54998 14.3 3.75002C14.25 3.80006 14.25 3.84998 14.25 3.95006V4.65002C14.25 4.85006 14.4 5.04998 14.55 5.15006C18.45 6.54998 20.45 10.9 19 14.7501C18.25 16.8501 16.6 18.45 14.55 19.2C14.35 19.3 14.25 19.45 14.25 19.7001V20.4C14.25 20.6001 14.35 20.7501 14.55 20.8C14.6 20.8 14.7 20.8 14.75 20.7501C19.5 19.2501 22.1 14.2 20.6 9.45002C19.7 6.60002 17.5 4.44998 14.75 3.54998Z"
                fill="white"
              />
            </svg>
            <p className="flex-grow-0 flex-shrink-0  text-[12px] md:text-sm text-left text-gray-300">
              USDC
            </p>
          </div>
          <p className="flex-grow-0 flex-shrink-0  text-[12px] md:text-sm font-medium text-left text-white">
            {amount}
          </p>
        </div>
      </div>
    </div>
  );
};
