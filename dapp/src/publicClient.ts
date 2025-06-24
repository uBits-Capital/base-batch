import { createPublicClient, http } from "viem";
import { arbitrum, arbitrumSepolia, Chain } from "wagmi/chains";
import { SERVER_ENV } from "@/config"; 

let chains: readonly [Chain, ...Chain[]];
if (SERVER_ENV === "mainnet") {
  chains = [arbitrum];
} else {
  chains = [arbitrumSepolia];
}

export const client = createPublicClient({
  chain: chains[0],
  transport: http(),
});
