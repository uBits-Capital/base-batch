"use client";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import Image from "next/image";
import Logo from "@/assets/logo_without_bg.svg";
import LogoHead from "@/assets/logo_only_head_poolparty_sem_bg.svg";

import { redirectToPortfolio, redirectToPools } from "@/app/actions/redirects";
import { useAccount } from "wagmi";
import { useEffect, useState } from 'react';
import { CHAIN_ID } from '@/config';
import { wagmiConfig } from '@/wagmi';
import { AlertSnackbar } from './AlertSnackbar';

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

const Navbar = () => {
  const pathname = usePathname();
  const { isDisconnected, connector, chain } = useAccount();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (!connector) return;

    if (!chain || chain.id !== CHAIN_ID) {
      setShowAlert(true);
      "disconnect" in  connector ? connector.disconnect() : null;
    }
  }, [chain, connector]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center w-[320px] md:w-[1440px] overflow-hidden gap-2 px-8 py-3 mb-[64px]">
      <div className="flex justify-start items-center gap-1 px-8 ">
        <Image
          src={Logo}
          width={32}
          height={32}
          alt="Logo"
          className="flex-grow-0 flex-shrink-0 w-8 h-8 object-cover cursor-pointer"
          onClick={() => redirectToPools()}
        />
        <div
          className="flex justify-center items-center  h-11 relative gap-2 px-3 py-2.5 rounded-lg cursor-pointer"
          onClick={() => redirectToPools()}
        >
          <p
            className={` text-base font-medium text-left ${pathname !== "/portfolio" ? "text-white" : "text-gray-400"}`}
          >
            Pools
          </p>
        </div>
        <div
          className="flex justify-center items-center  h-11 relative gap-2 px-3 py-2.5 rounded-lg  cursor-pointer"
          onClick={() => redirectToPortfolio()}
        >
          <p
            className={` text-base font-medium text-left ${pathname === "/portfolio" ? "text-white" : "text-gray-400"} `}
          >
            Portfolio
          </p>
        </div>
      </div>
      <div className="flex justify-center md:justify-end items-center self-stretch md:w-[743px] gap-2">
        <div className="hidden md:flex justify-start items-center self-stretch  relative gap-3 pl-4 pr-6 py-3 rounded-[1000px] border border-[#273345]">
          <div className=" w-6 h-6 relative overflow-hidden rounded-[600px]">
            <Image
              src={LogoHead}
              width={24}
              height={24}
              alt="LogoHead"
              className="w-6 h-6 absolute left-[-0.8px] top-[-0.8px] object-cover"
            />
          </div>
          <p className=" text-base font-medium text-left text-gray-300">
            PP Points: TBA
          </p>
        </div>
        <div className="flex justify-start items-center self-stretch gap-1 px-1 py-3 rounded-[1000px]">
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 relative"
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
          {/* {chain && chain.id !== wagmiConfig.chains[0].id && <p><span>Wrong Network Detected</span>: Please switch to {wagmiConfig.chains[0].name}</p>} */}
        </div>
        <div
          className={`flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-3 pl-4 pr-6 py-3 rounded-[1000px] border ${isDisconnected ? " border-[#EB1717]" : " border-[#273345]"} `}
        >
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-grow-0 flex-shrink-0 w-6 h-6 relative"
            preserveAspectRatio="none"
          >
            <g clipPath="url(#clip0_131_21189)">
              <path
                d="M23.1584 32.8423L26.7059 9.10596L2.96949 5.55853L-0.577935 29.2949L23.1584 32.8423Z"
                fill="#F93301"
              />
              <path
                d="M6.10751 36.1193L23.6314 19.7207L7.23284 2.19681L-10.2911 18.5954L6.10751 36.1193Z"
                fill="#FB186B"
              />
              <path
                d="M-22.7736 4.49155L-16.6429 27.6953L6.56082 21.5646L0.430119 -1.63915L-22.7736 4.49155Z"
                fill="#F29202"
              />
            </g>
            <defs>
              <clipPath id="clip0_131_21189">
                <path
                  d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z"
                  fill="white"
                />
              </clipPath>
            </defs>
          </svg>

          <CustomConnectKitButton />
        </div>
      </div>
      <AlertSnackbar
        message={`Wrong Network Detected: Please switch to ${wagmiConfig.chains[0].name}`}
        show={showAlert}
        setShow={setShowAlert}
        timeout={6000}
      />
    </div>
  );
};

export default Navbar;
