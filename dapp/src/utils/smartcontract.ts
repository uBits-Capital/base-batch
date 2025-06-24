import { WETH9 } from "@uniswap/sdk-core";
import { CHAIN_ID, WEB_ENV, WETH_CONTRACT } from "@/config";

export function formatAddress(address: string): `0x${string}` {
  return `0x${address.replace("0x", "")}`;
}

export function toDeadline(expiration: number): number {
  return Math.floor((Date.now() + expiration) / 1000);
}

export function isWETH(tokenId: string): boolean { 
  if (WEB_ENV === "mainnet") {
    return (
      tokenId.toLocaleLowerCase() ===
      WETH9[CHAIN_ID].address.toLocaleLowerCase()
    );
  }
  return tokenId.toLocaleLowerCase() === WETH_CONTRACT.toLocaleLowerCase();
}
