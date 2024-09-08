# CrossFlow

CrossFlow is a cross-chain decentralized exchange (DEX) powered by Chainlink's Cross-Chain Interoperability Protocol (CCIP). It allows users to seamlessly swap tokens across multiple blockchain networks, providing a user-friendly and secure platform for decentralized finance (DeFi) transactions.

## Table of Contents
- [CrossFlow](#crossflow)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Features](#features)
  - [Architecture](#architecture)
  - [Technologies Used](#technologies-used)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
  - [Usage](#usage)
    - [Running the Frontend](#running-the-frontend)
    - [Deploying Smart Contracts](#deploying-smart-contracts)
  - [Smart Contracts](#smart-contracts)
    - [CrossFlow Contract](#crossflow-contract)
    - [CrossDex Contract](#crossdex-contract)

## Project Overview
CrossFlow facilitates seamless cross-chain token swaps, allowing users to move assets across different blockchain networks. By leveraging Chainlink's CCIP for cross-chain communication and Chainlink Price Feeds for accurate pricing, CrossFlow ensures secure and efficient transactions.

## Features
- **Cross-Chain Swaps:** Swap tokens across different blockchain networks.
- **Chainlink Integration:** Utilizes Chainlink CCIP for cross-chain transfers and Price Feeds for accurate market pricing.
- **User-Friendly UI:** Built with Next.js and Tailwind CSS for a responsive and intuitive interface.
- **Secure Wallet Connection:** Integrated with WalletConnect for secure wallet interactions.
- **Seamless Blockchain Interaction:** Powered by Ethers.js for smooth communication with the Ethereum network.

## Architecture
CrossFlow's architecture consists of two main smart contracts: CrossFlow and CrossDex.

- **CrossFlow Contract:** Handles cross-chain interactions using Chainlink CCIP.
- **CrossDex Contract:** Manages token swaps, particularly for tokens not natively supported by CCIP. Integrates Chainlink Price Feeds for accurate pricing.

## Technologies Used
- **Frontend:** Next.js, Tailwind CSS
- **Blockchain Interaction:** Ethers.js
- **Wallet Integration:** WalletConnect
- **Smart Contracts:** Solidity, Hardhat
- **Cross-Chain Protocol:** Chainlink CCIP
- **Pricing Data:** Chainlink Price Feeds

## Getting Started
To get started with CrossFlow, follow these steps:

### Prerequisites
- Node.js (v14 or higher)
- Yarn or npm
- Hardhat

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/PhantomOz/crossflow.git
   ```
2. Navigate to the project directory:
   ```bash
   cd crossflow
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Create a `.env.local` file in the root directory and add the following environment variables:

```plaintext
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

Replace `your_walletconnect_project_id` with your actual project IDs.

## Usage
### Running the Frontend
To start the frontend application:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Deploying Smart Contracts
1. Compile the smart contracts:
   ```bash
   npx hardhat compile
   ```
2. Deploy the contracts to a local or test network:
   ```bash
   npx hardhat ignition deploy ignition/modules/CrossFlow.ts --network <network_name> --verify
   ```

Replace `<network_name>` with your desired network (e.g., `localhost`, `sepolia`, `baseSepolia`).

## Smart Contracts
### CrossFlow Contract
- **Purpose:** Manages cross-chain interactions using Chainlink CCIP.
- **Location:** `contract/contracts/CrossFlow.sol`
- **Contract Address** 
  - Base: `_0xdE6788f932c08697b8B97B5d5efcf649076b168e_`
  - Sepolia: `_0xD2ba3C9bc4a8dd5C2c770635BE3A48ae24b14dd3_`

### CrossDex Contract
- **Purpose:** Handles token swaps and integrates Chainlink Price Feeds for pricing.
- **Location:** `contract/contracts/CrossDex.sol`
- **Contract Address** 
  - Base: `_0xcCfe202A9cfeC925413dD409E799A6f6c2B8bDe8_`
  - Sepolia: `_0xeC2b72C99E1af24B34aA98529825147b8543AE30_`

