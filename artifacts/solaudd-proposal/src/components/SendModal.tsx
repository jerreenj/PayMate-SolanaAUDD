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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const AUDD_MINT = new PublicKey("AuDDuMCindiXzSrBgUvXL5uJkr5kXRpEhMJPBiSTGzj");
const AUDD_DECIMALS = 6;

interface SendModalProps {
  open: boolean;
  onClose: () => void;
}

export function SendModal({ open, onClose }: SendModalProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();

  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [status, setStatus] = useState<"idle" | "signing" | "confirming" | "done" | "error">("idle");
  const [txSig, setTxSig] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isValid = recipientAddress.length >= 32 && recipientAddress.length <= 44 && Number(amount) > 0;

  const handleSend = async () => {
    if (!publicKey || !isValid) return;
    setStatus("signing");
    setErrorMsg("");
    try {
      const recipient = new PublicKey(recipientAddress);
      const rawAmount = Math.round(Number(amount) * 10 ** AUDD_DECIMALS);

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

      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "send",
          counterpartyWallet: recipientAddress,
          amountAudd: Number(amount),
          txSignature: signature,
          note: memo || undefined,
        }),
      });

      toast({ title: `A$${amount} AUDD sent on-chain`, description: signature.slice(0, 16) + "..." });
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.message || "Transaction failed");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setRecipientAddress("");
    setAmount("");
    setMemo("");
    setTxSig("");
    setErrorMsg("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-black border-white/20 text-white sm:max-w-[440px] rounded-none font-mono">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold uppercase tracking-widest">[↗ SEND AUDD]</DialogTitle>
        </DialogHeader>

        {status === "done" ? (
          <div className="space-y-4 pt-4">
            <div className="border border-white/20 p-4 space-y-2">
              <div className="text-[10px] text-white/40 uppercase tracking-widest">TRANSACTION CONFIRMED</div>
              <div className="text-lg font-bold text-primary">A${amount} AUDD sent</div>
              <div className="text-[10px] text-white/50 break-all">{txSig}</div>
              <a
                href={`https://solscan.io/tx/${txSig}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-colors mt-2"
              >
                [VIEW ON SOLSCAN →]
              </a>
            </div>
            <button onClick={handleClose} className="w-full bg-white text-black font-mono text-[11px] uppercase tracking-widest py-3 hover:bg-white/90 transition-colors">
              [CLOSE]
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {!publicKey && (
              <div className="border border-white/10 p-3 text-[11px] text-white/40 uppercase tracking-widest">
                Connect a wallet to send AUDD
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] text-white/50 uppercase tracking-widest">RECIPIENT WALLET</label>
              <input
                className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white font-mono"
                placeholder="Solana address (32–44 chars)"
                value={recipientAddress}
                onChange={e => setRecipientAddress(e.target.value)}
                disabled={status !== "idle"}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-white/50 uppercase tracking-widest">AMOUNT (AUDD)</label>
              <input
                className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white font-mono"
                placeholder="0.00"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={status !== "idle"}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-white/50 uppercase tracking-widest">MEMO (OPTIONAL)</label>
              <input
                className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white font-mono"
                placeholder="Invoice #, note, reference..."
                value={memo}
                onChange={e => setMemo(e.target.value)}
                disabled={status !== "idle"}
              />
            </div>

            {status === "error" && (
              <div className="border border-red-400/30 p-3 text-[10px] text-red-400 uppercase tracking-widest">
                {errorMsg}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleSend}
                disabled={!publicKey || !isValid || status !== "idle"}
                className="w-full bg-white text-black font-mono text-[11px] uppercase tracking-widest py-3 hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {status === "signing" ? "WAITING FOR WALLET..." : status === "confirming" ? "CONFIRMING ON-CHAIN..." : `[SEND A$${amount || "0.00"} AUDD]`}
              </button>
            </div>

            <div className="text-[9px] text-white/25 uppercase tracking-widest text-center">
              Mainnet · AUDD SPL Token · Solana
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
