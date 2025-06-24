import React from "react";

export type PriceInputProps = {
  price: string;
  title: string;
  subtitle: string;
};

export default function PriceLabel({
  price,
  title,
  subtitle,
}: PriceInputProps) {
  return (
    <div className="flex justify-center flex-grow items-center h-12 gap-3 px-3 rounded-lg bg-[#191d26] border border-[#191d26] w-full">
      <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-left text-gray-400">
        {title}
      </p>
      <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-left text-white bg-transparent border-none outline-none">
        {price}
      </p>
      <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-left text-gray-400">
        {subtitle}
      </p>
    </div>
  );
}
