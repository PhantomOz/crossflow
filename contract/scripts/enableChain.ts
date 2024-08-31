// scripts/enableChain.ts

import { ethers, network } from "hardhat";
import { Wallet } from "ethers";
import { CrossFlow, CrossFlow__factory } from "../typechain-types";
import { config } from "dotenv";
config();

async function main() {
  if (network.name !== `sepolia`) {
    console.error(`Must be called from Ethereum Sepolia`);
    return 1;
  }

  const privateKey = process.env.PRIVATE_KEY!;
  const rpcProviderUrl = process.env.ETHEREUM_SEPOLIA_RPC_URL;

  const provider = new ethers.JsonRpcProvider(rpcProviderUrl);
  const wallet = new Wallet(privateKey);
  const signer = wallet.connect(provider);

  const crossFlowAddressEthereumSepolia = `0xeC2b72C99E1af24B34aA98529825147b8543AE30`;
  const crossFlowAddressBaseSepolia = `0xe12BD3496ff2aa98f1B087F4320ceBfBDbD1Df3a`;
  const chainSelectorBaseSepolia = BigInt(10344971235874465080);
  const ccipExtraArgs = `0x97a657c90000000000000000000000000000000000000000000000000000000000030d40`;

  const crossFlow: CrossFlow = CrossFlow__factory.connect(
    crossFlowAddressEthereumSepolia,
    signer
  );

  const tx = await crossFlow.enableChain(
    chainSelectorBaseSepolia,
    crossFlowAddressBaseSepolia,
    ccipExtraArgs
  );

  console.log(`Transaction hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
