import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDC = ["0xa2f78ab2355fe2f984d808b5cee7fd0a93d5270e", "USDC"];
const baseUSDC = ["0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165", "USDC"];
const DAI = ["0x14866185b1962b63c3ea9e03bc1da838bab34c19", "DAI"];
const baseDAI = ["0xD1092a65338d049DB68D7Be6bD89d17a0929945e", "DAI"];
const LINK = ["0xc59e3633baac79493d908e63626716e204a45edf", "LINK"];
const baseLINK = ["0xb113F5A928BCfF189C998ab20d753a47F9dE5A61", "LINK"];
const WETH = ["0x694aa1769357215de4fac081bf1f309adc325306", "WETH"];
const baseWETH = ["0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1", "WETH"];
const ETH = ["0x694aa1769357215de4fac081bf1f309adc325306", "ETH"];
const baseETH = ["0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1", "ETH"];

const tokenDats = [USDC, DAI, LINK, WETH, ETH];
const basetokenDats = [baseUSDC, baseDAI, baseLINK, baseWETH, baseETH];
const tokens = [
  "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
  "0x6b18b2c8fe8b9031ae44fce116ba8f6290e98146",
  "0x779877a7b0d9e8603169ddbd7836e478b4624789",
  "0x097d90c9d3e0b50ca60e1ae45f6a81010f9fb534",
  "0x1111111111111111111111111111111111111111",
];
const basetokens = [
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  "0x1999654469856017612c077E917476A7aa740eD6",
  "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
  "0x4200000000000000000000000000000000000006",
  "0x1111111111111111111111111111111111111111",
];

const CrossDexModule = buildModule("CrossDexModule", (m) => {
  const tokenDATAS = m.getParameter("_tokenDatas", basetokenDats);
  const toks = m.getParameter("_tokens", basetokens);
  const crossDex = m.contract("CrossDex", [tokenDATAS, toks]);

  return { crossDex };
});

export default CrossDexModule;
