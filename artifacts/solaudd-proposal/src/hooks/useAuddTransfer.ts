import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const AUDD_MINT = new PublicKey("AuDDuMCindiXzSrBgUvXL5uJkr5kXRpEhMJPBiSTGzj");
const AUDD_DECIMALS = 6;

export type TransferStatus = "idle" | "signing" | "confirming" | "done" | "error";

export function useAuddTransfer() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [status, setStatus] = useState<TransferStatus>("idle");
  const [txSig, setTxSig] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const transfer = async (recipientAddress: string, amountAudd: number): Promise<string> => {
    if (!publicKey) throw new Error("Connect a wallet first");
    setStatus("signing");
    setErrorMsg("");
    try {
      const recipient = new PublicKey(recipientAddress);
      const rawAmount = Math.round(amountAudd * 10 ** AUDD_DECIMALS);
      const fromATA = await getAssociatedTokenAddress(AUDD_MINT, publicKey);
      const toATA = await getAssociatedTokenAddress(AUDD_MINT, recipient);
      const tx = new Transaction();
      try {
        await getAccount(connection, toATA);
      } catch {
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey, toATA, recipient, AUDD_MINT,
            TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
          )
        );
      }
      tx.add(createTransferInstruction(fromATA, toATA, publicKey, rawAmount));
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
      const signature = await sendTransaction(tx, connection);
      setStatus("confirming");
      await connection.confirmTransaction(signature, "confirmed");
      setTxSig(signature);
      setStatus("done");
      return signature;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setStatus("error");
      setErrorMsg(msg);
      throw e;
    }
  };

  const reset = () => {
    setStatus("idle");
    setTxSig("");
    setErrorMsg("");
  };

  return { transfer, status, txSig, errorMsg, reset, publicKey, connected: !!publicKey };
}
