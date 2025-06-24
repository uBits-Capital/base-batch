import { useMemo } from "react";
import { formatCurrency } from "@/utils/currency";

export function parseLocaleString(value?: string): number {
  if (!value) return 0;
  value = value.replaceAll(",", "").replaceAll("$", "");

  if (value?.includes("B")) {
    value = value.replace("B", "");
    return parseFloat(value) * 1_000_000_000;
  } else if (value?.includes("M")) {
    value = value.replace("M", "");
    return parseFloat(value) * 1_000_000;
  }
  return parseFloat(value);
}

export function useSumOfFiatValues(
  remove: (string | undefined)[],
  sum: (string | undefined)[],
  fractionDigits?: number,
) {
  return useMemo(() => {
    const sumOfRemove = remove
      .map(parseLocaleString)
      .reduce((prev, curr) => prev + curr, 0);

    const sumOfSum = sum
      .map(parseLocaleString)
      .reduce((prev, curr) => prev + curr, 0);

    return [
      formatCurrency(sumOfRemove, fractionDigits),
      formatCurrency(sumOfSum - sumOfRemove, fractionDigits),
      formatCurrency(sumOfSum, fractionDigits),
    ];
  }, [remove, sum, fractionDigits]);
}
