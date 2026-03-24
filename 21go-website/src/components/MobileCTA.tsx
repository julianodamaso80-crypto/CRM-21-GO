"use client";
import Link from 'next/link';

export default function MobileCTA() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A1E3D]/90 backdrop-blur-xl border-t border-white/10 px-4 py-3 safe-area-pb">
      <Link
        href="/cotacao"
        className="animate-glow-pulse block w-full text-center py-3.5 rounded-xl bg-[#E07620] text-white font-semibold text-base hover:bg-[#C46218] transition-colors"
      >
        Fazer Cotação Grátis
      </Link>
    </div>
  );
}
