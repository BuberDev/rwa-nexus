"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { AssetData } from "../../hooks/useRegistry";
import { getTokenContract } from "../../lib/contracts";
import styles from "./TransferPanel.module.css";

interface Props {
  asset: AssetData;
  signer: ethers.JsonRpcSigner;
  onSuccess: () => void;
}

type TxState = "idle" | "pending" | "success" | "error";

export function TransferPanel({ asset, signer, onSuccess }: Props) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const isValidAddress = ethers.isAddress(recipient);
  const isValidAmount = Number(amount) > 0;
  const isIdle = txState === "idle";
  const canSubmit = isValidAddress && isValidAmount && isIdle;

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setTxState("pending");
    setErrMsg(null);
    try {
      const token = getTokenContract(asset.tokenAddress, signer);
      const wei = ethers.parseEther(amount);
      const tx = await token.transfer(recipient, wei);
      setTxHash((tx as ethers.ContractTransactionResponse).hash);
      await (tx as ethers.ContractTransactionResponse).wait();
      setTxState("success");
      onSuccess();
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Transaction failed");
      setTxState("error");
    }
  }

  return (
    <div className={`cert-card ${styles.panel}`}>
      <h4 className={styles.title}>Transfer {asset.symbol ?? "Tokens"}</h4>
      <p className={styles.sub}>
        Holdings:{" "}
        <span className="mono">
          {asset.userBalance !== undefined
            ? `${Number(ethers.formatEther(asset.userBalance)).toLocaleString()} ${asset.symbol}`
            : "—"}
        </span>
      </p>

      <form onSubmit={handleTransfer} className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>Recipient address</span>
          <input
            className={`${styles.input} mono ${!recipient || isValidAddress ? "" : styles.inputError}`}
            type="text"
            placeholder="0x…"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={txState === "pending"}
          />
          {recipient && !isValidAddress && (
            <span className={styles.hint}>Invalid Ethereum address</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Amount ({asset.symbol})</span>
          <input
            className={styles.input}
            type="number"
            placeholder="0.00"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={txState === "pending"}
          />
        </label>

        <button className="btn-primary" type="submit" disabled={!canSubmit || !isIdle}>
          {!isIdle && txState === "pending" ? "Confirming…" : "Transfer"}
        </button>
      </form>

      {txState === "success" && txHash && (
        <div className={styles.success}>
          Transaction confirmed.{" "}
          <a className="mono" href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
            {txHash.slice(0, 14)}…
          </a>
        </div>
      )}

      {txState === "error" && errMsg && (
        <div className={styles.error}>{errMsg}</div>
      )}
    </div>
  );
}
