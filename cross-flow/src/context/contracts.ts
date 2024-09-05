import { ethers, InterfaceAbi } from "ethers";
import Abi from "./abi.json";
import TokenAbi from "./tokenAbi.json";

export const getContract = (providerOrSigner: any, contractAddress: any) =>
  new ethers.Contract(contractAddress, Abi as InterfaceAbi, providerOrSigner);

export const getTokenContract = (providerOrSigner: any, contractAddress: any) =>
  new ethers.Contract(
    contractAddress,
    TokenAbi as InterfaceAbi,
    providerOrSigner
  );
