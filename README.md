# RWA Nexus

**Full-stack Web3 platform for tokenizing and managing real-world assets (RWA) on Ethereum and L2 networks.**

[![CI](https://github.com/BuberDev/rwa-nexus/actions/workflows/ci.yml/badge.svg)](https://github.com/BuberDev/rwa-nexus/actions)

---

## Overview

RWA Nexus demonstrates end-to-end Web3 full-stack development:

| Layer | Stack |
|---|---|
| **Smart Contracts** | Solidity 0.8.24 · OpenZeppelin 5 · Hardhat |
| **Frontend** | Next.js 14 · React 18 · TypeScript · ethers.js v6 |
| **Backend** | Node.js · Express · TypeScript · ethers.js v6 |
| **Networks** | Ethereum Sepolia · Polygon Amoy · Arbitrum Sepolia |

### Smart Contracts

- **`RWAToken`** — ERC-20 token representing fractional ownership of a real-world asset. Includes KYC/AML whitelist enforcement on every transfer, owner-controlled minting/burning, IPFS document pointer, and emergency pause.
- **`RWARegistry`** — On-chain registry that deploys `RWAToken` contracts and tracks asset lifecycle (Pending → Active → Paused → Redeemed). Emits indexed events compatible with The Graph.

### Frontend

- MetaMask wallet connection via `ethers.BrowserProvider`
- Multi-chain support (Sepolia, Polygon Amoy, Arbitrum Sepolia, Hardhat local)
- Asset dashboard: browse registered assets, view on-chain metadata, filter by class
- Token transfer UI with real-time whitelist validation and transaction confirmation
- Responsive design; certificate-style asset cards

### Backend (off-chain API)

- `GET /api/assets` — list all registered assets with token metadata
- `GET /api/assets/:id` — single asset detail
- `GET /api/events/transfers?token=0x...` — historical Transfer events for a token
- `GET /health` — service health check

---

## Project Structure

```
rwa-nexus/
├── contracts/          # Solidity + Hardhat
│   ├── src/
│   │   ├── RWAToken.sol
│   │   └── RWARegistry.sol
│   └── test/
│       └── RWARegistry.test.ts
├── frontend/           # Next.js 14 App Router
│   ├── app/
│   ├── components/
│   ├── hooks/
│   └── lib/
├── backend/            # Express REST API
│   ├── src/
│   │   ├── routes/
│   │   └── services/
│   └── test/
├── scripts/
│   └── deploy.ts
└── .github/workflows/ci.yml
```

---

## Quick Start

### 1. Install dependencies

```bash
cd contracts && npm install
cd ../frontend && npm install
cd ../backend && npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in ALCHEMY_KEY, PRIVATE_KEY, etc.
```

### 3. Run local blockchain + deploy

```bash
cd contracts
npx hardhat node &          # starts local Hardhat network
npx hardhat run ../scripts/deploy.ts --network hardhat
```

### 4. Start frontend

```bash
cd frontend && npm run dev   # http://localhost:3000
```

### 5. Start backend

```bash
cd backend && npm run dev    # http://localhost:3001
```

---

## Testing

```bash
# Smart contract tests
cd contracts && npm test

# Backend tests
cd backend && npm test

# Frontend type-check
cd frontend && npm run type-check
```

---

## Deployment

Contracts can be deployed to any EVM-compatible network:

```bash
cd contracts
npm run deploy:sepolia        # Ethereum Sepolia testnet
```

After deployment, update the contract addresses in `.env` and `NEXT_PUBLIC_REGISTRY_*` variables.

---

## Key Design Decisions

**Whitelist-gated transfers** — RWA tokens represent regulated securities. Every `transfer()` checks the whitelist, preventing non-KYC'd addresses from holding tokens without explicit issuer approval.

**Registry as factory** — `RWARegistry.registerAsset()` deploys a fresh `RWAToken` per asset. This gives each asset its own token address, supply, and document pointer while keeping a single authoritative on-chain registry.

**ethers.js v6 throughout** — Both frontend and backend use the same library version, keeping the ABI encoding consistent and avoiding v5/v6 interface mismatches.

---

## Author

**Dawid Bubernak** · [github.com/BuberDev](https://github.com/BuberDev) · dawid.bubernak@gmail.com
