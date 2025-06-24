
"use client";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";


const CustomConnectKitButton = () => (
  <ConnectKitButton.Custom>
    {({ isConnected, show, truncatedAddress }) => {
      return (
        <button onClick={show}>
          {isConnected ? truncatedAddress : "Connect Wallet"}
        </button>
      );
    }}
  </ConnectKitButton.Custom>
);


export default function ConnectWalletModal() {
  const { isConnecting, isDisconnected } = useAccount();
  if (!isDisconnected && !isConnecting) {
    return null;
  }

  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity`}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0  rounded-3xl bg-[#12131a] border border-[#273345]">
            <div className="flex flex-col justify-center items-center w-[310px] md:w-[445px] overflow-hidden rounded-2xl bg-[#12131a] gap-5  p-9">
              <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-2 p-4 rounded-[1000px] bg-[#191d26]">
                <svg
                  width={41}
                  height={40}
                  viewBox="0 0 41 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-grow-0 flex-shrink-0 w-10 h-10 relative"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M21.4451 0.608857C21.0185 -0.106925 19.9819 -0.106923 19.5552 0.608858L0.744674 32.1702C0.30767 32.9035 0.836006 33.8334 1.68958 33.8334H39.3108C40.1644 33.8334 40.6927 32.9035 40.2557 32.1702L21.4451 0.608857ZM20.4143 1.12082C20.453 1.05575 20.5473 1.05575 20.5861 1.12082L39.3967 32.6822C39.4364 32.7489 39.3884 32.8334 39.3108 32.8334H1.68958C1.61198 32.8334 1.56395 32.7489 1.60368 32.6822L20.4143 1.12082ZM18.7052 11.9631C18.6661 10.9447 19.481 10.0978 20.5002 10.0978C21.5193 10.0978 22.3342 10.9447 22.2951 11.9631L21.8847 22.6322C21.8561 23.3761 21.2447 23.9645 20.5002 23.9645C19.7556 23.9645 19.1442 23.3761 19.1156 22.6322L18.7052 11.9631ZM22.4999 27.9361C22.4999 29.0407 21.6044 29.9361 20.4999 29.9361C19.3953 29.9361 18.4999 29.0407 18.4999 27.9361C18.4999 26.8315 19.3953 25.9361 20.4999 25.9361C21.6044 25.9361 22.4999 26.8315 22.4999 27.9361Z"
                    fill="#FD4040"
                  />
                </svg>
              </div>
              <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 mb-2">
                <p className="flex-grow-0 flex-shrink-0 text-lg font-medium text-center text-white">
                  To access the application you must connect your wallet
                </p>
              </div>
              <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-1 cursor-pointer"
              >
                <div className={`flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-3 pl-4 pr-6 py-3 rounded-[1000px] border ${isDisconnected ? " border-[#EB1717]" : " border-[#273345]"} `}
                >
                  <CustomConnectKitButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
