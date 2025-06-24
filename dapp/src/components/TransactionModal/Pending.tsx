import { ModalActionType } from ".";

interface PendingProps {
  transactionUrl?: string;
  modalType: ModalActionType;
  token0Ticker?: string;
  token1Ticker?: string;
  token0Amount?: string;
  token1Amount?: string;
  usdcAmount?: string;
  withdrawTotalAmount?: string;
  withdrawFeesAmount?: string;
  close: () => void;
}

const PendingLabel = ({
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
          Add{" "}
          {usdcAmount
            ? ` ${usdcAmount} USDC`
            : ` ${token0Amount} ${token0Ticker} and ${token1Amount} 
              ${token1Ticker}`}
        </p>
      );
    case ModalActionType.REMOVE_LIQUIDITY:
      return (
        <p className="flex-grow-0 flex-shrink-0 text-sm text-center text-gray-300">
          Remove{" "}
          {usdcAmount
            ? ` ${usdcAmount} USDC`
            : ` ${token0Amount} ${token0Ticker} and ${token1Amount} 
              ${token1Ticker}`}
        </p>
      );
    case ModalActionType.COLLECT_FEES:
      return (
        <p className="flex-grow-0 flex-shrink-0 text-sm text-center text-gray-300">
          Collect Fees
        </p>
      );
    case ModalActionType.WITHDRAW:
      return (
        <p className="flex-grow-0 flex-shrink-0 text-sm text-center text-gray-300">
          Withdraw position {withdrawTotalAmount} and fees {withdrawFeesAmount}
        </p>
      );
    case ModalActionType.CLOSE_POSITION:
      return (
        <p className="flex-grow-0 flex-shrink-0 text-sm text-center text-gray-300">
          Close Position
        </p>
      );
    default:
      return <></>;
  }
};

export default function Pending({
  transactionUrl,
  token0Ticker,
  token1Ticker,
  token0Amount,
  token1Amount,
  usdcAmount,
  modalType,
  withdrawTotalAmount,
  withdrawFeesAmount,
  close = () => {},
}: PendingProps) {
  return (
    <div className="flex flex-col justify-center items-center w-[310px] md:w-[445px]  gap-3 pt-8 pb-6 rounded-2xl bg-[#12131a] border border-[#273345]">
      <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-6 px-6">
        <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-2 p-4 rounded-[1000px] bg-[#191d26]">
          <div role="status">
            <svg aria-hidden="true" className="w-[50px] h-[50px] text-gray-200 animate-spin dark:text-gray-600 fill-green-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4">
          <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-2">
            <p className="flex-grow-0 flex-shrink-0 text-lg font-medium text-left text-white">
              Transaction pending
            </p>
            <PendingLabel
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
        <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-2">
          <div className="flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-1 px-4 py-3 rounded-[1000px] bg-[#273345]">
            <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-1">
              <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left text-gray-500">
                Close
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
