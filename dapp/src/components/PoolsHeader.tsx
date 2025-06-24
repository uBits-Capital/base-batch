"use client";

import { useState } from "react";
import FindAPoolModal from "@/components/FindAPoolModal";
import { useAccount } from "wagmi";

export type PoolsHeaderProps = {};

export default function PoolsHeader({}: PoolsHeaderProps) {
  const [showModal, setShowModal] = useState(false);

  const { isConnected } = useAccount();

  return (
    <div>
      <div className="flex justify-start md:justify-between items-center flex-grow-0 flex-shrink-0 w-[320px] md:w-[1008px] relativ mb-5">
        <p className="flex-grow-0 flex-shrink-0 text-3xl font-medium text-left text-white">
          Pools
        </p>

        <div className="hidden md:flex justify-end items-center flex-grow-0 flex-shrink-0 gap-3">
          <div
            className={`flex justify-center items-center flex-grow-0 flex-shrink-0 gap-1 px-4 py-3 rounded-[1000px] ${isConnected ? "bg-gray-100 hover:bg-gray-600 cursor-pointer" : "bg-gray-400 hover:bg-auto cursor-auto group relative"}`}
            onClick={() => isConnected && setShowModal(!showModal)}
          >
            {!isConnected && (
              <span className="absolute hidden group-hover:flex -left-6 -top-3 -translate-y-full w-48 p-3 bg-[#12131a] rounded-lg border border-[#273345] text-center text-gray-400 text-sm after:content-[''] after:absolute after:left-1/2 after:top-[100%] after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-[#273345]">
                Connect your wallet to create a new Pool
              </span>
            )}

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
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.197 9.9996C18.197 14.5267 14.5269 18.1967 9.99984 18.1967C5.47271 18.1967 1.80273 14.5267 1.80273 9.9996C1.80273 5.47247 5.47271 1.80249 9.99984 1.80249C14.5269 1.80249 18.197 5.47247 18.197 9.9996ZM10 5.49992C10.2761 5.49992 10.5 5.72378 10.5 5.99992V9.49992H14C14.2761 9.49992 14.5 9.72378 14.5 9.99992C14.5 10.2761 14.2761 10.4999 14 10.4999H10.5V13.9999C10.5 14.2761 10.2761 14.4999 10 14.4999C9.72386 14.4999 9.5 14.2761 9.5 13.9999V10.4999H6C5.72386 10.4999 5.5 10.2761 5.5 9.99992C5.5 9.72378 5.72386 9.49992 6 9.49992H9.5V5.99992C9.5 5.72378 9.72386 5.49992 10 5.49992Z"
                fill={isConnected ? "#12131A" : "#1F2937"}
              />
            </svg>

            <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-1">
              <p
                className={`flex-grow-0 flex-shrink-0 text-base font-semibold text-left ${isConnected ? "text-[#12131a]" : "text-gray-800"}`}
              >
                New pool
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && <FindAPoolModal close={() => setShowModal(false)} />}
    </div>
  );
}
