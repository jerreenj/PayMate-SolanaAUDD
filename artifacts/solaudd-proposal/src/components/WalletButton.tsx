import { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuddBalance } from "@/hooks/useAuddBalance";

function truncate(address: string) {
  return address.slice(0, 4) + "..." + address.slice(-4);
}

export function WalletButton() {
  const { connected, connecting, publicKey, connect, disconnect, wallets, select } = useWallet();
  const { balance } = useAuddBalance();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const phantom = wallets.find(w => w.adapter.name === "Phantom");
  const solflare = wallets.find(w => w.adapter.name === "Solflare");
  const options = [phantom, solflare].filter(Boolean);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (connected && publicKey) {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-3 border border-white/20 px-3 py-1.5 text-[10px] tracking-widest text-white/80 hover:border-white/40 hover:text-white transition-all"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="font-mono">{truncate(publicKey.toBase58())}</span>
          </span>
          {balance !== null && (
            <>
              <span className="text-white/20">|</span>
              <span className="text-[#D4A853] font-bold">A${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </>
          )}
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 bg-black border border-white/20 z-50 min-w-[160px]">
            <button
              onClick={() => { disconnect(); setOpen(false); }}
              className="w-full px-4 py-2.5 text-left text-[10px] tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              DISCONNECT
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={connecting}
        className="border border-white/30 px-3 py-1.5 text-[10px] tracking-widest text-white/70 hover:border-white/60 hover:text-white transition-all disabled:opacity-40"
      >
        {connecting ? "CONNECTING..." : "CONNECT WALLET"}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-black border border-white/20 z-50 min-w-[180px]">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-[10px] text-white/40 tracking-widest">
              No wallet found.<br />Install Phantom or Solflare.
            </div>
          ) : (
            options.map(w => w && (
              <button
                key={w.adapter.name}
                onClick={() => {
                  select(w.adapter.name);
                  setTimeout(() => connect().catch(() => {}), 50);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] tracking-widest text-white/70 hover:text-white hover:bg-white/5 transition-all text-left"
              >
                <img src={w.adapter.icon} alt="" className="w-4 h-4" />
                {w.adapter.name.toUpperCase()}
              </button>
            ))
          )}
          <div className="border-t border-white/10 px-4 py-2 text-[8px] text-white/25 tracking-widest">
            SOLANA MAINNET
          </div>
        </div>
      )}
    </div>
  );
}
