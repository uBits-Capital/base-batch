"use client";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { SimpleMerkleTree } from "@openzeppelin/merkle-tree";
import { keccak256 } from "@ethersproject/keccak256";

import { whitelistedCreators, whitelistedInvestors } from "@/constants";

export function useMerkelTree() {
  const { isConnected, address } = useAccount();

  const creatorProof = useMemo(() => {
    if (!isConnected || !address) {
      return;
    }

    const treeCreators = SimpleMerkleTree.of(whitelistedCreators, {
      sortLeaves: true,
    });

    try {
      return treeCreators.getProof(keccak256(address));
    } catch (error) {
      console.error(error);
    }
  }, [isConnected, address]);

  const investorProof = useMemo(() => {
    if (!isConnected || !address) {
      return;
    }

    const treeInvestors = SimpleMerkleTree.of(whitelistedInvestors, {
      sortLeaves: true,
    });

    try {
      return treeInvestors.getProof(keccak256(address));
    } catch (error) {
      console.error(error);
    }
  }, [isConnected, address]);

  return { creatorProof, investorProof };
}
