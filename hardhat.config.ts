import { defineConfig, configVariable } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

// Hardhat's own config-variable system doesn't read .env.local the way
// Next.js does — load it manually so `SEPOLIA_RPC_URL` / `SEPOLIA_PRIVATE_KEY`
// set there are visible to `hardhat run`/`hardhat test` too.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local yet — fine for compile/test, only needed for deployment.
}

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    localhost: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
});
