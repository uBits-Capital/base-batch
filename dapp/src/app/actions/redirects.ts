"use server";

import { redirect } from "next/navigation";

export async function redirectToPools() {
  redirect(`/pools`);
}

export async function redirectToPortfolio() {
  redirect(`/portfolio`);
}

export async function redirectToCreatorAddLiquidity(
  token0: string,
  token1: string,
  feeTier: number,
) {
  redirect(`/creator/add/${token0}/${token1}/${feeTier}`);
}

export async function redirectToInvestorAddLiquidity(positionId: string) {
  redirect(`/investor/add/${positionId}`);
}
