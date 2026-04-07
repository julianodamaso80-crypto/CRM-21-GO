'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { MessageSquare, ShieldAlert, Upload, X, CheckCircle, Loader2 } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

type Tab = 'reclamacao' | 'denuncia'

export default function OuvidoriaPage() {
  const [activeTab, setActiveTab] = useState<Tab>('reclamacao')

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white pt-28 pb-20">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-3xl px-6"
      >
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h1 className="font-[var(--font-outfit)] text-3xl md:text-4xl font-bold text-[#0A1E3D]">
            Ouvidoria 21Go
          </h1>
          <p className="mt-3 text-[#64748B] text-lg max-w-xl mx-auto">
            Sua voz é importante para nós. Queremos ouvir você para evoluir e melhorar nossos serviços.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeInUp} className="flex rounded-xl bg-[#F0F4FA] p-1.5 mb-8">
          <button
            onClick={() => setActiveTab('reclamacao')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'reclamacao'
                ? 'bg-white text-[#1B4DA1] shadow-sm'
                : 'text-[#64748B] hover:text-[#0A1E3D]'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Reclamações e Sugestões
          </button>
          <button
            onClick={() => setActiveTab('denuncia')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'denuncia'
                ? 'bg-white text-[#1B4DA1] shadow-sm'
                : 'text-[#64748B] hover:text-[#0A1E3D]'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            Denúncia Anônima
          </button>
        </motion.div>

        {activeTab === 'reclamacao' ? <ReclamacaoForm /> : <DenunciaForm />}
      </motion.div>
    </section>
  )
}

