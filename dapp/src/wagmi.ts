import { arbitrum, arbitrumSepolia, Chain } from "wagmi/chains";
import {
  WEB_ENV,
  HTTP_CHAIN_TRANSPORT_API_URL,
  WALLETCONNECT_PROJECT_ID,
} from "@/config";
import { createConfig, http } from "wagmi";
import { getDefaultConfig } from "connectkit";

let chains: readonly [Chain, ...Chain[]];
if (WEB_ENV === "mainnet") {
  chains = [arbitrum];
} else {
  chains = [arbitrumSepolia];
}

export const wagmiConfig = createConfig(
  getDefaultConfig({
    ssr: true,
    // Your dApps chains
    chains,
    transports: {
      // RPC URL for each chain
      [arbitrum.id]: http(HTTP_CHAIN_TRANSPORT_API_URL),
      [arbitrumSepolia.id]: http(HTTP_CHAIN_TRANSPORT_API_URL),
    },

    // Required API Keys
    walletConnectProjectId: WALLETCONNECT_PROJECT_ID,

    // Required App Info
    appName: "Pool Party",

    // Optional App Info
    appDescription: "Pool Party",
    appUrl: "https://beta.pool-party.xyz/pools", // your app's url
    // appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);
