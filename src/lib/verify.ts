import { getReadOnlyContract } from "@/lib/contract";

export type VerificationResult = {
  exists: boolean;
  issuer: string;
  issuedAt: number;
  revoked: boolean;
  revokedAt: number;
};

export async function verifyCertificateHash(hash: string): Promise<VerificationResult> {
  const contract = getReadOnlyContract();
  const result = await contract.verifyCertificate(hash);
  return {
    exists: result[0] as boolean,
    issuer: result[1] as string,
    issuedAt: Number(result[2]),
    revoked: result[3] as boolean,
    revokedAt: Number(result[4]),
  };
}