/* ─── Reclamações e Sugestões ─── */
function ReclamacaoForm() {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [tipo, setTipo] = useState<'reclamacao' | 'sugestao'>('reclamacao')
  const [mensagem, setMensagem] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles].slice(0, 5))
    }
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  function maskPhone(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2) return d
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!nome.trim() || !telefone.trim() || !mensagem.trim()) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('nome', nome)
      formData.append('telefone', telefone.replace(/\D/g, ''))
      formData.append('tipo', tipo)
      formData.append('mensagem', mensagem)
      files.forEach((f) => formData.append('arquivos', f))

      const res = await fetch('/api/ouvidoria', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Erro ao enviar')

      setSuccess(true)
      setNome('')
      setTelefone('')
      setMensagem('')
      setFiles([])
    } catch {
      setError('Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="font-[var(--font-outfit)] text-2xl font-bold text-[#0A1E3D] mb-2">
          Enviado com sucesso!
        </h2>
        <p className="text-[#64748B] mb-6">
          Recebemos sua {tipo === 'reclamacao' ? 'reclamação' : 'sugestão'}. Vamos analisar e entrar em contato.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-3 rounded-lg bg-[#1B4DA1] text-white font-semibold hover:bg-[#163F85] transition-colors"
        >
          Enviar outra
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeInUp}>
      {/* Explicação */}
      <div className="bg-[#1B4DA1]/5 border border-[#1B4DA1]/10 rounded-xl p-5 mb-6">
        <h2 className="font-[var(--font-outfit)] text-base font-semibold text-[#1B4DA1] mb-2">
          O que são Reclamações e Sugestões?
        </h2>
        <p className="text-sm text-[#64748B] leading-relaxed">
          Queremos ouvir nossos clientes e colaboradores para conseguirmos ajudar e evoluir a empresa.
          Seja uma reclamação sobre algum atendimento, processo ou serviço, ou uma sugestão de melhoria
          — tudo será lido e analisado pela diretoria. Seu feedback nos ajuda a construir uma 21Go cada vez melhor.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 md:p-8 space-y-5">
        {/* Tipo */}
        <div className="flex gap-3">
          {[
            { value: 'reclamacao' as const, label: 'Reclamação' },
            { value: 'sugestao' as const, label: 'Sugestão' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTipo(opt.value)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                tipo === opt.value
                  ? 'bg-[#1B4DA1] text-white border-[#1B4DA1]'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#1B4DA1]/30'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-[#0A1E3D] mb-1.5">Nome completo *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
            className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-[#0A1E3D] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B4DA1]/20 focus:border-[#1B4DA1] transition-all"
          />
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium text-[#0A1E3D] mb-1.5">Telefone / WhatsApp *</label>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(maskPhone(e.target.value))}
            placeholder="(21) 99999-9999"
            className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-[#0A1E3D] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B4DA1]/20 focus:border-[#1B4DA1] transition-all"
          />
        </div>

        {/* Mensagem */}
        <div>
          <label className="block text-sm font-medium text-[#0A1E3D] mb-1.5">
            {tipo === 'reclamacao' ? 'Descreva sua reclamação *' : 'Descreva sua sugestão *'}
          </label>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={5}
            placeholder={tipo === 'reclamacao'
              ? 'Conte o que aconteceu, quando e com quem...'
              : 'Compartilhe sua ideia de melhoria...'}
            className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-[#0A1E3D] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B4DA1]/20 focus:border-[#1B4DA1] transition-all resize-none"
          />
        </div>

        {/* Upload */}
        <div>
          <label className="block text-sm font-medium text-[#0A1E3D] mb-1.5">Fotos ou arquivos (opcional)</label>
          <div
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-[#E2E8F0] rounded-lg cursor-pointer hover:border-[#1B4DA1]/30 transition-colors"
          >
            <Upload className="h-6 w-6 text-[#94A3B8]" />
            <span className="text-sm text-[#94A3B8]">Clique para enviar (máx. 5 arquivos)</span>
          </div>
          <input ref={inputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFiles} className="hidden" />

          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F4FA] rounded-lg text-xs text-[#64748B]">
                  {f.name.slice(0, 20)}{f.name.length > 20 ? '...' : ''}
                  <button type="button" onClick={() => removeFile(i)}>
                    <X className="h-3 w-3 text-[#94A3B8] hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-lg bg-[#E07620] text-white font-semibold hover:bg-[#C46218] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</> : 'Enviar'}
        </button>
      </form>
    </motion.div>
  )
}

/* ─── Denúncia Anônima ─── */
function DenunciaForm() {
  const [assunto, setAssunto] = useState('')
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!assunto.trim() || !comentario.trim()) {
      setError('Preencha todos os campos.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/ouvidoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'denuncia', assunto, comentario }),
      })

      if (!res.ok) throw new Error('Erro ao enviar')

      setSuccess(true)
      setAssunto('')
      setComentario('')
    } catch {
      setError('Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="font-[var(--font-outfit)] text-2xl font-bold text-[#0A1E3D] mb-2">
          Denúncia registrada!
        </h2>
        <p className="text-[#64748B] mb-6">
          Sua denúncia foi registrada de forma totalmente anônima. Obrigado por nos ajudar a melhorar.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-3 rounded-lg bg-[#1B4DA1] text-white font-semibold hover:bg-[#163F85] transition-colors"
        >
          Fazer outra denúncia
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeInUp}>
      {/* Explicação */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="font-[var(--font-outfit)] text-base font-semibold text-[#0A1E3D] mb-2">
              Canal de Denúncia 100% Anônimo
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Este canal é <strong>totalmente anônimo</strong> para a segurança de todos. Nenhum dado pessoal
              é coletado — não pedimos nome, telefone ou qualquer informação que identifique você.
              O foco é evoluirmos nossos processos e descobrirmos o que está acontecendo de errado.
              Use este canal para denunciar irregularidades, condutas inadequadas ou qualquer situação
              que precise ser investigada.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 md:p-8 space-y-5">
        {/* Assunto */}
        <div>
          <label className="block text-sm font-medium text-[#0A1E3D] mb-1.5">Assunto *</label>
          <input
            type="text"
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            placeholder="Sobre o que é a denúncia?"
            className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-[#0A1E3D] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B4DA1]/20 focus:border-[#1B4DA1] transition-all"
          />
        </div>

        {/* Comentário */}
        <div>
          <label className="block text-sm font-medium text-[#0A1E3D] mb-1.5">Descreva a situação *</label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={6}
            placeholder="Descreva com detalhes o que aconteceu, quando, onde e quem estava envolvido..."
            className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-[#0A1E3D] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B4DA1]/20 focus:border-[#1B4DA1] transition-all resize-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <ShieldAlert className="h-3.5 w-3.5" />
          Nenhum dado pessoal é coletado. Sua identidade é protegida.
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-lg bg-[#0A1E3D] text-white font-semibold hover:bg-[#081632] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</> : 'Enviar Denúncia Anônima'}
        </button>
      </form>
    </motion.div>
  )
}
