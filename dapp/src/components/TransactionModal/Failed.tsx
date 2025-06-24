const mappingErrors = (error: string) => {
  if (error.toLocaleLowerCase().includes("slippage") ||
    error.toLocaleLowerCase().includes("price slippage check") ||
    error.toLocaleLowerCase().includes("swap failed: too little received")) {
    return "PRICE_SLIPPAGE_ERROR";
  }
  if (error.includes("PoolPartyPositionFactory: Pool Position Name already exists")) {
    return "POOL_POSITION_NAME_ALREADY_EXISTS";
  }
  if (error.includes("PoolPartyPositionFactory: Position is not closed") ||
    error.includes("Pool position already created")) {
    return "POOL_POSITION_IS_NOT_CLOSED";
  }
  if (error.includes("Position is already closed")) {
    return "POOL_POSITION_IS_ALREADY_CLOSED";
  }
  if (error.includes("Only the operator can close the pool position")) {
    return "ONLY_THE_OPERATOR_CAN_CLOSE_THE_POOL_POSITION";
  }
  if (error.includes("No rewards to collect")) {
    return "NO_REWARDS_TO_COLLECT";
  }
  if (error.includes("PoolPartyPositionManager: OPERATOR_NOT_WHITELISTED")) {
    return "OPERATOR_NOT_WHITELISTED";
  }
  if (error.includes("PoolPartyPositionManager: INVESTOR_NOT_WHITELISTED")) {
    return "INVESTOR_NOT_WHITELISTED";
  }
  if (error.includes("PoolPartyPositionManager: MAX_INVESTMENT_EXCEEDED")) {
    return "MAX_INVESTMENT_EXCEEDED";
  }
  if (error.includes("PoolPartyPositionManager: MIN_INVESTMENT_NOT_MET")) {
    return "MIN_INVESTMENT_NOT_MET";
  }
  if (error.includes("Pool not initialized")) {
    return "POOL_NOT_INITIALIZED";
  }
  if (error.includes("User rejected the request.")) {
    return "USER_REJECTED_THE_REQUEST";
  }
  if (error.includes("User denied transaction signature")) {
    return "USER_DENIED_TRANSACTION_SIGNATURE";
  }
  if (error.includes("Internal JSON-RPC error") || error.includes("HTTP request failed.")) {
    return "INTERNAL_JSON_RPC_ERROR";
  }
  if (error.includes("Timeout")) {
    return "TIMEOUT";
  }
};

const getErrorMessages = (error: string) => {
  const errorType = mappingErrors(error);
  switch (errorType) {
    case "PRICE_SLIPPAGE_ERROR":
      return "Price slippage check failed. Please try again with a different amount and/or slippage.";
    case "POOL_POSITION_NAME_ALREADY_EXISTS":
      return "Pool position name already exists. Please try again with a different name.";
    case "POOL_POSITION_IS_NOT_CLOSED":
      return "Pool position is not closed. Please try again after closing the pool position.";
    case "POOL_POSITION_IS_ALREADY_CLOSED":
      return "Pool position is already closed. Please try again with a different pool position.";
    case "ONLY_THE_OPERATOR_CAN_CLOSE_THE_POOL_POSITION":
      return "Only the operator can close the pool position. Please try again with a different pool position.";
    case "NO_REWARDS_TO_COLLECT":
      return "No rewards to collect. Please try again after earning rewards.";
    case "OPERATOR_NOT_WHITELISTED":
      return "Operator is not whitelisted. Please try again with a different operator.";
    case "INVESTOR_NOT_WHITELISTED":
      return "Investor is not whitelisted. Please try again with a different investor.";
    case "MAX_INVESTMENT_EXCEEDED":
      return "Max investment exceeded. Please try again with a different amount.";
      case "MIN_INVESTMENT_NOT_MET":
      return "Min investment not met. Please try again with minimum 10 USDC";
    case "POOL_NOT_INITIALIZED":
      return "Pool is not initialized. Please try again after initializing the pool.";
    case "USER_REJECTED_THE_REQUEST":
      return "User rejected the request. Please try again after accepting the request.";
    case "USER_DENIED_TRANSACTION_SIGNATURE":
      return "User denied transaction signature. Please try again after accepting the signature.";
    case "INTERNAL_JSON_RPC_ERROR":
      return "Internal JSON-RPC error. Please try again after refreshing the page.";
    case "TIMEOUT":
      return "Timeout. Please try again after refreshing the page.";
    default:
      return "Something went wrong. Please try again.";
  }
};


export default function Failed({ error, close = () => {} }: { error: string | undefined, close: () => void; }) {
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
        <div className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4">
          <p className="flex-grow-0 flex-shrink-0 text-lg font-medium text-center text-white">
            {getErrorMessages(error || "")}
          </p>
        </div>
        <div
          className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-2 cursor-pointer"
          onClick={close}
        >
          <div className="flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-1 px-4 py-3 rounded-[1000px] bg-gray-100">
            <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative px-1 ">
              <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left text-[#12131a]">
                Close
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
