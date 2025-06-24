import Pair, { PairProps } from "./Pair";

export type InputProps = PairProps & {
  feeTier: number;
};

export default function Index({ feeTier, token0, token1 }: InputProps) {
  return (
    <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
      <Pair token0={token0} token1={token1} />
      <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 px-1 py-0.5 rounded-md bg-[#273345]">
        <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-0.5">
          <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-left text-gray-100">
            {feeTier}%
          </p>
        </div>
      </div>
    </div>
  );
}
