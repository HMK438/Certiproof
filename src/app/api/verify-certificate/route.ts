import { NextResponse } from "next/server";
import { isValidCertificateHash } from "@/lib/certificateHash";
import { isContractConfigured } from "@/lib/contract";
import { verifyCertificateHash } from "@/lib/verify";
import { isRateLimited, getClientIdentifier } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);
  if (isRateLimited(identifier)) {
    return NextResponse.json({ error: "Too many checks — please wait a moment." }, { status: 429 });
  }

  if (!isContractConfigured()) {
    return NextResponse.json({ error: "Contract is not deployed yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const hash = (body as { hash?: unknown })?.hash;

  if (typeof hash !== "string" || !isValidCertificateHash(hash)) {
    return NextResponse.json({ error: "Invalid certificate hash." }, { status: 400 });
  }

  try {
    const result = await verifyCertificateHash(hash);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("verify-certificate error:", error);
    return NextResponse.json({ error: "Could not reach the network. Try again shortly." }, { status: 502 });
  }
}
