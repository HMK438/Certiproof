import { Wallet, JsonRpcProvider, keccak256, toUtf8Bytes } from "ethers";
import { CERTIFICATE_REGISTRY_ABI } from "../src/lib/contractAbi";
import { Contract } from "ethers";

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL!;
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY!;
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);
  const contract = new Contract(address, CERTIFICATE_REGISTRY_ABI, wallet);

  const canonical = JSON.stringify({
    studentName: "jane doe",
    studentId: "swe-2022-0141",
    institution: "university of malakand",
    credentialType: "bs software engineering",
    issueDate: "2026-06-15",
  });
  const hash = keccak256(toUtf8Bytes(canonical));
  console.log("Test certificate hash:", hash);

  console.log("\nIssuing...");
  const tx = await contract.issueCertificate(hash);
  const receipt = await tx.wait();
  console.log("Issued in tx:", receipt.hash);

  console.log("\nVerifying (read-only)...");
  const result = await contract.verifyCertificate(hash);
  console.log({
    exists: result[0],
    issuer: result[1],
    issuedAt: new Date(Number(result[2]) * 1000).toISOString(),
    revoked: result[3],
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
