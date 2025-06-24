import { Currency, CurrencyAmount, Percent, Token } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import { nearestUsableTick, Pool, TickMath } from "@uniswap/v3-sdk";
import { parseUnits } from "@ethersproject/units";
import { BIPS_BASE } from "@/constants";
import { PositionData } from "@/hooks/position/usePositions";
import { customTickToPrice } from "@/utils/price";

const MAX_DECIMALS = 18;

export function calculateOneDayApr(
  volume24h?: number,
  tvl?: number,
  feeTier?: number
) {
  if (!volume24h || !feeTier || !tvl || !Math.round(tvl)) {
    return new Percent(0);
  }
  return new Percent(
    Math.round(volume24h * (feeTier / (BIPS_BASE * 100)) * 365),
    Math.round(tvl)
  );
}

export function toInt(value: number | string, decimals: number): bigint {
  if (!value.toString().length) return BigInt(0);

  let [parsed, parsedValue] = parseScientific(value.toString());

  const [whole, fraction] = parsedValue.split(".");
  if (fraction && fraction.length > decimals) {
    // Truncate so 'parseUnits' doesn't trip on it
    parsedValue = whole + "." + fraction.slice(0, decimals);
    parsed = true;
  }

  return BigInt(
    parseUnits(
      parsed ? parsedValue.toString() : value.toString(),
      decimals
    ).toString()
  );
}

/**
 *
 * Taken from https://github.com/balancer/balancer-v2-monorepo/blob/36d282374b457dddea828be7884ee0d185db06ba/pvt/helpers/src/numbers.ts#L104
 *
 */
function parseScientific(num: string): [boolean, string] {
  // If the number is not in scientific notation return it as it is.
  if (!/\d+\.?\d*e[+-]*\d+/i.test(num)) {
    return [false, num];
  }

  // Remove the sign.
  const numberSign = Math.sign(Number(num));
  num = Math.abs(Number(num)).toString();

  // Parse into coefficient and exponent.
  const [coefficient, exponent] = num.toLowerCase().split("e");
  let zeros = Math.abs(Number(exponent));
  const exponentSign = Math.sign(Number(exponent));
  const [integer, decimals] = (
    coefficient.indexOf(".") != -1 ? coefficient : `${coefficient}.`
  ).split(".");

  if (exponentSign === -1) {
    zeros -= integer.length;
    num =
      zeros < 0
        ? integer.slice(0, zeros) + "." + integer.slice(zeros) + decimals
        : "0." + "0".repeat(zeros) + integer + decimals;
  } else {
    if (decimals) zeros -= decimals.length;
    num =
      zeros < 0
        ? integer + decimals.slice(0, zeros) + "." + decimals.slice(zeros)
        : integer + decimals + "0".repeat(zeros);
  }

  return [true, numberSign < 0 ? "-" + num : num];
}

export function fromInt(value: JSBI | bigint | number, decimals: number) {
  return parseFloat(value.toString()) / 10 ** decimals;
}

export function safeNearestUsableTick(
  pool: Pool,
  tick: number,
  tickLower: number,
  tickUpper: number,
  tokenType: 0 | 1
) {
  if (tick < TickMath.MIN_TICK) tick = TickMath.MIN_TICK;
  else if (tick > TickMath.MAX_TICK) tick = TickMath.MAX_TICK;
  else if (tokenType === 0 && tick >= tickUpper)
    tick = tickUpper - pool.tickSpacing;
  else if (tokenType === 1 && tick <= tickLower)
    tick = tickLower + pool.tickSpacing;

  return nearestUsableTick(tick, pool.tickSpacing);
}

function truncateValue(value: string, decimals: number): string {
  const parts = value.split(/[.,]/);
  const symbol = value.includes(".") ? "." : ",";
  if (parts.length > 1 && parts[1].length > decimals) {
    return parts[0] + symbol + parts[1].slice(0, decimals);
  }
  return value;
}

/**
 * Parses a CurrencyAmount from the passed string.
 * Returns the CurrencyAmount, or undefined if parsing fails.
 */
export default function tryParseCurrencyAmount<T extends Currency>(
  value?: string,
  currency?: T
): CurrencyAmount<T> | undefined {
  if (!value || !currency || isNaN(parseFloat(value))) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(
      truncateValue(value, currency.decimals),
      currency.decimals
    ).toString();
    if (typedValueParsed !== "0") {
      return CurrencyAmount.fromRawAmount(
        currency,
        JSBI.BigInt(typedValueParsed)
      );
    }
  } catch (error) {
    // fails if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.log("Opsie", error);
  }
  return undefined;
}

export function getRatio(positionData: PositionData, inverted?: boolean) {
  const baseToken = new Token(
    1,
    positionData.token0.id,
    +positionData.token0.decimals,
    "Base Token",
    "Base"
  );
  const quoteToken = new Token(
    1,
    positionData.token1.id,
    +positionData.token1.decimals,
    "Quote Token",
    "Quote"
  );
  const tickLower = +positionData.tickLower;
  const tickUpper = +positionData.tickUpper;
  const currentTick = TickMath.getTickAtSqrtRatio(
    JSBI.BigInt(positionData.sqrtPrice.toString())
  );

  let current = customTickToPrice(baseToken, quoteToken, currentTick, inverted);

  let lower = customTickToPrice(baseToken, quoteToken, tickLower, inverted);

  let upper = customTickToPrice(baseToken, quoteToken, tickUpper, inverted);

  try {
    if (!current.greaterThan(lower)) {
      return 100;
    } else if (!current.lessThan(upper)) {
      return 0;
    }

    const a = Number.parseFloat(lower.toSignificant(15));
    const b = Number.parseFloat(upper.toSignificant(15));
    const c = Number.parseFloat(current.toSignificant(15));

    const ratio = Math.floor(
      (1 /
        ((Math.sqrt(a * b) - Math.sqrt(b * c)) / (c - Math.sqrt(b * c)) + 1)) *
        100
    );

    if (ratio < 0 || ratio > 100) {
      throw Error("Out of range");
    }

    return ratio;
  } catch {
    return undefined;
  }
}

export function sanitizeNumber(value: string): string {
  if (value === "∞") return "∞";

  // Remove all non-numeric and non-dot characters
  value = value.replace(/[^\d.]/g, "");

  if (value.length === 0 || value === "0.000000000000000000") return "0";

  // Keep only the first dot and remove any subsequent dots
  const parts = value.split(".");

  // Rejoin the first part with the first valid dot (if exists) and the remaining numeric values
  return parts.length > 1
    ? parts[1].length > MAX_DECIMALS
      ? `${parts[0]}.${parts.slice(1).join("").slice(0, MAX_DECIMALS)}`
      : `${parts[0]}.${parts.slice(1).join("")}`
    : parts[0].slice(0, MAX_DECIMALS);
}
