import { ethers } from "ethers";

export const REGISTRY_ABI = [
  "function totalAssets() view returns (uint256)",
  "function assetIds(uint256 index) view returns (bytes32)",
  "function getAsset(bytes32 id) view returns (tuple(bytes32 id, string name, uint8 assetClass, uint8 status, address tokenAddress, uint256 totalValue, string documentCID, uint256 createdAt))",
  "function registerAsset(string name, string symbol, uint8 assetClass, uint256 totalValue, string documentCID) returns (bytes32 id, address token)",
  "function setAssetStatus(bytes32 id, uint8 newStatus)",
  "event AssetRegistered(bytes32 indexed id, string name, uint8 assetClass, address tokenAddress)",
  "event AssetStatusChanged(bytes32 indexed id, uint8 newStatus)",
] as const;

export const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function assetId() view returns (bytes32)",
  "function documentCID() view returns (string)",
  "function whitelisted(address) view returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function setWhitelist(address account, bool status)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Minted(address indexed to, uint256 amount)",
  "event Burned(address indexed from, uint256 amount)",
] as const;

export const SUPPORTED_CHAINS: Record<number, { name: string; registryAddress: string }> = {
  11155111: {
    name: "Ethereum Sepolia",
    registryAddress: process.env.NEXT_PUBLIC_REGISTRY_SEPOLIA ?? "",
  },
  80002: {
    name: "Polygon Amoy",
    registryAddress: process.env.NEXT_PUBLIC_REGISTRY_AMOY ?? "",
  },
  421614: {
    name: "Arbitrum Sepolia",
    registryAddress: process.env.NEXT_PUBLIC_REGISTRY_ARB_SEPOLIA ?? "",
  },
  31337: {
    name: "Hardhat Local",
    registryAddress: process.env.NEXT_PUBLIC_REGISTRY_LOCAL ?? "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  },
};

export function getRegistryContract(
  address: string,
  signerOrProvider: ethers.Signer | ethers.Provider
) {
  return new ethers.Contract(address, REGISTRY_ABI, signerOrProvider);
}

export function getTokenContract(
  address: string,
  signerOrProvider: ethers.Signer | ethers.Provider
) {
  return new ethers.Contract(address, TOKEN_ABI, signerOrProvider);
}

export const ASSET_CLASS_LABELS = [
  "Real Estate",
  "Commodity",
  "Private Credit",
  "Infrastructure",
  "Other",
] as const;

export const ASSET_STATUS_LABELS = [
  "Pending",
  "Active",
  "Paused",
  "Redeemed",
] as const;

export const ASSET_STATUS_COLORS: Record<number, string> = {
  0: "bg-yellow-100 text-yellow-800",
  1: "bg-green-100 text-green-800",
  2: "bg-orange-100 text-orange-800",
  3: "bg-gray-100 text-gray-500",
};
