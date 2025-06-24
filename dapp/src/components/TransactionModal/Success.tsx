import { ModalActionType } from ".";

interface SuccessProps {
  transactionUrl?: string;
  modalType: ModalActionType;
  token0Ticker?: string;
  token1Ticker?: string;
  token0Amount?: string;
  token1Amount?: string;
  usdcAmount?: string;
  withdrawTotalAmount?: string;
  withdrawFeesAmount?: string;
  isRemove?: boolean;
  collectingFees?: boolean;
  closeButtonLabel?: string;
  close: () => void;
}

const SuccessLabel = ({
  modalType,
  token0Ticker,
  token1Ticker,
  token0Amount,
  token1Amount,
  usdcAmount,
  withdrawTotalAmount,
  withdrawFeesAmount,
}: {
  modalType: ModalActionType;
  token0Ticker?: string;
  token1Ticker?: string;
  token0Amount?: string;
  token1Amount?: string;
  usdcAmount?: string;
  withdrawTotalAmount?: string;
  withdrawFeesAmount?: string;
}) => {
  switch (modalType) {
    case ModalActionType.CREATE_POSITION:
    case ModalActionType.INVESTOR_ADD_LIQUIDITY:
    case ModalActionType.ADD_LIQUIDITY:
      return (
        <p className="flex-grow-0 flex-shrink-0 text-sm text-center text-gray-300">
          Added{" "}
          {usdcAmount
            ? ` ${usdcAmount} USDC`
            : ` ${token0Amount} ${token0Ticker} and ${token1Amount} 
              ${token1Ticker}`}
        </p>
      );
    case ModalActionType.REMOVE_LIQUIDITY:
      return (
        <p className="flex-grow-0 flex-shrink-0 text-sm text-center text-gray-300">
          Removed{" "}
          {usdcAmount
            ? ` ${usdcAmount} USDC`
            : ` ${token0Amount} ${token0Ticker} and ${token1Amount} 
              ${token1Ticker}`}
        </p>
      );
    case ModalActionType.COLLECT_FEES:
      return (
        <p className="flex-grow-0 flex-shrink-0 text-sm text-center text-gray-300">
          Collected Fees
        </p>
      );
    case ModalActionType.WITHDRAW:
      return (
        <p className="flex-grow-0 flex-shrink-0 text-sm text-center text-gray-300">
          Withdrawn position {withdrawTotalAmount} and fees {withdrawFeesAmount}
        </p>
      );
    case ModalActionType.CLOSE_POSITION:
      return (
        <p className="flex-grow-0 flex-shrink-0 text-sm text-center text-gray-300">
          Closed Position
        </p>
      );
    default:
      return <></>;
  }
};

