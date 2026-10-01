import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.create();

  const [deployer] = await ethers.getSigners();
  console.log("Deploying CertificateRegistry with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const registry = await ethers.deployContract("CertificateRegistry");
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("\nCertificateRegistry deployed to:", address);
  console.log("Deployer is the initial owner and initial authorized issuer.");
  console.log("\nNext steps:");
  console.log(`1. Add NEXT_PUBLIC_CONTRACT_ADDRESS=${address} to .env.local`);
  console.log("2. Verify on Etherscan: npx hardhat verify --network sepolia " + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
