"use client";
import { useWallet } from "../../hooks/useWallet";
import styles from "./WalletConnect.module.css";

export function WalletConnect() {
  const { wallet, connect, disconnect, shortAddress, chainName } = useWallet();

  if (wallet.status === "disconnected" || wallet.status === "error") {
    return (
      <button className="btn-primary" onClick={connect}>
        <span className={styles.dot} />
        Connect Wallet
      </button>
    );
  }

  if (wallet.status === "connecting") {
    return (
      <button className="btn-primary" disabled>
        <span className={`${styles.dot} ${styles.pulsing}`} />
        Connecting…
      </button>
    );
  }

  if (wallet.status === "unsupported_chain") {
    return (
      <button className={`btn-ghost ${styles.error}`} onClick={connect}>
        ⚠ Unsupported network — switch chain
      </button>
    );
  }

  return (
    <div className={styles.connected}>
      <div className={styles.chainPill}>{chainName}</div>
      <button className="btn-ghost" onClick={disconnect}>
        <span className={`${styles.dot} ${styles.active}`} />
        {shortAddress}
      </button>
    </div>
  );
}
