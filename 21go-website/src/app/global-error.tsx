'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body style={{ backgroundColor: '#060A14', color: '#fff', fontFamily: 'system-ui', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0 }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Algo deu errado</h1>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>{error.message || 'Erro inesperado'}</p>
          <button
            onClick={() => reset()}
            style={{ padding: '0.75rem 2rem', backgroundColor: '#1B4DA1', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
