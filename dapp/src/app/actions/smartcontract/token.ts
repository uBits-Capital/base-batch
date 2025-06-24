import { readFromToken } from "@/app/actions/smartcontract";
import { cache } from "@/utils/cache";
import { TOKEN_CACHE_TIME } from "@/config";

const TOKEN_NAME_CACHE = cache<string>(TOKEN_CACHE_TIME);
const TOKEN_SYMBOL_CACHE = cache<string>(TOKEN_CACHE_TIME);
const TOKEN_DECIMALS_CACHE = cache<number>(TOKEN_CACHE_TIME);

export async function getTokenName(
  tokenAddress: string,
  address?: `0x${string}`
): Promise<string> {
  if (TOKEN_NAME_CACHE.valid(tokenAddress))
    return TOKEN_NAME_CACHE.get(tokenAddress);
  return (await readFromToken("name", tokenAddress, [], address).then((name) =>
    TOKEN_NAME_CACHE.set(name as string, tokenAddress)
  )) as string;
}

export async function getTokenSymbol(
  tokenAddress: string,
  address?: `0x${string}`
): Promise<string> {
  if (TOKEN_SYMBOL_CACHE.valid(tokenAddress))
    return TOKEN_SYMBOL_CACHE.get(tokenAddress);
  return (await readFromToken("symbol", tokenAddress, [], address).then(
    (symbol) => TOKEN_SYMBOL_CACHE.set(symbol as string, tokenAddress)
  )) as string;
}

export async function getTokenDecimals(
  tokenAddress: string,
  address?: `0x${string}`
): Promise<number> {
  if (TOKEN_DECIMALS_CACHE.valid(tokenAddress))
    return TOKEN_DECIMALS_CACHE.get(tokenAddress);
  return (await readFromToken("decimals", tokenAddress, [], address).then(
    (decimals) => TOKEN_DECIMALS_CACHE.set(decimals as number, tokenAddress)
  )) as number;
}

export async function getAllowance(
  address: `0x${string}`,
  tokenAddress: string,
  spender: string
): Promise<number> {
  return (await readFromToken(
    "allowance",
    tokenAddress,
    [address, spender],
    address
  )) as number;
}
