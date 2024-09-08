import { getContract, getProvider } from "@/context/contracts";
import { useWeb3ModalAccount, useWeb3ModalProvider } from "@web3modal/ethers/react";
import { BrowserProvider, Eip1193Provider, parseEther, parseUnits, WeiPerEther } from "ethers";
import { useEffect, useState } from "react";

export function useBridge() {
    const [contractAddress, setContractAddress] = useState<`0x${string}`>();
    const { address, chainId, isConnected } = useWeb3ModalAccount()
    const { walletProvider } = useWeb3ModalProvider()

    useEffect(() => {
        if (chainId)
            setContractAddress(chainAddress[chainId]);
    }, [chainId]);

    async function sendToken(chainSelector: BigInt, to: `0x${string}`, token: `0x${string}`, amount: number, tokenType: number, payFeesIn: number, symbol: string) {
        console.log(chainSelector, to, token, amount, tokenType, payFeesIn, symbol);
        const ethersProvider = await getProvider(walletProvider);
        const signer = await ethersProvider?.getSigner();
        console.log(signer);
        const contract = await getContract(signer, contractAddress);
        if (contract.interface.hasFunction('crossChainTransferFrom')) {
            await contract.crossChainTransferFrom(BigInt(Number(chainSelector)), to, token, parseUnits(String(amount), 18), tokenType, payFeesIn, symbol, { value: parseEther(String(amount)) });
        } else {
            console.log('Functions does not exist')
        }
    }

    async function getFee(chainSelector: BigInt, to: `0x${string}`, token: `0x${string}`, amount: BigInt, tokenType: number, payFeesIn: number, symbol: string) {
        const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider)
        const signer = await ethersProvider.getSigner();
        const contract = await getContract(signer, contractAddress);
        await contract.crossChainTransferFrom(chainSelector, to, token, amount, tokenType, payFeesIn, symbol);
    }
    return { sendToken, getFee };
}

export const toChainSelector: any = {
    11155111: [
        {
            id: "84532",
            name: "Base Sepolia"
        },
    ],

    84532: [
        {
            id: "11155111",
            name: "Ethereum Sepolia",
        },
    ],

}

export const chainCurrency: any = {
    11155111: ['DAI', 'USDC', 'LINK', 'WETH', 'ETH'],
    84532: ['DAI', 'USDC', 'LINK', 'WETH', 'ETH']
}


export interface ToChain {
    id: string;
    name: string;
}

export const chainAddress: any = {
    11155111: `0xD2ba3C9bc4a8dd5C2c770635BE3A48ae24b14dd3`,
    84532: `0xdE6788f932c08697b8B97B5d5efcf649076b168e`,
}

export const CCIPChainSelector: any = {
    11155111: 16015286601757825753,
    84532: 10344971235874465080,
}

export const MultiChainTokenAddress: any = {
    11155111: {
        "DAI": {
            address: "0x6b18B2c8fE8B9031aE44FCE116bA8f6290E98146"
        },
        "USDC": { address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" },
        "LINK": { address: "0x779877A7B0D9E8603169DdbD7836e478b4624789" },
        "WETH": { address: "0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534" },
        "ETH": { address: "0x1111111111111111111111111111111111111111" }
    },
    84532: {
        "DAI": {
            address: "0x1999654469856017612c077E917476A7aa740eD6"
        },
        "USDC": { address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" },
        "LINK": { address: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410" },
        "WETH": { address: "0x4200000000000000000000000000000000000006" },
        "ETH": { address: "0x1111111111111111111111111111111111111111" }
    },
}