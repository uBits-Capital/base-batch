import { INFURA_API_KEY } from "@/config";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = await fetch(INFURA_API_KEY, {
    ...request,
    method: "POST",
    body: JSON.stringify(await request.json()),
  });
  return NextResponse.json(await response.json());
}
