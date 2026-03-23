'use client'

const items = [
  '20+ Anos de Mercado',
  'Cadastro SUSEP',
  'Atendimento IA 24/7',
  'Sem Analise de Perfil',
  '0800 Funciona',
  'Protecao em 48h',
]

export function TrustBar() {
  const doubled = [...items, ...items]

  return (
    <div className="group overflow-hidden border-y border-white/[0.04] bg-[#0F0F18]/50 py-4">
      <div className="flex animate-[scroll_30s_linear_infinite] group-hover:[animation-play-state:paused]">
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex flex-shrink-0 items-center gap-3 px-8"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
            <span className="whitespace-nowrap text-sm font-medium uppercase tracking-wider text-[#555570]">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
