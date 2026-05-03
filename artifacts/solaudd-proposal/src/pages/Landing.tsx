import { useEffect } from 'react';
import { useLocation } from 'wouter';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    UnicornStudio: any;
  }
}

export default function Landing() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.UnicornStudio) return;
      window.UnicornStudio = { isInitialized: false };
      const i = document.createElement('script');
      i.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.33/dist/unicornStudio.umd.js';
      i.async = true;
      i.onload = () => {
        if (!window.UnicornStudio.isInitialized) {
          window.UnicornStudio.init();
          window.UnicornStudio.isInitialized = true;
        }
      };
      (document.head || document.body).appendChild(i);

      // Aggressively hide only the "Made with" branding watermark
      const style = document.createElement('style');
      style.id = 'unicorn-hide-style';
      style.textContent = `
        [data-us-project] a[href*="unicorn"],
        [data-us-project] a[href*="unicorn.studio"],
        [data-us-project] button[title*="unicorn" i],
        [data-us-project] button[title*="made" i],
        [data-us-project] div[title*="Made with" i],
        [data-us-project] .unicorn-brand,
        [data-us-project] [class*="brand"],
        [data-us-project] [class*="credit"],
        [data-us-project] [class*="watermark"],
        [data-us-project] [class*="badge"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          position: absolute !important;
          left: -9999px !important;
          top: -9999px !important;
        }
      `;
      document.head.appendChild(style);

      const hideBranding = () => {
        document.querySelectorAll('[data-us-project] *').forEach(el => {
          const text = (el.textContent || '').toLowerCase().trim();
          const title = (el.getAttribute('title') || '').toLowerCase();
          const href = (el.getAttribute('href') || '').toLowerCase();
          if (
            (text === 'made with unicorn studio' || text === 'made with') ||
            title.includes('unicorn') ||
            href.includes('unicorn.studio')
          ) {
            (el as HTMLElement).style.cssText =
              'display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;position:absolute!important;left:-9999px!important;top:-9999px!important;';
          }
        });
      };

      hideBranding();
      const interval = setInterval(hideBranding, 200);
      [300, 600, 1000, 2000, 4000].forEach(t => setTimeout(hideBranding, t));

      return () => {
        clearInterval(interval);
        const s = document.getElementById('unicorn-hide-style');
        if (s) s.remove();
      };
    }, 80);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black font-mono">

      {/* UnicornStudio animated background — desktop only */}
      <div className="absolute inset-0 w-full h-full hidden lg:block">
        <div
          data-us-project="OMzqyUv6M3kSnv0JeAtC"
          style={{ width: '100%', height: '100%', minHeight: '100vh' }}
        />
        {/* Watermark cover — sits over the bottom-left corner where UnicornStudio renders its badge */}
        <div className="absolute bottom-0 left-0 w-52 h-10 bg-black z-10" style={{ pointerEvents: 'none' }} />
      </div>

      {/* Stars background — mobile fallback */}
      <div className="absolute inset-0 w-full h-full lg:hidden stars-bg" />

      {/* Corner frame accents */}
      <div className="absolute top-0 left-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-l-2 border-white/30 z-20" />
      <div className="absolute top-0 right-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-r-2 border-white/30 z-20" />
      <div className="absolute bottom-0 left-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-l-2 border-white/30 z-20" />
      <div className="absolute bottom-0 right-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-r-2 border-white/30 z-20" />

      {/* Top header */}
      <div className="absolute top-0 left-0 right-0 z-20 border-b border-white/20">
        <div className="container mx-auto px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-2">
              <img src="/audd-logo-blue.png" alt="AUDD" className="h-5 w-5 object-contain" />
              <span className="text-white text-base lg:text-lg font-bold tracking-widest">PAYMATE</span>
            </div>
            <div className="h-3 lg:h-4 w-px bg-white/30" />
            <span className="text-white/60 text-[8px] lg:text-[10px] tracking-widest">EST. 2025</span>
          </div>
          <div className="hidden lg:flex items-center gap-3 text-[10px] text-white/60 tracking-widest">
            <span>AUDD ON SOLANA</span>
            <div className="w-1 h-1 bg-white/40 rounded-full" />
            <span>MAINNET BETA</span>
          </div>
        </div>
      </div>

      {/* Hero — mobile: top-aligned below header, desktop: full-screen centered right */}
      <div className="relative z-10 flex lg:min-h-screen lg:items-center lg:justify-end pt-20 pb-12 lg:pt-0 lg:pb-0">
        <div className="w-full lg:w-1/2 px-6 lg:px-16 lg:pr-[10%]">
          <div className="max-w-lg relative lg:ml-auto">

            {/* Top decorative rule */}
            <div className="flex items-center gap-2 mb-4 opacity-70">
              <div className="w-8 h-px bg-white" />
              <span className="text-white text-[10px] tracking-wider">∞</span>
              <div className="flex-1 h-px bg-white" />
            </div>

            {/* Eyebrow badge */}
            <div className="mb-4">
              <span className="text-[9px] tracking-widest text-white/70 border border-white/30 px-2 py-0.5">
                AUDD STABLECOIN · SOLANA NETWORK
              </span>
            </div>

            {/* Headline */}
            <div className="relative mb-4">
              <div className="hidden lg:block absolute -right-3 top-0 bottom-0 w-1 dither-pattern opacity-40" />
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-wider" style={{ letterSpacing: '0.08em' }}>
                YOUR AUD<br />ON SOLANA
              </h1>
            </div>

            {/* Dots — desktop only */}
            <div className="hidden lg:flex gap-1 mb-3 opacity-50">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="w-0.5 h-0.5 bg-white rounded-full" />
              ))}
            </div>

            {/* Description */}
            <div className="relative mb-6">
              <p className="text-sm text-white leading-relaxed opacity-80">
                PayMate is the all-in-one AUDD finance platform built for freelancers, teams, and merchants.
                Send invoices, create Solana Pay links, automate recurring payments, and split bills —
                all settled in Australian dollars on-chain.
              </p>
            </div>

            {/* Feature tags — mobile: 2-col wrap, desktop: row */}
            <div className="flex flex-wrap gap-2 mb-7">
              {['INVOICES', 'PAYMENT LINKS', 'RECURRING', 'SPLIT & SETTLE', 'CONTACTS'].map(f => (
                <span key={f} className="text-[8px] tracking-widest text-white/70 border border-white/25 px-2 py-0.5">{f}</span>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="relative px-6 py-3 bg-white text-black text-xs font-bold tracking-widest hover:bg-white/90 transition-all duration-200 text-center"
              >
                OPEN DASHBOARD →
              </button>
              <button
                onClick={() => window.open('https://github.com/jerreenj/PayMate-SolanaAUDD', '_blank')}
                className="px-6 py-3 bg-transparent border border-white/40 text-white/80 text-xs tracking-widest hover:bg-white/5 hover:border-white/70 hover:text-white transition-all duration-200 text-center"
              >
                VIEW ON GITHUB
              </button>
            </div>

            {/* Bottom notation — desktop only */}
            <div className="hidden lg:flex items-center gap-2 mt-6 opacity-50">
              <span className="text-white text-[9px]">∞</span>
              <div className="flex-1 h-px bg-white" />
              <span className="text-white text-[9px] tracking-widest">PAYMATE.PROTOCOL</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
