# Status do Projeto

Analise o estado atual do projeto e gere um relatório de status.

## Verificar:

### 1. Servidores
- Frontend rodando? (porta 5173)
- Backend rodando? (porta 3333)
- Backend é mock ou real?

### 2. Banco de Dados
- PostgreSQL rodando?
- Migrations aplicadas?
- Seed executado?

### 3. Módulos por Status

| Módulo | Backend | Frontend | Status |
|--------|---------|----------|--------|
| Auth | ? | ? | ? |
| Contacts | ? | ? | ? |
| Leads | ? | ? | ? |
| Pipeline/Deals | ? | ? | ? |
| Inbox | ? | ? | ? |
| Dashboard | ? | ? | ? |

### 4. Próximas Ações
Baseado no estado atual, listar as próximas ações prioritárias.

### 5. Bloqueios
Identificar qualquer bloqueio que impeça progresso.

## Comandos de verificação:
```bash
# Verificar se frontend está rodando
curl http://localhost:5173 2>/dev/null && echo "Frontend OK" || echo "Frontend DOWN"

# Verificar se backend está rodando
curl http://localhost:3333/health 2>/dev/null && echo "Backend OK" || echo "Backend DOWN"

# Verificar PostgreSQL
pg_isready -h localhost -p 5432 2>/dev/null && echo "PostgreSQL OK" || echo "PostgreSQL DOWN"
```

## Documentação relevante:
- `docs/CURRENT_STATE.md` - Auditoria completa
- `docs/MIGRATION_PLAN_PIPEFY_LIKE.md` - Plano de evolução
- `CLAUDE.md` - Contexto do projeto
