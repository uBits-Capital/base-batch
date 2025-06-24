import { useAccount } from "wagmi";
import { PositionData } from "@/hooks/position/usePositions";
import { useFiatValue } from "@/hooks/useFiatValue";
import { useSumOfFiatValues } from "@/hooks/useSumOfFiatValues";
import { REWARDS_MAX_FRACTION_DIGITS } from "@/constants";
import InRange from "@/components/InRange";
import Pair from '@/components/PairToken/Pair';

export type RowProps = {
  selected?: boolean;
  position: PositionData<true>;
  onSelect(): void;
};

export default function Row({ selected, position, onSelect }: RowProps) {
  const { address } = useAccount();

  const fiatTotalSupply0 = useFiatValue(position.token0, position.totalSupply0);
  const fiatTotalSupply1 = useFiatValue(position.token1, position.totalSupply1);

  const fiatInvestedAmount0 = useFiatValue(position.token0, position.amount0);
  const fiatInvestedAmount1 = useFiatValue(position.token1, position.amount1);

  const fiatRewards0 = useFiatValue(
    position.token0,
    position.rewards0,
    REWARDS_MAX_FRACTION_DIGITS,
  );
  const fiatRewards1 = useFiatValue(
    position.token1,
    position.rewards1,
    REWARDS_MAX_FRACTION_DIGITS,
  );

  const [, , fiatTvl] = useSumOfFiatValues(
    [],
    [fiatTotalSupply0, fiatTotalSupply1],
  );

  const [, , totalFiatInvestedAmount] = useSumOfFiatValues(
    [],
    [fiatInvestedAmount0, fiatInvestedAmount1],
  );

  const [, , totalFiatRewards] = useSumOfFiatValues(
    [],
    [fiatRewards0, fiatRewards1],
    REWARDS_MAX_FRACTION_DIGITS,
  );

  if (position.closed && position.operator === address) {
    return null;
  }

  return (
    <div
      className={`sticky top-10  flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 overflow-hidden gap-4 pb-4 rounded-2xl ${!position.closed ? "bg-[#191d26]" : "bg-[#191d26]"}  border-[3px] ${selected ? "border-[#d9d9d9]" : "border-[#273345]"} cursor-pointer`}
      onClick={onSelect}
    >
      <div className="flex flex-col justify-start items-start self-stretch flex-grow gap-2">
        <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-[127px] p-4">
          <div className="flex flex-col justify-center items-start flex-grow gap-2">
            <div className="flex flex-col md:flex-row justify-start items-start md:items-center flex-grow-0 flex-shrink-0 gap-5">
              <p className="flex-grow-0 flex-shrink-0 text-xl md:text-2xl font-bold text-left text-white break-words max-w-[200px] md:max-w-[400px] whitespace-normal">
                {position.featureSettings.name}
              </p>
              <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 gap-2">
                <div className="flex justify-center items-center flex-grow-0 flex-shrink-0  p-1  px-0.5  rounded-md bg-[#273345]">
                  <p className="flex-grow-0 flex-shrink-0 text-xs text-left text-gray-100">
                    Performance fee {position.featureSettings.operatorFee}%
                  </p>
                </div>
                {position.featureSettings.hiddenFields.showInOutRange && (
                  <InRange inRange={position.inRange} />
                )}
              </div>
            </div>
            <div className="flex justify-start items-center flex-grow-0 flex-shrink-0   gap-2">
              <Pair token0={position.token0} token1={position.token1} />
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-grow-0 flex-shrink-0 w-6 h-6"
                preserveAspectRatio="none"
              >
                <rect
                  width={24}
                  height={24}
                  rx={8}
                  fill="#6B8AFF"
                  fillOpacity="0.2"
                />
                <g opacity="0.9">
                  <path
                    d="M13.2253 12.6807L12.549 14.4512C12.5306 14.5005 12.5306 14.5541 12.549 14.6033L13.7126 17.6498L15.0585 16.9079L13.4431 12.6807C13.4065 12.5833 13.262 12.5833 13.2253 12.6807Z"
                    fill="#00A3FF"
                  />
                  <path
                    d="M14.5817 9.70316C14.5451 9.60578 14.4007 9.60578 14.3639 9.70316L13.6876 11.4737C13.6692 11.5229 13.6692 11.5766 13.6876 11.6258L15.5941 16.6135L16.9399 15.8716L14.5817 9.70316Z"
                    fill="#00A3FF"
                  />
                  <path
                    d="M12.1907 5.82618C12.2239 5.82618 12.2572 5.83493 12.2869 5.85025L17.4195 8.67896C17.4791 8.71179 17.5158 8.77307 17.5158 8.83763V14.4939C17.5158 14.5596 17.4791 14.6198 17.4195 14.6526L12.2869 17.4813C12.2583 17.4977 12.2239 17.5054 12.1907 17.5054C12.1574 17.5054 12.1242 17.4967 12.0944 17.4813L6.96184 14.6548C6.90223 14.622 6.86554 14.5607 6.86554 14.4962V8.83873C6.86554 8.77307 6.90223 8.71288 6.96184 8.68006L12.0944 5.85135C12.1242 5.83493 12.1574 5.82618 12.1907 5.82618ZM12.1907 5C12.0083 5 11.8249 5.04487 11.661 5.13569L6.52964 7.9633C6.20177 8.14386 6 8.47762 6 8.83873V14.4951C6 14.8562 6.20177 15.1899 6.52964 15.3705L11.6622 18.1992C11.8261 18.2889 12.0083 18.3348 12.1919 18.3348C12.3741 18.3348 12.5575 18.29 12.7214 18.1992L17.854 15.3705C18.1819 15.1899 18.3836 14.8562 18.3836 14.4951V8.83873C18.3836 8.47762 18.1819 8.14386 17.854 7.9633L12.7204 5.13569C12.5564 5.04487 12.3729 5 12.1907 5Z"
                    fill="#00A3FF"
                  />
                  <path
                    d="M11.7584 8.43384H10.4573C10.3598 8.43384 10.2727 8.49183 10.2394 8.57937L7.4502 15.8782L8.7961 16.6201L11.8674 8.58265C11.896 8.51043 11.8399 8.43384 11.7584 8.43384Z"
                    fill="#00A3FF"
                  />
                  <path
                    d="M14.0358 8.43384H12.7346C12.6372 8.43384 12.55 8.49183 12.5168 8.57937L9.33203 16.9134L10.6779 17.6553L14.1447 8.58265C14.1722 8.51043 14.116 8.43384 14.0358 8.43384Z"
                    fill="#00A3FF"
                  />
                </g>
              </svg>
              <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 gap-0.5 p-1 rounded-md bg-[#273345]">
                <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 px-0.5">
                  <p className="flex-grow-0 flex-shrink-0 text-xs text-left text-gray-100">
                    {position.fee}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:gap-0 justify-between items-start self-stretch flex-grow-0 flex-shrink-0 px-4">
          <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-[117px] gap-1">
            <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 gap-0.5">
              <p className="flex-grow-0 flex-shrink-0 text-sm text-left text-gray-400">
                Your Balance
              </p>
              <svg
                width={89}
                height={2}
                viewBox="0 0 89 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="self-stretch flex-grow-0 flex-shrink-0"
                preserveAspectRatio="none"
              >
                <path
                  d="M1 1H88"
                  stroke="#4B5563"
                  strokeLinecap="square"
                  strokeDasharray="2 3"
                />
              </svg>
            </div>
            <div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 gap-1">
              <p className="flex-grow-0 flex-shrink-0 text-xl font-medium text-left text-white">
                {totalFiatInvestedAmount}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 gap-4">
            <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 gap-1">
              <p className="flex-grow-0 flex-shrink-0 text-sm text-left text-gray-400">
                Pool Position Balance
              </p>
              <div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 gap-2">
                <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 gap-2">
                  <p className="flex-grow-0 flex-shrink-0 text-xl font-medium text-left text-white">
                    {fiatTvl}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 gap-8">
            <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 gap-2">
              <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 gap-1">
                <p className="flex-grow-0 flex-shrink-0 text-sm text-left text-gray-400">
                  Your Claimable fees
                </p>
                <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 gap-2">
                  <p className="flex-grow-0 flex-shrink-0 text-xl font-medium text-left text-white">
                    {totalFiatRewards}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
