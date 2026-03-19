# Debug de Erro de API

Investigue e corrija o erro de API relacionado a: $ARGUMENTS

## Passos de diagnóstico:

### 1. Identificar o endpoint
- Qual URL está sendo chamada?
- Qual método HTTP (GET, POST, PUT, DELETE)?
- Quais parâmetros estão sendo enviados?

### 2. Verificar logs do frontend
- Abrir DevTools (F12) → Console
- Procurar por `[API REQUEST]` e `[API RESPONSE ERROR]`
- Anotar: status code, response body, mensagem de erro

### 3. Verificar backend
- O endpoint existe em `backend/src/modules/*/routes.ts`?
- Está registrado em `server.ts` ou `server.mock.ts`?
- O service tem a lógica implementada?

### 4. Tipos de erro comuns:

**ERR_CONNECTION_REFUSED:**
- Backend não está rodando
- Solução: `cd backend && npm run dev:mock`

**401 Unauthorized:**
- Token JWT inválido ou expirado
- Verificar `auth-store.ts` e interceptor em `api.ts`

**404 Not Found:**
- Endpoint não existe ou path errado
- Verificar URL no service e nas routes

**500 Internal Server Error:**
- Erro no backend (query, validação, etc)
- Ver logs no terminal do backend

**CORS Error:**
- Origin não permitida
- Verificar config em `server.ts` (CORS_ORIGIN)

### 5. Corrigir e testar
- Aplicar correção
- Testar novamente
- Verificar se erro foi resolvido
- Adicionar logs se necessário para debug futuro
