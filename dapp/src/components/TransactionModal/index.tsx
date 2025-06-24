import Pending from "./Pending";
import Success from "./Success";
import Failed from "./Failed";

export enum ModalActionType {
  CREATE_POSITION = "create-position",
  INVESTOR_ADD_LIQUIDITY = "investor-add-liquidity",
  ADD_LIQUIDITY = "add-liquidity",
  REMOVE_LIQUIDITY = "remove-liquidity",
  COLLECT_FEES = "collect-fees",
  WITHDRAW = "withdraw",
  CLOSE_POSITION = "close-position",
}

export enum TransactionType {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export type TransactionModalProps = {
  type: TransactionType;
  transactionUrl?: string;
  modalType: ModalActionType;
  token0Ticker?: string;
  token1Ticker?: string;
  token0Amount?: string;
  token1Amount?: string;
  usdcAmount?: string;
  withdrawTotalAmount?: string;
  withdrawFeesAmount?: string;
  error?: string;
  close: (transactionType: TransactionType) => void;
};

const getModalContent = ({
  type,
  transactionUrl,
  modalType,
  token0Ticker,
  token1Ticker,
  token0Amount,
  token1Amount,
  usdcAmount,
  withdrawTotalAmount,
  withdrawFeesAmount,
  close,
  error
}: TransactionModalProps) => {
  switch (type) {
    case TransactionType.PENDING:
      return (
        <Pending
          transactionUrl={transactionUrl}
          modalType={modalType}
          token0Ticker={token0Ticker}
          token1Ticker={token1Ticker}
          token0Amount={token0Amount}
          token1Amount={token1Amount}
          usdcAmount={usdcAmount}
          withdrawTotalAmount={withdrawTotalAmount}
          withdrawFeesAmount={withdrawFeesAmount}
          close={() => close(type)}
        />
      );
    case TransactionType.SUCCESS:
      return (
        <Success
          transactionUrl={transactionUrl}
          modalType={modalType}
          token0Ticker={token0Ticker}
          token1Ticker={token1Ticker}
          token0Amount={token0Amount}
          token1Amount={token1Amount}
          usdcAmount={usdcAmount}
          withdrawTotalAmount={withdrawTotalAmount}
          withdrawFeesAmount={withdrawFeesAmount}
          close={() => close(type)}
        />
      );
    case TransactionType.FAILED:
      return <Failed error={error} close={() => close(type)} />;
  }
};

export default function TransactionModal(
  props?: TransactionModalProps | undefined | null,
) {
  if (!props) return;

  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
      ></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0  gap-[9px] rounded-3xl bg-[#12131a] border border-[#273345]">
            {getModalContent(props)}
          </div>
        </div>
      </div>
    </div>
  );
}
