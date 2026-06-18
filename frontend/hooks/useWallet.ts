"use client";
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { SUPPORTED_CHAINS } from "../lib/contracts";

export type WalletState =
  | { status: "disconnected" }
  | { status: "connecting" }
  | { status: "connected"; address: string; chainId: number; provider: ethers.BrowserProvider; signer: ethers.JsonRpcSigner }
  | { status: "unsupported_chain"; chainId: number }
  | { status: "error"; message: string };

declare global {
  interface Window { ethereum?: ethers.Eip1193Provider & { on: (e: string, cb: unknown) => void; removeListener: (e: string, cb: unknown) => void }; }
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({ status: "disconnected" });

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setWallet({ status: "error", message: "MetaMask not detected. Please install it." });
      return;
    }
    setWallet({ status: "connecting" });
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const { chainId } = await provider.getNetwork();
      const chainIdNum = Number(chainId);

      if (!SUPPORTED_CHAINS[chainIdNum]) {
        setWallet({ status: "unsupported_chain", chainId: chainIdNum });
        return;
      }
      setWallet({ status: "connected", address, chainId: chainIdNum, provider, signer });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection failed";
      setWallet({ status: "error", message });
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({ status: "disconnected" });
  }, []);

  // Sync on account / chain changes
  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) return;

    const onAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) setWallet({ status: "disconnected" });
      else connect();
    };
    const onChainChanged = () => connect();

    eth.on("accountsChanged", onAccountsChanged);
    eth.on("chainChanged", onChainChanged);
    return () => {
      eth.removeListener("accountsChanged", onAccountsChanged);
      eth.removeListener("chainChanged", onChainChanged);
    };
  }, [connect]);

  const shortAddress = wallet.status === "connected"
    ? `${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)}`
    : null;

  const chainName = wallet.status === "connected"
    ? (SUPPORTED_CHAINS[wallet.chainId]?.name ?? `Chain ${wallet.chainId}`)
    : null;

  return { wallet, connect, disconnect, shortAddress, chainName };
}
