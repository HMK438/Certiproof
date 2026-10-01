import { keccak256, toUtf8Bytes } from "ethers";

export type CertificateFields = {
  studentName: string;
  studentId: string;
  institution: string;
  credentialType: string;
  issueDate: string; // ISO date, e.g. "2026-06-15"
};

/**
 * Normalizes a field so that harmless formatting differences (extra
 * whitespace, casing) never produce a different hash for what is
 * semantically the same credential. This is the single most important
 * design decision in the hashing scheme: the issuer and a verifier
 * re-typing the same certificate months apart must land on an identical
 * hash, or the whole verification model breaks.
 */
function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Produces the exact canonical string that gets hashed. Field order is
 * fixed (not derived from object key order) so the output is deterministic
 * across JS engines. Exported mainly so the hash can be explained/audited —
 * not required for normal use.
 */
export function canonicalizeCertificate(fields: CertificateFields): string {
  return JSON.stringify({
    studentName: normalize(fields.studentName),
    studentId: normalize(fields.studentId),
    institution: normalize(fields.institution),
    credentialType: normalize(fields.credentialType),
    issueDate: fields.issueDate.trim(),
  });
}

/**
 * Computes the keccak256 hash that gets anchored on-chain via
 * CertificateRegistry.issueCertificate(bytes32). Both the issuer (at
 * issuance) and any verifier (re-deriving from a presented document) call
 * this same function — if the inputs match the original credential, the
 * hash matches, and the on-chain lookup succeeds.
 */
export function computeCertificateHash(fields: CertificateFields): `0x${string}` {
  const canonical = canonicalizeCertificate(fields);
  return keccak256(toUtf8Bytes(canonical)) as `0x${string}`;
}

export function isValidCertificateHash(value: string): value is `0x${string}` {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}
