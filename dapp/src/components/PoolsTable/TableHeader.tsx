export default function TableHeader() {
  return (
    <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-4 px-8 mb-3">
      <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0">
        <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-[200px] ">
          <p className="flex-grow w-[200px] text-xs font-medium text-left text-gray-400">
            Pool Name
          </p>
        </div>
        <div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 w-[210px]  px-3">
          <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-right text-gray-400">
            Pool
          </p>
        </div>
        <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-[110px] px-3">
          <div className="flex justify-start items-center flex-grow  gap-1">
            <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-left text-gray-400">
              TvL
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 w-[100px]  px-3">
          <p className="flex-grow-0 flex-shrink-0 w-20 text-xs font-medium text-left text-gray-400">
            Performance
          </p>
          <p className="flex-grow-0 flex-shrink-0 w-20 text-xs font-medium text-center text-gray-400">
            Fee
          </p>
        </div>
        <div className="flex justify-end items-center flex-grow-0 flex-shrink-0 w-[110px]  px-3 gap-3 ">
          <div className="flex flex-col justify-center items-center flex-grow  gap-0.5">
            <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-right text-gray-400">
              Investors
            </p>
          </div>
        </div>
        <div className="flex justify-start items-start flex-grow gap-2 ml-8 md:ml-[-60px]">
          <div className="flex flex-col justify-center items-center flex-grow  gap-0.5">
            <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-right text-gray-400">
              Strategy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
