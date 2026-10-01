import { writeFile } from "node:fs/promises";
import hre from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers";

const demoFields = {
  studentName: "Jane Doe",
  studentId: "SWE-2022-0141",
  institution: "University of Malakand",
  credentialType: "BS Software Engineering",
  issueDate: "2026-06-15",
};

async function main() {
  const { ethers } = await hre.network.create();
  const [deployer] = await ethers.getSigners();
  const registry = await ethers.deployContract("CertificateRegistry");
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  const canonical = JSON.stringify({
    studentName: demoFields.studentName.toLowerCase(),
    studentId: demoFields.studentId.toLowerCase(),
    institution: demoFields.institution.toLowerCase(),
    credentialType: demoFields.credentialType.toLowerCase(),
    issueDate: demoFields.issueDate,
  });
  const certificateHash = keccak256(toUtf8Bytes(canonical));
  const transaction = await registry.issueCertificate(certificateHash);
  await transaction.wait();

  await writeFile(
    ".env.local",
    `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\nNEXT_PUBLIC_SEPOLIA_RPC_URL=http://127.0.0.1:8545\n`,
  );
  await writeFile(
    ".demo-certificate.txt",
    [
      "CertiProof local demo certificate",
      `Student name: ${demoFields.studentName}`,
      `Student ID: ${demoFields.studentId}`,
      `Institution: ${demoFields.institution}`,
      `Credential type: ${demoFields.credentialType}`,
      `Issue date: ${demoFields.issueDate}`,
      `Certificate ID: ${certificateHash}`,
      `Issuer wallet: ${deployer.address}`,
      `Contract: ${contractAddress}`,
    ].join("\n") + "\n",
  );

  console.log("\nLocal CertiProof demo is ready.");
  console.log(`Contract: ${contractAddress}`);
  console.log(`Certificate ID: ${certificateHash}`);
  console.log(`Issuer wallet: ${deployer.address}`);
  console.log("Demo details saved to .demo-certificate.txt");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
