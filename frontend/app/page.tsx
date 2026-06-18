"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../hooks/useWallet";
import { useRegistry } from "../hooks/useRegistry";
import { AssetData } from "../hooks/useRegistry";
import { WalletConnect } from "../components/wallet/WalletConnect";
import { AssetCard } from "../components/ui/AssetCard";
import { TransferPanel } from "../components/ui/TransferPanel";
import { ASSET_CLASS_LABELS } from "../lib/contracts";
import styles from "./page.module.css";

export default function Home() {
  const { wallet, shortAddress, chainName } = useWallet();
  const isConnected = wallet.status === "connected";

  const { assets, loading, error, refetch } = useRegistry(
    isConnected ? wallet.provider : null,
    isConnected ? wallet.chainId : null,
    isConnected ? wallet.address : null
  );

  const [selected, setSelected] = useState<AssetData | null>(null);
  const [classFilter, setClassFilter] = useState<number | null>(null);

  const filtered = classFilter !== null
    ? assets.filter((a) => a.assetClass === classFilter)
    : assets;

  const totalTVL = assets.reduce((sum, a) => sum + a.totalValue, 0n);
  const tvlFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(ethers.formatEther(totalTVL)));

  return (
    <div className={styles.page}>
      {/* ── Navbar ───────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={`container ${styles.navInner}`}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>◈</span>
            <span className={styles.logoText}>RWA Nexus</span>
          </div>
          <WalletConnect />
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <header className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>On-Chain Asset Registry</p>
            <h1 className={styles.headline}>
              Real-world assets,<br />tokenized on Ethereum.
            </h1>
            <p className={styles.sub}>
              Browse, verify, and transfer fractional ownership of tokenized real estate,
              commodities, private credit, and infrastructure — secured by smart contracts,
              transparent on-chain.
            </p>
          </div>

          {/* Stats bar */}
          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{assets.length}</span>
              <span className={styles.statLabel}>Registered Assets</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>{tvlFormatted}</span>
              <span className={styles.statLabel}>Total Value Locked</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {isConnected ? (
                  <span className={styles.connected}>
                    <span className={styles.dot} />{chainName}
                  </span>
                ) : "—"}
              </span>
              <span className={styles.statLabel}>Connected Network</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className={`container ${styles.main}`}>

        {/* Filter bar */}
        <div className={styles.filterBar}>
          <button
            className={`btn-ghost ${classFilter === null ? styles.filterActive : ""}`}
            onClick={() => setClassFilter(null)}
          >
            All
          </button>
          {ASSET_CLASS_LABELS.map((label, i) => (
            <button
              key={i}
              className={`btn-ghost ${classFilter === i ? styles.filterActive : ""}`}
              onClick={() => setClassFilter(i === classFilter ? null : i)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && (
          <div className={styles.emptyState}>
            <div className={styles.spinner} />
            <p>Loading assets from chain…</p>
          </div>
        )}

        {error && (
          <div className={styles.errorBanner}>
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className={styles.emptyState}>
            {!isConnected ? (
              <>
                <p className={styles.emptyTitle}>Connect your wallet to load assets.</p>
                <p className={styles.emptySub}>
                  Supports MetaMask on Ethereum Sepolia, Polygon Amoy, and Arbitrum Sepolia.
                </p>
              </>
            ) : (
              <>
                <p className={styles.emptyTitle}>No assets registered yet.</p>
                <p className={styles.emptySub}>Deploy the contract and register your first asset.</p>
              </>
            )}
          </div>
        )}

        {filtered.length > 0 && (
          <div className={styles.grid}>
            {/* Asset grid */}
            <div className={styles.assetGrid}>
              {filtered.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  selected={selected?.id === asset.id}
                  onClick={() => setSelected(selected?.id === asset.id ? null : asset)}
                />
              ))}
            </div>

            {/* Detail panel */}
            {selected && (
              <aside className={styles.detail}>
                <div className={`cert-card ${styles.detailCard}`}>
                  <h3 className={styles.detailTitle}>{selected.name}</h3>
                  <dl className={styles.detailList}>
                    <div>
                      <dt>Token contract</dt>
                      <dd className="address">{selected.tokenAddress}</dd>
                    </div>
                    <div>
                      <dt>Asset ID</dt>
                      <dd className="address">{selected.id}</dd>
                    </div>
                    <div>
                      <dt>Document</dt>
                      <dd>
                        <a
                          className="address"
                          href={`https://ipfs.io/ipfs/${selected.documentCID}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          ipfs://{selected.documentCID.slice(0, 20)}…
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt>Whitelisted</dt>
                      <dd>{selected.isWhitelisted ? "Yes" : "No — contact issuer"}</dd>
                    </div>
                  </dl>
                </div>

                {isConnected && selected.isWhitelisted && (
                  <TransferPanel
                    asset={selected}
                    signer={(wallet as Extract<typeof wallet, { status: "connected" }>).signer}
                    onSuccess={refetch}
                  />
                )}

                {isConnected && !selected.isWhitelisted && (
                  <p className={styles.notWhitelisted}>
                    Your address is not whitelisted for this asset. Contact the issuer to
                    participate.
                  </p>
                )}
              </aside>
            )}
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <span>RWA Nexus · github.com/BuberDev</span>
          <span className="address">
            Smart contracts: Ethereum + L2 · Solidity 0.8.24 · OpenZeppelin 5
          </span>
        </div>
      </footer>
    </div>
  );
}
