import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { GLSLHills } from '@/components/ui/glsl-hills';
import { WalletButton } from "@/components/WalletButton";
import { useUserLocation } from "@/hooks/useUserLocation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Invoices", href: "/invoices" },
  { name: "Payment Links", href: "/payment-links" },
  { name: "Requests", href: "/payment-requests" },
  { name: "Recurring", href: "/recurring" },
  { name: "Split & Settle", href: "/splits" },
  { name: "Contacts", href: "/contacts" },
  { name: "Transactions", href: "/transactions" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBg, setShowBg] = useState(false);
  const userLocation = useUserLocation();

  useEffect(() => {
    const t = setTimeout(() => setShowBg(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-black flex text-white font-mono relative overflow-hidden">
      {showBg && (
        <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
          <GLSLHills />
        </div>
      )}

      {/* Corner Frame Accents */}
      <div className="fixed top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/20 z-30" />
      <div className="fixed top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/20 z-30" />
      <div className="fixed bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/20 z-30" />
      <div className="fixed bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/20 z-30" />

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-[240px] border-r border-white/15 transition-transform duration-200 ease-in-out flex flex-col",
        "bg-black/95 backdrop-blur-md",
        "md:sticky md:top-0 md:h-screen md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="/audd-logo.png"
              alt="AUDD Logo"
              className="w-8 h-8 object-contain"
            />
            <div>
              <div className="font-mono font-bold tracking-widest text-sm text-white leading-none">PAYMATE</div>
              <div className="text-[9px] uppercase tracking-widest text-white/35 mt-0.5">AUDD on Solana</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                <div className={cn(
                  "flex items-center justify-between py-2.5 px-3 text-[11px] uppercase tracking-widest cursor-pointer transition-all rounded-none",
                  isActive
                    ? "text-white bg-white/8 border-l-2 border-white"
                    : "text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                )}>
                  {item.name}
                  <div className={cn("w-1 h-1", isActive ? "bg-white" : "bg-white/25")} />
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-5 border-t border-white/10">
          <div className="flex items-center gap-2 text-[10px] text-white/40 tracking-widest mb-3">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>
            MAINNET LIVE
          </div>
          <div className="text-[9px] uppercase tracking-widest text-white/20">V1.0.0 · MIT</div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 max-w-full overflow-y-auto z-10 relative">

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black">
          <div className="flex items-center gap-2">
            <img src="/audd-logo.png" alt="AUDD" className="w-6 h-6 object-contain" />
            <span className="font-mono font-bold tracking-widest text-sm text-white">PAYMATE</span>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="text-white/70 text-xs uppercase tracking-widest">
            [MENU]
          </button>
        </header>

        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-end gap-4 px-8 py-3 border-b border-white/10 bg-black/60 backdrop-blur-sm">
          {userLocation && (
            <div className="flex items-center gap-2 text-[10px] tracking-widest text-white/50">
              <span>{userLocation.flag}</span>
              <span>{userLocation.city}, {userLocation.country}</span>
            </div>
          )}
          <div className="w-px h-4 bg-white/15" />
          <WalletButton />
        </header>

        <div className="flex-1 px-4 py-4 md:px-8 md:py-6 max-w-5xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
