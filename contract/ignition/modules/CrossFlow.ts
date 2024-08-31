import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const Router = "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59";
const baseRouter = "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93";
const Link = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
const baseLink = "0xE4aB69C077896252FAFBD49EFD26B5D171A32410";
const ChainSelector = BigInt(16015286601757825753);
const baseChainSelector = BigInt(10344971235874465080);
const USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const baseUSDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const Dex = "0xeC2b72C99E1af24B34aA98529825147b8543AE30";
const baseDex = "0xcCfe202A9cfeC925413dD409E799A6f6c2B8bDe8";

const CrossFlowModule = buildModule("CrossFlow", (m) => {
  const router = m.getParameter("ccipRouterAddress", baseRouter);
  const link = m.getParameter("linkTokenAddress", baseLink);
  const chainSelector = m.getParameter(
    "currentChainSelector",
    baseChainSelector
  );
  const usdc = m.getParameter("usdcToken", baseUSDC);
  const dex = m.getParameter("dex", baseDex);

  const crossFlow = m.contract("CrossFlow", [
    router,
    link,
    chainSelector,
    usdc,
    dex,
  ]);

  return { crossFlow };
});

export default CrossFlowModule;