const CloseButton = ({
  modalType,
  onClose,
}: {
  modalType: ModalActionType;
  onClose: () => void;
}) => {
  let closeLabel;

  switch (modalType) {
    case ModalActionType.CREATE_POSITION:
    case ModalActionType.INVESTOR_ADD_LIQUIDITY:
      closeLabel = "See my portfolio";
      break;
    default:
      closeLabel = "Close";
  }

  return (
    <div
      className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-2 cursor-pointer"
      onClick={onClose}
    >
      <div className="flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-1 px-4 py-3 rounded-[1000px] bg-gray-100">
        <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-1">
          <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left text-[#12131a] ">
            {closeLabel}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function Success({
  transactionUrl,
  modalType,
  token0Ticker,
  token1Ticker,
  token0Amount,
  token1Amount,
  usdcAmount,
  withdrawTotalAmount,
  withdrawFeesAmount,
  close = () => {},
}: SuccessProps) {
  return (
    <div className="flex flex-col justify-center items-center w-[310px] md:w-[445px] gap-3 pt-5 pb-6 rounded-2xl bg-[#12131a] border border-[#273345]">
      <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 relative px-6">
        <div></div>
        <div
          className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5 p-2 rounded-[1000px] cursor-pointer"
          onClick={close}
        >
          <svg
            width={16}
            height={16}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-grow-0 flex-shrink-0 w-4 h-4 relative"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.4864 4.22025C12.6817 4.02499 12.6817 3.70841 12.4864 3.51315C12.2912 3.31788 11.9746 3.31788 11.7793 3.51315L7.99954 7.29293L4.21976 3.51315C4.0245 3.31788 3.70792 3.31788 3.51266 3.51315C3.3174 3.70841 3.3174 4.02499 3.51266 4.22025L7.29244 8.00003L3.51266 11.7798C3.3174 11.9751 3.3174 12.2917 3.51266 12.4869C3.70792 12.6822 4.0245 12.6822 4.21976 12.4869L7.99954 8.70714L11.7793 12.4869C11.9746 12.6822 12.2912 12.6822 12.4864 12.4869C12.6817 12.2917 12.6817 11.9751 12.4864 11.7798L8.70665 8.00003L12.4864 4.22025Z"
              fill="#9CA3AF"
            />
          </svg>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-6 px-6">
        <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-2 p-4 rounded-[1000px] bg-[#191d26]">
          <svg
            width={41}
            height={40}
            viewBox="0 0 41 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-grow-0 flex-shrink-0 w-10 h-10 relative"
            preserveAspectRatio="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M20.4997 3.10522C11.1693 3.10522 3.60547 10.669 3.60547 19.9994C3.60547 29.3298 11.1693 36.8937 20.4997 36.8937C29.83 36.8937 37.3939 29.3298 37.3939 19.9994C37.3939 10.669 29.83 3.10522 20.4997 3.10522ZM4.60547 19.9994C4.60547 11.2213 11.7216 4.10522 20.4997 4.10522C29.2777 4.10522 36.3939 11.2213 36.3939 19.9994C36.3939 28.7775 29.2777 35.8937 20.4997 35.8937C11.7216 35.8937 4.60547 28.7775 4.60547 19.9994ZM26.9058 14.2874C27.0648 14.0615 27.0105 13.7496 26.7847 13.5907C26.5589 13.4318 26.247 13.486 26.088 13.7119L17.9889 25.2212L14.1871 21.3489C13.9936 21.1519 13.677 21.149 13.48 21.3425C13.2829 21.5359 13.28 21.8525 13.4735 22.0495L17.6957 26.3499C17.7997 26.4558 17.9453 26.51 18.0932 26.4979C18.2411 26.4859 18.376 26.4087 18.4614 26.2874L26.9058 14.2874Z"
              fill="#4FEF5F"
            />
          </svg>
        </div>
        <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4">
          <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-2">
            <p className="flex-grow-0 flex-shrink-0 text-lg font-medium text-left text-white">
              Success
            </p>
            <SuccessLabel
              modalType={modalType}
              token0Ticker={token0Ticker}
              token1Ticker={token1Ticker}
              token0Amount={token0Amount}
              token1Amount={token1Amount}
              usdcAmount={usdcAmount}
              withdrawTotalAmount={withdrawTotalAmount}
              withdrawFeesAmount={withdrawFeesAmount}
            />
          </div>
          <svg
            width={397}
            height={2}
            viewBox="0 0 397 2"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="self-stretch flex-grow-0 flex-shrink-0"
            preserveAspectRatio="none"
          >
            <path d="M0 1H397" stroke="#191D26" />
          </svg>
          <a
            href={transactionUrl}
            target="_blank"
            className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-1 rounded-[100px]"
          >
            <p
              className={`flex-grow-0 flex-shrink-0 text-sm font-medium text-left ${transactionUrl ? "text-[#64d5e4]" : "text-[#6B7280]"}`}
            >
              View in Explorer
            </p>
          </a>
        </div>
        <CloseButton modalType={modalType} onClose={close} />
      </div>
    </div>
  );
}
