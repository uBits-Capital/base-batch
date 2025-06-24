import { useMemo } from "react";
import { useWalletClient } from "wagmi";
import { GetWalletClientReturnType } from "@wagmi/core";
import { Web3Provider } from "@ethersproject/providers";

export function walletClientToProvider(
  walletClient: GetWalletClientReturnType,
) {
  const { chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  return new Web3Provider(transport as any, network);
}

/** Hook to convert a viem Wallet Client to an ethers.js Web3Provider. */
export function useEthersWeb3Provider({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });
  return useMemo(
    () => (walletClient ? walletClientToProvider(walletClient) : undefined),
    [walletClient],
  );
}
