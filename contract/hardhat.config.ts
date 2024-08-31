import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `${process.env.ETHEREUM_SEPOLIA_RPC_URL}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
    baseSepolia: {
      url: `${process.env.BASE_SEPOLIA_RPC_URL}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: `${process.env.ETHERSCAN_API_KEY}`,
      baseSepolia: `${process.env.BASESCAN_API_KEY}`,
    },
  },
};

export default config;
