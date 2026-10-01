import { NextResponse } from "next/server";
import { getReadOnlyContract, isContractConfigured } from "@/lib/contract";
import { isRateLimited, getClientIdentifier } from "@/lib/rate-limit";

export const runtime = "nodejs";

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);
  if (isRateLimited(identifier)) {
    return NextResponse.json({ error: "Too many checks — please wait a moment." }, { status: 429 });
  }

  if (!isContractConfigured()) {
    return NextResponse.json({ error: "Contract is not deployed yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const address = (body as { address?: unknown })?.address;

  if (typeof address !== "string" || !ADDRESS_PATTERN.test(address)) {
    return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
  }

  try {
    const isIssuer = (await getReadOnlyContract().isIssuer(address)) as boolean;
    return NextResponse.json({ isIssuer });
  } catch (error) {
    console.error("check-issuer error:", error);
    return NextResponse.json({ error: "Could not reach the network. Try again shortly." }, { status: 502 });
  }
}
