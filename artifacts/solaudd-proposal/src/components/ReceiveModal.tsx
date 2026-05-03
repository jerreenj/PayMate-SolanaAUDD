import { useWallet } from "@solana/wallet-adapter-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const AUDD_MINT = "AuDDuMCindiXzSrBgUvXL5uJkr5kXRpEhMJPBiSTGzj";

interface ReceiveModalProps {
  open: boolean;
  onClose: () => void;
}

function SolanaPayQR({ address }: { address: string }) {
  const solanaPayUrl = `solana:${address}?spl-token=${AUDD_MINT}&label=PayMate`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(solanaPayUrl)}&size=200x200&format=svg&color=FFFFFF&bgcolor=000000&margin=12`;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="border border-white/20 p-2 bg-black">
        <img src={qrUrl} alt="Solana Pay QR" width={180} height={180} className="block" />
      </div>
      <div className="text-[9px] text-white/30 uppercase tracking-widest">SCAN WITH ANY SOLANA PAY WALLET</div>
    </div>
  );
}

export function ReceiveModal({ open, onClose }: ReceiveModalProps) {
  const { publicKey } = useWallet();
  const { toast } = useToast();

  const address = publicKey?.toBase58() ?? "";

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast({ title: `${label} copied` }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black border-white/20 text-white sm:max-w-[420px] rounded-none font-mono">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold uppercase tracking-widest">[↙ RECEIVE AUDD]</DialogTitle>
        </DialogHeader>

        {!publicKey ? (
          <div className="py-8 text-center text-[11px] text-white/30 uppercase tracking-widest">
            Connect a wallet to receive AUDD
          </div>
        ) : (
          <div className="space-y-5 pt-4">
            <SolanaPayQR address={address} />

            <div className="space-y-2">
              <div className="text-[10px] text-white/40 uppercase tracking-widest">YOUR WALLET ADDRESS</div>
              <div className="flex items-center gap-2 border border-white/10 p-3">
                <span className="text-xs text-white/70 break-all font-mono flex-1">{address}</span>
                <button
                  onClick={() => copy(address, "Address")}
                  className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors flex-shrink-0"
                >
                  [COPY]
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-white/40 uppercase tracking-widest">SOLANA PAY LINK</div>
              <div className="flex items-center gap-2 border border-white/10 p-3">
                <span className="text-xs text-white/50 truncate flex-1">
                  solana:{address.slice(0, 16)}...?spl-token=AUDD
                </span>
                <button
                  onClick={() => copy(`solana:${address}?spl-token=${AUDD_MINT}&label=PayMate`, "Solana Pay link")}
                  className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors flex-shrink-0"
                >
                  [COPY]
                </button>
              </div>
            </div>

            <div className="text-[9px] text-white/20 uppercase tracking-widest text-center">
              Send AUDD (SPL Token) to this address on Solana Mainnet
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
