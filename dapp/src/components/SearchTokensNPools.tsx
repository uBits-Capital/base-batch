import { useDebouncedCallback } from "use-debounce";

export type SearchTokensNPoolsProps = {
  searchInput?: string;
  setSearchInput(newSearch: string): void;
};

export default function SearchTokensNPools({
  searchInput,
  setSearchInput,
}: SearchTokensNPoolsProps) {
  const debouncedSetSearchInput = useDebouncedCallback(
    (search) => setSearchInput(search),
    500,
  );

  return (
    <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 h-11 relative px-3 rounded-lg bg-[#191d26] border border-[#191d26]">
      <div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 h-11 relative gap-2.5 pr-3 py-3">
        <svg
          width={20}
          height={20}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-grow-0 flex-shrink-0 w-5 h-5 relative"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
            stroke="#9CA3AF"
            strokeWidth="1.66"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search by token, pool address or feature"
        className="flex-grow w-[478px] text-base text-left text-gray-400 bg-transparent border-none outline-none"
        defaultValue={searchInput}
        onChange={(e) => debouncedSetSearchInput(e.target.value)}
      />
    </div>
  );
}
