import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

// AUDD stablecoin mint address on Solana mainnet (Trovio)
const AUDD_MINT = new PublicKey("AuDDuMCindiXzSrBgUvXL5uJkr5kXRpEhMJPBiSTGzj");

export function useAuddBalance() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance(null);
      return;
    }

    let cancelled = false;

    async function fetchBalance() {
      if (!publicKey) return;
      setLoading(true);
      try {
        const ata = await getAssociatedTokenAddress(AUDD_MINT, publicKey);
        const account = await getAccount(connection, ata);
        if (!cancelled) {
          setBalance(Number(account.amount) / 1e6);
        }
      } catch {
        if (!cancelled) setBalance(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [connected, publicKey, connection]);

  return { balance, loading };
}
