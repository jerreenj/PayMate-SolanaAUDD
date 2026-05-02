import { Link, useLocation } from "wouter";
import { useState } from "react";
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
  const userLocation = useUserLocation();

  return (
    <div className="min-h-screen bg-black flex text-white font-mono relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
        <GLSLHills />
      </div>

      {/* Corner Frame Accents */}
      <div className="fixed top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/20 z-30" />
      <div className="fixed top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/20 z-30" />
      <div className="fixed bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/20 z-30" />
      <div className="fixed bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/20 z-30" />

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-[220px] bg-black/80 backdrop-blur-sm border-r border-white/10 transition-transform duration-200 ease-in-out md:relative md:translate-x-0 h-screen sticky top-0 flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center border border-white/30 text-xs">
              PM
            </div>
            <span className="font-mono font-bold tracking-widest text-sm text-white">PAYMATE</span>
          </div>
          <div className="mt-6 flex items-center justify-center text-white/30 text-xs">
            ---∞---
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                <div
                  className={cn(
                    "flex items-center justify-between py-2 text-[11px] uppercase tracking-widest cursor-pointer group transition-all",
                    isActive
                      ? "text-white border-l-2 border-white pl-3"
                      : "text-white/40 pl-[14px] hover:text-white/70"
                  )}
                >
                  {item.name}
                  <div className={cn(
                    "w-1 h-1",
                    isActive ? "bg-white/80" : "bg-white/20"
                  )} />
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">AUDD ON SOLANA</div>
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-4">V1.0.0</div>
          <div className="flex items-center gap-2 text-[10px] text-white/50 tracking-widest">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-white/50 animate-pulse" />
              <div className="w-1 h-1 bg-white/50 animate-pulse" style={{ animationDelay: "150ms" }} />
              <div className="w-1 h-1 bg-white/50 animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
            SYSTEM.ACTIVE
          </div>
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
            <div className="flex h-6 w-6 items-center justify-center border border-white/30 text-xs">
              PM
            </div>
            <span className="font-mono font-bold tracking-widest text-sm text-white">PAYMATE</span>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="text-white/70 text-xs uppercase tracking-widest">
            [MENU]
          </button>
        </header>

        {/* Desktop Top Bar — wallet + location */}
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

        <div className="flex-1 px-8 py-6 max-w-5xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
