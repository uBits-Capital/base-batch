const Header = ({ close = () => {} }) => (
  <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 h-16 gap-2 pl-8 pr-6 py-5 border-t-0 border-r-0 border-b border-l-0 border-[#191d26]">
    <div className="flex justify-start items-center flex-grow">
      <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
        <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white">
          Find a pool (Uniswap V3)
        </p>
      </div>
    </div>
    <div
      className="flex justify-start items-end flex-grow-0 flex-shrink-0 gap-2 p-2"
      onClick={close}
    >
      <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-0.5 p-2 rounded-[1000px] cursor-pointer">
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
            d="M12.4869 4.22025C12.6822 4.02499 12.6822 3.70841 12.4869 3.51315C12.2917 3.31788 11.9751 3.31788 11.7798 3.51315L8.00003 7.29293L4.22025 3.51315C4.02499 3.31788 3.70841 3.31788 3.51315 3.51315C3.31788 3.70841 3.31788 4.02499 3.51315 4.22025L7.29293 8.00003L3.51315 11.7798C3.31788 11.9751 3.31788 12.2917 3.51315 12.4869C3.70841 12.6822 4.02499 12.6822 4.22025 12.4869L8.00003 8.70714L11.7798 12.4869C11.9751 12.6822 12.2917 12.6822 12.4869 12.4869C12.6822 12.2917 12.6822 11.9751 12.4869 11.7798L8.70714 8.00003L12.4869 4.22025Z"
            fill="#9CA3AF"
          />
        </svg>
      </div>
    </div>
  </div>
);

export default Header;
