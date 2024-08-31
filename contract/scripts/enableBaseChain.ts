// scripts/enableChain.ts

import { ethers, network } from "hardhat";
import { Wallet } from "ethers";
import { CrossFlow, CrossFlow__factory } from "../typechain-types";
import { config } from "dotenv";
config();

async function main() {
  if (network.name !== `baseSepolia`) {
    console.error(`Must be called from Ethereum Sepolia`);
    return 1;
  }

  const privateKey = process.env.PRIVATE_KEY!;
  const rpcProviderUrl = process.env.BASE_SEPOLIA_RPC_URL;

  const provider = new ethers.JsonRpcProvider(rpcProviderUrl);
  const wallet = new Wallet(privateKey);
  const signer = wallet.connect(provider);

  const crossFlowAddressEthereumSepolia = `0x472B67fc8d8C9f0276E6DFb402891936dee146A3`;
  const crossFlowAddressBaseSepolia = `0xe12BD3496ff2aa98f1B087F4320ceBfBDbD1Df3a`;
  const chainSelectorBaseSepolia = BigInt(16015286601757825753);
  const ccipExtraArgs = `0x97a657c90000000000000000000000000000000000000000000000000000000000030d40`;

  const crossFlow: CrossFlow = CrossFlow__factory.connect(
    crossFlowAddressBaseSepolia,
    signer
  );

  const tx = await crossFlow.enableChain(
    chainSelectorBaseSepolia,
    crossFlowAddressEthereumSepolia,
    ccipExtraArgs
  );

  console.log(`Transaction hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
