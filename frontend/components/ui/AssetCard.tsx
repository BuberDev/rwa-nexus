"use client";
import { ethers } from "ethers";
import { AssetData } from "../../hooks/useRegistry";
import {
  ASSET_CLASS_LABELS,
  ASSET_STATUS_LABELS,
} from "../../lib/contracts";
import styles from "./AssetCard.module.css";

interface Props {
  asset: AssetData;
  onClick?: () => void;
  selected?: boolean;
}

const STATUS_CLASS = ["badge-pending", "badge-active", "badge-paused", "badge-redeemed"];
const CLASS_ICON   = ["🏢", "🪙", "📄", "⚡", "📦"];

export function AssetCard({ asset, onClick, selected }: Props) {
  const valueFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(ethers.formatEther(asset.totalValue)));

  const supplyFormatted = asset.totalSupply !== undefined
    ? new Intl.NumberFormat("en-US", { notation: "compact" }).format(
        Number(ethers.formatEther(asset.totalSupply))
      )
    : "—";

  const shortId = `${asset.id.slice(0, 10)}…${asset.id.slice(-6)}`;
  const date = new Date(asset.createdAt * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article
      className={`cert-card ${styles.card} ${selected ? styles.selected : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {/* Certificate stamp */}
      <div className={styles.classStamp}>
        <span className={styles.classIcon}>{CLASS_ICON[asset.assetClass]}</span>
        <span className={styles.classLabel}>
          {ASSET_CLASS_LABELS[asset.assetClass]}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.header}>
          <h3 className={styles.name}>{asset.name}</h3>
          <span className={`badge ${STATUS_CLASS[asset.status]}`}>
            {ASSET_STATUS_LABELS[asset.status]}
          </span>
        </div>

        <div className={styles.valueLine}>
          <span className={styles.valueLabel}>Total Value</span>
          <span className={styles.value}>{valueFormatted}</span>
        </div>

        <hr className="divider" style={{ margin: "0.75rem 0" }} />

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Token</span>
            <span className="mono">{asset.symbol ?? "—"}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Supply</span>
            <span className="mono">{supplyFormatted}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Issued</span>
            <span>{date}</span>
          </div>
        </div>

        <p className={`address ${styles.assetId}`} title={asset.id}>
          ID: {shortId}
        </p>
      </div>

      {asset.userBalance !== undefined && asset.userBalance > 0n && (
        <div className={styles.holdingBanner}>
          Your holding:{" "}
          <span className="mono">
            {Number(ethers.formatEther(asset.userBalance)).toLocaleString()} {asset.symbol}
          </span>
        </div>
      )}
    </article>
  );
}
