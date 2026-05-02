import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Landing() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const embedScript = document.createElement('script');
    embedScript.type = 'text/javascript';
    embedScript.textContent = `
      !function(){
        if(!window.UnicornStudio){
          window.UnicornStudio={isInitialized:!1};
          var i=document.createElement("script");
          i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.33/dist/unicornStudio.umd.js";
          i.onload=function(){
            window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)
          };
          (document.head || document.body).appendChild(i)
        }
      }();
    `;
    document.head.appendChild(embedScript);

    const style = document.createElement('style');
    style.id = 'unicorn-hide-style';
    style.textContent = `
      [data-us-project] { position: relative !important; overflow: hidden !important; }
      [data-us-project] canvas { clip-path: inset(0 0 10% 0) !important; }
      [data-us-project] * { pointer-events: none !important; }
      [data-us-project] a[href*="unicorn"],
      [data-us-project] button[title*="unicorn"],
      [data-us-project] div[title*="Made with"],
      [data-us-project] .unicorn-brand,
      [data-us-project] [class*="brand"],
      [data-us-project] [class*="credit"],
      [data-us-project] [class*="watermark"] {
        display: none !important; visibility: hidden !important; opacity: 0 !important;
        position: absolute !important; left: -9999px !important; top: -9999px !important;
      }
    `;
    document.head.appendChild(style);

    const hideBranding = () => {
      ['[data-us-project]', '[data-us-project="OMzqyUv6M3kSnv0JeAtC"]'].forEach(selector => {
        document.querySelectorAll(selector).forEach(container => {
          container.querySelectorAll('*').forEach(el => {
            const text = (el.textContent || '').toLowerCase();
            const title = (el.getAttribute('title') || '').toLowerCase();
            const href = (el.getAttribute('href') || '').toLowerCase();
            if (text.includes('made with') || text.includes('unicorn') || title.includes('unicorn') || href.includes('unicorn.studio')) {
              (el as HTMLElement).style.cssText = 'display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;position:absolute!important;left:-9999px!important;top:-9999px!important;';
              try { el.remove(); } catch {}
            }
          });
        });
      });
    };

    hideBranding();
    const interval = setInterval(hideBranding, 50);
    [500, 1000, 2000, 5000, 10000].forEach(t => setTimeout(hideBranding, t));

    return () => {
      clearInterval(interval);
      try { document.head.removeChild(embedScript); } catch {}
      const s = document.getElementById('unicorn-hide-style');
      if (s) try { document.head.removeChild(s); } catch {}
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black font-mono">

      {/* UnicornStudio animated ASCII background — desktop only */}
      <div className="absolute inset-0 w-full h-full hidden lg:block">
        <div
          data-us-project="OMzqyUv6M3kSnv0JeAtC"
          style={{ width: '100%', height: '100%', minHeight: '100vh' }}
        />
      </div>

      {/* Stars background — mobile fallback */}
      <div className="absolute inset-0 w-full h-full lg:hidden stars-bg" />

      {/* Corner frame accents */}
      <div className="absolute top-0 left-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-l-2 border-white/30 z-20" />
      <div className="absolute top-0 right-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-r-2 border-white/30 z-20" />
      <div className="absolute left-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-l-2 border-white/30 z-20" style={{ bottom: '5vh' }} />
      <div className="absolute right-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-r-2 border-white/30 z-20" style={{ bottom: '5vh' }} />

      {/* Top header */}
      <div className="absolute top-0 left-0 right-0 z-20 border-b border-white/20">
        <div className="container mx-auto px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center border border-white/50 text-[8px] font-bold text-white">
                PM
              </div>
              <span className="text-white text-base lg:text-lg font-bold tracking-widest">PAYMATE</span>
            </div>
            <div className="h-3 lg:h-4 w-px bg-white/30" />
            <span className="text-white/40 text-[8px] lg:text-[10px] tracking-widest">EST. 2025</span>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-[10px] text-white/40 tracking-widest">
            <span>AUDD ON SOLANA</span>
            <div className="w-1 h-1 bg-white/30 rounded-full" />
            <span>MAINNET BETA</span>
          </div>
        </div>
      </div>

      {/* Hero CTA — right half on desktop, centered on mobile */}
      <div className="relative z-10 flex min-h-screen items-center justify-end pt-16 lg:pt-0" style={{ marginTop: '5vh' }}>
        <div className="w-full lg:w-1/2 px-6 lg:px-16 lg:pr-[10%]">
          <div className="max-w-lg relative lg:ml-auto">

            {/* Top decorative rule */}
            <div className="flex items-center gap-2 mb-3 opacity-60">
              <div className="w-8 h-px bg-white" />
              <span className="text-white text-[10px] tracking-wider">∞</span>
              <div className="flex-1 h-px bg-white" />
            </div>

            {/* Eyebrow badge */}
            <div className="mb-3">
              <span className="text-[9px] tracking-widest text-white/40 border border-white/15 px-2 py-0.5">
                AUDD STABLECOIN · SOLANA NETWORK
              </span>
            </div>

            {/* Headline */}
            <div className="relative mb-3 lg:mb-4">
              <div className="hidden lg:block absolute -right-3 top-0 bottom-0 w-1 dither-pattern opacity-40" />
              <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight tracking-wider" style={{ letterSpacing: '0.08em' }}>
                YOUR AUD<br />ON SOLANA
              </h1>
            </div>

            {/* Dots */}
            <div className="hidden lg:flex gap-1 mb-3 opacity-40">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="w-0.5 h-0.5 bg-white rounded-full" />
              ))}
            </div>

            {/* Description */}
            <div className="relative mb-5 lg:mb-6">
              <p className="text-xs lg:text-sm text-white/60 leading-relaxed">
                PayMate is the all-in-one AUDD finance platform built for freelancers, teams, and merchants. 
                Send invoices, create Solana Pay links, automate recurring payments, and split bills — 
                all settled in Australian dollars on-chain.
              </p>
              <div className="hidden lg:block absolute -left-4 top-1/2 w-3 h-3 border border-white/25" style={{ transform: 'translateY(-50%)' }}>
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/30" style={{ transform: 'translate(-50%, -50%)' }} />
              </div>
            </div>

            {/* Feature tags */}
            <div className="hidden lg:flex flex-wrap gap-2 mb-6 opacity-50">
              {['INVOICES', 'PAYMENT LINKS', 'RECURRING', 'SPLIT & SETTLE', 'CONTACTS'].map(f => (
                <span key={f} className="text-[8px] tracking-widest text-white/50 border border-white/15 px-2 py-0.5">{f}</span>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="relative px-5 lg:px-6 py-2 lg:py-2.5 bg-white text-black text-xs lg:text-sm font-bold tracking-widest hover:bg-white/90 transition-all duration-200 group"
              >
                <span className="hidden lg:block absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="hidden lg:block absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                OPEN DASHBOARD →
              </button>

              <button
                onClick={() => window.open('https://github.com/jerreenj/paymate-audd', '_blank')}
                className="px-5 lg:px-6 py-2 lg:py-2.5 bg-transparent border border-white/30 text-white/60 text-xs lg:text-sm tracking-widest hover:bg-white/5 hover:border-white/60 hover:text-white transition-all duration-200"
              >
                VIEW ON GITHUB
              </button>
            </div>

            {/* Bottom notation */}
            <div className="hidden lg:flex items-center gap-2 mt-6 opacity-35">
              <span className="text-white text-[9px]">∞</span>
              <div className="flex-1 h-px bg-white" />
              <span className="text-white text-[9px] tracking-widest">PAYMATE.PROTOCOL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="absolute left-0 right-0 z-20 border-t border-white/20 bg-black/40 backdrop-blur-sm" style={{ bottom: '5vh' }}>
        <div className="container mx-auto px-4 lg:px-8 py-2 lg:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-6 text-[8px] lg:text-[9px] text-white/40 tracking-widest">
            <span className="hidden lg:inline">SYSTEM.ACTIVE</span>
            <span className="lg:hidden">SYS.ACT</span>
            <div className="hidden lg:flex gap-1 items-end h-4">
              {[8, 12, 6, 14, 10, 7, 13, 9].map((h, i) => (
                <div key={i} className="w-1 bg-white/20" style={{ height: `${h}px` }} />
              ))}
            </div>
            <span>V1.0.0</span>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 text-[8px] lg:text-[9px] text-white/40 tracking-widest">
            <span className="hidden lg:inline">◐ RENDERING</span>
            <div className="flex gap-1 items-center">
              <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="hidden lg:inline">FRAME: ∞</span>
          </div>
        </div>
      </div>
    </main>
  );
}
