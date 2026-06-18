"use client";
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { getRegistryContract, getTokenContract, SUPPORTED_CHAINS } from "../lib/contracts";

export interface AssetData {
  id: string;
  name: string;
  assetClass: number;
  status: number;
  tokenAddress: string;
  totalValue: bigint;
  documentCID: string;
  createdAt: number;
  totalSupply?: bigint;
  userBalance?: bigint;
  symbol?: string;
  isWhitelisted?: boolean;
}

export function useRegistry(
  provider: ethers.BrowserProvider | null,
  chainId: number | null,
  userAddress: string | null
) {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registryAddress =
    chainId !== null ? (SUPPORTED_CHAINS[chainId]?.registryAddress ?? null) : null;

  const fetchAssets = useCallback(async () => {
    if (!provider || !registryAddress) return;
    setLoading(true);
    setError(null);
    try {
      const registry = getRegistryContract(registryAddress, provider);
      const total = Number(await registry.totalAssets());

      const loaded: AssetData[] = [];
      for (let i = 0; i < total; i++) {
        const id = await registry.assetIds(i);
        const raw = await registry.getAsset(id);

        const asset: AssetData = {
          id,
          name: raw[1],
          assetClass: Number(raw[2]),
          status: Number(raw[3]),
          tokenAddress: raw[4],
          totalValue: raw[5],
          documentCID: raw[6],
          createdAt: Number(raw[7]),
        };

        // Enrich with token data
        try {
          const token = getTokenContract(asset.tokenAddress, provider);
          const [symbol, totalSupply] = await Promise.all([
            token.symbol() as Promise<string>,
            token.totalSupply() as Promise<bigint>,
          ]);
          asset.symbol = symbol;
          asset.totalSupply = totalSupply;

          if (userAddress) {
            const [balance, whitelisted] = await Promise.all([
              token.balanceOf(userAddress) as Promise<bigint>,
              token.whitelisted(userAddress) as Promise<boolean>,
            ]);
            asset.userBalance = balance;
            asset.isWhitelisted = whitelisted;
          }
        } catch {
          // Token data is non-critical
        }

        loaded.push(asset);
      }
      setAssets(loaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, [provider, registryAddress, userAddress]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  return { assets, loading, error, refetch: fetchAssets, registryAddress };
}
