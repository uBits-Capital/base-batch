const TableHeader = () => (
  <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4">
    <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0 px-8">
      <div className="flex justify-start items-start flex-grow relative gap-4">
        <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-right text-gray-400">
          Pool
        </p>
      </div>
      <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 relative gap-2">
        <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 w-[124px] relative gap-1">
          <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-left text-gray-400">
            TvL
          </p>
          <svg
            width={12}
            height={12}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-grow-0 flex-shrink-0 w-[11.25px] h-[11.25px] relative"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.625 1.625C5.97018 1.625 6.25 1.90482 6.25 2.25V8.24112L8.18306 6.30806C8.42714 6.06398 8.82286 6.06398 9.06694 6.30806C9.31102 6.55214 9.31102 6.94786 9.06694 7.19194L6.06694 10.1919C5.94973 10.3092 5.79076 10.375 5.625 10.375C5.45924 10.375 5.30027 10.3092 5.18306 10.1919L2.18306 7.19194C1.93898 6.94786 1.93898 6.55214 2.18306 6.30806C2.42714 6.06398 2.82286 6.06398 3.06694 6.30806L5 8.24112L5 2.25C5 1.90482 5.27982 1.625 5.625 1.625Z"
              fill="#9CA3AF"
            />
          </svg>
        </div>
        <p className="flex-grow-0 flex-shrink-0 w-[124px] text-xs font-medium text-left text-gray-400">
          1 day APR
        </p>
        <p className="flex-grow-0 flex-shrink-0 w-[124px] text-xs font-medium text-left text-gray-400">
          Volume (24h)
        </p>
      </div>
    </div>
    <svg
      height={2}
      viewBox="0 0 900 2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="self-stretch flex-grow-0 flex-shrink-0"
      preserveAspectRatio="none"
    >
      <path d="M0 1C285.101 1 864.242 1 900 1" stroke="#191D26" />
    </svg>
  </div>
);

export default TableHeader;
