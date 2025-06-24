import {
  readFromPoolPartyManager,
  writeToPoolPartyManager,
} from "@/app/actions/smartcontract";
import { PermitBatch } from "@uniswap/permit2-sdk";

export type IPoolPartyPositionManager_FeatureSettings = {
  name: string;
  description: string;
  operatorFee: number;
  hiddenFields: IPoolPartyPositionManager_HiddenFields;
};

export type IPoolPartyPositionManager_HiddenFields = {
  showPriceRange: boolean;
  showTokenPair: boolean;
  showInOutRange: boolean;
};

export type IPoolPartyPositionManager_PositionData = {
  positionId: string;
  pool: string;
  operator: string;
  token0: string;
  token1: string;
  totalSupply0: bigint;
  totalSupply1: bigint;
  fee: number;
  tickLower: number;
  tickUpper: number;
  inRange: number;
  closed: boolean;
  featureSettings: IPoolPartyPositionManager_FeatureSettings;
  totalInvestors: bigint;
};

export type IPoolPartyPositionManager_InvestorPositionData = {
  positionId: string;
  pool: string;
  token0: string;
  token1: string;
  amount0: number;
  amount1: number;
  rewards0: number;
  rewards1: number;
  fee: number;
};

export type IPoolPartyPositionManager_CreatePositionParams = {
  proof: string[];
  permitBatch: PermitBatch;
  signature: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  amount0Min: bigint;
  amount1Min: bigint;
  deadline: bigint;
  sqrtPriceX96: number;
  featureSettings: IPoolPartyPositionManager_FeatureSettings;
};

export type IPoolPartyPositionManager_ClosePoolParams = {
  positionId: string;
  deadline: bigint;
};

export async function getAllPositionIds() {
  return (await readFromPoolPartyManager("allPositions", [])) as string[];
}

export async function getPositionDataByPoolAddress(pool: string) {
  return (await readFromPoolPartyManager("positionData", [
    pool,
  ])) as IPoolPartyPositionManager_PositionData;
}

export async function listOfPositionDataByInvestor(
  address: `0x${string}`,
  positions: string[] = []
) {
  return (await readFromPoolPartyManager(
    "listOfPositionDataBy",
    [address, positions],
    address
  )) as IPoolPartyPositionManager_InvestorPositionData[];
}

export async function getInvestorPositions(address: `0x${string}`) {
  return (await readFromPoolPartyManager(
    "investorPositions",
    [address],
    address
  )) as string[];
}

export async function newPosition(
  address: `0x${string}`,
  data: IPoolPartyPositionManager_CreatePositionParams,
  nativeTokenAmount: bigint
) {
  return writeToPoolPartyManager(
    address,
    "createPosition",
    [data],
    nativeTokenAmount
  );
}

export async function closePool(
  address: `0x${string}`,
  data: IPoolPartyPositionManager_ClosePoolParams
) {
  return writeToPoolPartyManager(address, "closePool", [data]);
}
