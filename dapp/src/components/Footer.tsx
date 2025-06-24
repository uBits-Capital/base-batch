import Image from "next/image";
import LogoFull from "@/assets/logo_poolparty_with_name.svg";
import LogoUbits from "@/assets/uBits_logo.svg";

export default function Footer() {
  return (
    <div className="z-[-1] flex flex-col items-center w-full mt-12">
      <div className="flex justify-center items-center gap-4">
        <a
          href="https://x.com/PoolParty_xyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
          </svg>
        </a>
        <a
          href="https://discord.gg/V5J6UpQ7H3 "
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        </a>
      </div>
      <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 w-full h-[76px] overflow-hidden gap-8 px-8 py-3 mt-[6px]">
        <div className="flex justify-end items-center self-stretch flex-grow  gap-2">
          <Image
            src={LogoFull}
            width={130}
            height={40}
            alt="Logo Pool Party"
            className="flex-grow-0 flex-shrink-0 w-[130px] h-[39.69px] object-none"
          />
        </div>
        <div className="flex justify-center items-center self-stretch flex-grow gap-2">
          <div className="flex justify-start items-center self-stretch flex-grow   gap-1.5">
            <p className="flex-grow-0 flex-shrink-0 text-[10px] font-medium text-left text-white">
              powered by
            </p>
            <Image
              src={LogoUbits}
              width={60}
              height={24}
              alt="Logo Powered by uBits"
              className="flex-grow-0 flex-shrink-0 w-[60px] h-6 object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
