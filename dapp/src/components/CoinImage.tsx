import DefaultCoin from "@/assets/coins/Default";
import React from "react";
import Image from "next/image";

interface ICoinImage {
  imagePath?: string;
  customWidth?: number;
  customHeight?: number;
  customRx?: number;
}

const CoinImage: React.FC<ICoinImage> = ({
  imagePath,
  customWidth = 20,
  customHeight = 20,
  customRx = 10,
}) => {
  if (!imagePath) {
    return <DefaultCoin />;
  }

  return imagePath.includes("svg") ? (
    <svg
      width={customWidth}
      height={customHeight}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-grow-0 flex-shrink-0 w-5 h-5 relative"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect
        width={customWidth}
        height={customHeight}
        rx={customRx}
        fill="#627EEA"
      />
      <path
        d="M9.99852 8.13178V3.11304L5.83334 10.0249L9.99852 8.13178Z"
        fill="white"
      />
      <path
        d="M9.99852 12.4876V8.13178L5.83334 10.0249L9.99852 12.4876ZM9.99852 8.13178L14.1645 10.0249L9.99852 3.11304V8.13178Z"
        fill="#C0CBF6"
      />
      <path
        d="M9.99838 8.13208V12.4879L14.1643 10.0252L9.99838 8.13208Z"
        fill="#8197EE"
      />
      <path
        d="M9.99849 13.2768L5.83331 10.8157L9.99849 16.6857V13.2768Z"
        fill="white"
      />
      <path
        d="M14.1666 10.8157L9.99838 13.2768V16.6857L14.1666 10.8157Z"
        fill="#C0CBF6"
      />
    </svg>
  ) : (
    <Image
      key={imagePath}
      src={`${imagePath}?v=${new Date().getTime()}`}
      width={customWidth}
      height={customHeight}
      className="flex-grow-0 flex-shrink-0 w-5 h-5 relative"
      style={{ borderRadius: customRx }}
      alt={`Coin-${imagePath}`}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjIiIHZpZXdCb3g9IjAgMCAyMCAyMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIxLjQ4MTUiIHJ4PSIxMCIgZmlsbD0iIzk2QTFENCIgLz4gPHBhdGggZD0iTTkuMjUgMTIuNDkwMVYxMi40MDkxQzkuMjU1NjggMTEuODgwNyA5LjMwODI0IDExLjQ2MDIgOS40MDc2NyAxMS4xNDc3QzkuNTA5OTQgMTAuODM1MiA5LjY1NDgzIDEwLjU4MjQgOS44NDIzMyAxMC4zODkyQzEwLjAyOTggMTAuMTk2IDEwLjI1NTcgMTAuMDE5OSAxMC41MTk5IDkuODYwOEMxMC42OTAzIDkuNzUyOCAxMC44NDM4IDkuNjMyMSAxMC45ODAxIDkuNDk4NThDMTEuMTE2NSA5LjM2NTA2IDExLjIyNDQgOS4yMTE2NSAxMS4zMDQgOS4wMzgzNUMxMS4zODM1IDguODY1MDYgMTEuNDIzMyA4LjY3MzMgMTEuNDIzMyA4LjQ2MzA3QzExLjQyMzMgOC4yMTAyMyAxMS4zNjM2IDcuOTkxNDggMTEuMjQ0MyA3LjgwNjgyQzExLjEyNSA3LjYyMjE2IDEwLjk2NTkgNy40ODAxMSAxMC43NjcgNy4zODA2OEMxMC41NzEgNy4yNzg0MSAxMC4zNTIzIDcuMjI3MjcgMTAuMTEwOCA3LjIyNzI3QzkuODkyMDUgNy4yMjcyNyA5LjY4MzI0IDcuMjcyNzMgOS40ODQzOCA3LjM2MzY0QzkuMjg1NTEgNy40NTQ1NSA5LjEyMDc0IDcuNTk2NTkgOC45OTAwNiA3Ljc4OTc3QzguODU5MzggNy45ODAxMSA4Ljc4NDA5IDguMjI1ODUgOC43NjQyIDguNTI2OTlINy40Njg3NUM3LjQ4ODY0IDguMDE1NjIgNy42MTc5IDcuNTgzODEgNy44NTY1MyA3LjIzMTUzQzguMDk1MTcgNi44NzY0MiA4LjQxMDUxIDYuNjA3OTUgOC44MDI1NiA2LjQyNjE0QzkuMTk3NDQgNi4yNDQzMiA5LjYzMzUyIDYuMTUzNDEgMTAuMTEwOCA2LjE1MzQxQzEwLjYzMzUgNi4xNTM0MSAxMS4wOTA5IDYuMjUxNDIgMTEuNDgzIDYuNDQ3NDRDMTIuMTc1IDYuNjQwNjIgMTIuMTc5IDYuOTExOTMgMTIuMzk0OSA3LjI2MTM2QzEyLjYxMzYgNy42MDc5NSAxMi43MjMgOC4wMTI3OCAxMi43MjMgOC40NzU4NUMxMi43MjMgOC43OTQwMyAxMi42NzMzIDkuMDgwOTcgMTIuNTczOSA5LjMzNjY1QzEyLjQ3NDQgOS41ODk0OSAxMi4zMzI0IDkuODE1MzQgMTIuMTQ3NyAxMC4wMTQyQzExLjk2NTkgMTAuMjEzMSAxMS43NDcyIDEwLjM4OTIgMTEuNDkxNSAxMC41NDI2QzExLjI1IDEwLjY5MzIgMTEuMDU0IDEwLjg0OTQgMTAuOTAzNCAxMS4wMTE0QzEwLjc1NTcgMTEuMTczMyAxMC42NDc3IDExLjM2NTEgMTAuNTc5NSAxMS41ODY2QzEwLjUxMTQgMTEuODA4MiAxMC40NzQ0IDEyLjA4MjQgMTAuNDY4OCAxMi40MDkxVjEyLjQ5MDFIOS4yNTBaTTkuODkzNDcgMTUuMDgxQzkuNjYwNTEgMTUuMDgxIDkuNDYwMjMgMTQuOTk4NiA5LjI5MjYxIDE0LjgzMzhDOS4xMjUgMTQuNjY2MiA5LjA0MTE5IDE0LjQ2NDUgOS4wNDExOSAxNC4yMjg3QzkuMDQxMTkgMTMuOTk1NyA5LjEyNSAxMy43OTY5IDkuMjkyNjEgMTMuNjMyMUM5LjQ2MDIzIDEzLjQ2NDUgOS42NjA1IDEzLjM4MDcgOS44OTM0NyAxMy4zODA3QzEwLjEyMzYgMTMuMzgwNyAxMC4zMjI0IDEzLjQ2NDUgMTAuNDkwMSAxMy42MzIxQzEwLjY2MDUgMTMuNzk2OSAxMC43NDU3IDEzLjk5NTcgMTAuNzQ1NyAxNC4yMjg3QzEwLjc0NTcgMTQuMzg0OSAxMC43MDYgMTQuNTI4NCAxMC42MjY0IDE0LjY1OTEgQzEwLjU0OTcgMTQuNzg2OSAxMC40NDc0IDE0Ljg5OTIgMTAuMzE5NiAxNC45NjU5QzEwLjE5MTggMTUuMDQyNiAxMC4wNDk3IDE1LjA4MSA5Ljg5MzQ3IDE1LjA4MVoiIGZpbGw9IndoaXRlIi8+IDwvc3ZnPg=="
    />
  );
};

export default CoinImage;
