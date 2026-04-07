'use client'

import { useState, useEffect } from 'react'
import { X, ShieldCheck } from 'lucide-react'

export default function SloganPopup() {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    // Só mostra 1x por sessão
    if (sessionStorage.getItem('21go-slogan-seen')) return
    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [])

  function close() {
    setClosing(true)
    sessionStorage.setItem('21go-slogan-seen', '1')
    setTimeout(() => setVisible(false), 400)
  }

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center px-5 transition-all duration-400 ${
        closing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#121A33]/80 backdrop-blur-sm"
        onClick={close}
      />

      {/* Card */}
      <div
        className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${
          closing ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
        }`}
        style={{ animationDelay: '0.2s' }}
      >
        {/* Gradient top bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#375191] via-[#F7963D] to-[#BFD741]" />

        <div className="bg-white p-8 sm:p-10 text-center">
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F0F4FA] flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#121A33] transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#375191] to-[#243562] mb-6 shadow-lg shadow-[#375191]/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>

          {/* Slogan */}
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-extrabold text-[#121A33] leading-tight mb-2">
            Não conte com a sorte.
          </h2>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-extrabold leading-tight mb-6">
            <span className="bg-gradient-to-r from-[#F7963D] to-[#BFD741] bg-clip-text text-transparent">
              Conte com a 21Go!
            </span>
          </h2>

          <p className="text-[#64748B] text-sm mb-8 max-w-xs mx-auto leading-relaxed">
            20+ anos protegendo veículos no Rio de Janeiro.
            <br />
            Simule grátis em 30 segundos.
          </p>

          {/* CTA */}
          <button
            onClick={close}
            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#F7963D] to-[#F9A95E] text-white font-bold text-sm rounded-full shadow-lg shadow-[#F7963D]/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shimmer-btn"
          >
            <ShieldCheck className="w-4 h-4" />
            Simular Agora
          </button>

          {/* Trust line */}
          <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
            <span>SUSEP</span>
            <span className="w-1 h-1 rounded-full bg-[#BFD741]" />
            <span>20+ anos</span>
            <span className="w-1 h-1 rounded-full bg-[#BFD741]" />
            <span>Sem burocracia</span>
          </div>
        </div>

        {/* Gradient bottom bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#BFD741] via-[#F7963D] to-[#375191]" />
      </div>
    </div>
  )
}
