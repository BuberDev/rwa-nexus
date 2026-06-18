import { ethers } from "ethers";

const REGISTRY_ABI = [
  "function totalAssets() view returns (uint256)",
  "function assetIds(uint256) view returns (bytes32)",
  "function getAsset(bytes32) view returns (tuple(bytes32 id, string name, uint8 assetClass, uint8 status, address tokenAddress, uint256 totalValue, string documentCID, uint256 createdAt))",
  "event AssetRegistered(bytes32 indexed id, string name, uint8 assetClass, address tokenAddress)",
  "event AssetStatusChanged(bytes32 indexed id, uint8 newStatus)",
];

const TOKEN_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function symbol() view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

function getProvider(): ethers.JsonRpcProvider {
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) throw new Error("RPC_URL not set in environment");
  return new ethers.JsonRpcProvider(rpcUrl);
}

function getRegistry() {
  const address = process.env.REGISTRY_ADDRESS;
  if (!address) throw new Error("REGISTRY_ADDRESS not set");
  return new ethers.Contract(address, REGISTRY_ABI, getProvider());
}

export interface AssetMeta {
  id: string;
  name: string;
  assetClass: number;
  status: number;
  tokenAddress: string;
  totalValue: string;
  documentCID: string;
  createdAt: number;
  symbol?: string;
  totalSupply?: string;
}

export async function fetchAllAssets(): Promise<AssetMeta[]> {
  const registry = getRegistry();
  const total = Number(await registry.totalAssets());
  const assets: AssetMeta[] = [];

  for (let i = 0; i < total; i++) {
    const id: string = await registry.assetIds(i);
    const raw = await registry.getAsset(id);

    const asset: AssetMeta = {
      id,
      name: raw[1],
      assetClass: Number(raw[2]),
      status: Number(raw[3]),
      tokenAddress: raw[4],
      totalValue: raw[5].toString(),
      documentCID: raw[6],
      createdAt: Number(raw[7]),
    };

    try {
      const provider = getProvider();
      const token = new ethers.Contract(raw[4], TOKEN_ABI, provider);
      const [symbol, supply] = await Promise.all([
        token.symbol() as Promise<string>,
        token.totalSupply() as Promise<bigint>,
      ]);
      asset.symbol = symbol;
      asset.totalSupply = supply.toString();
    } catch {
      // non-critical enrichment
    }

    assets.push(asset);
  }
  return assets;
}

export interface TransferEvent {
  txHash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  tokenAddress: string;
}

export async function fetchTransferEvents(
  tokenAddress: string,
  fromBlock = 0
): Promise<TransferEvent[]> {
  const provider = getProvider();
  const token = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);
  const filter = token.filters.Transfer();
  const logs = await token.queryFilter(filter, fromBlock);

  return logs.map((log) => {
    const parsed = token.interface.parseLog(log as never)!;
    return {
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      from: parsed.args.from as string,
      to: parsed.args.to as string,
      value: (parsed.args.value as bigint).toString(),
      tokenAddress,
    };
  });
}
