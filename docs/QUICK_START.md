# 🚀 QUICK START - 5 MINUTOS

## Objetivo

Ter o CRM rodando localmente em menos de 5 minutos.

---

## ✅ Pré-requisitos

- [x] Node.js 20+ instalado
- [x] Docker Desktop instalado e rodando
- [x] Git instalado

**Verificar:**
```bash
node --version  # Deve mostrar v20.x.x ou superior
docker --version
git --version
```

---

## 🎯 Passo a Passo

### 1. Verificar Arquivos (já deve estar pronto)

```bash
cd "c:\Users\damas\Documents\PROJETOS\CRM TUBOMINAS"
```

### 2. Instalar Dependências

```bash
npm install
```

**Tempo:** ~2 minutos

### 3. Subir Infraestrutura (Docker)

```bash
npm run docker:up
```

Isso vai subir:
- ✅ PostgreSQL (porta 5432)
- ✅ Redis (porta 6379)
- ✅ MinIO (porta 9000 e 9001)
- ✅ Backend (porta 3333)
- ✅ Frontend (porta 5173)

**Tempo:** ~1-2 minutos (primeira vez, faz download das imagens)

### 4. Executar Migrations (primeira vez)

```bash
# Em outro terminal
cd backend
npx prisma migrate dev --name init
```

**Tempo:** ~10 segundos

### 5. Acessar o Sistema

🎉 **Pronto!**

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3333
- **API Docs:** http://localhost:3333/docs
- **MinIO Console:** http://localhost:9001 (admin/admin)
- **Prisma Studio:** `cd backend && npx prisma studio`

---

## 🧪 Testar API

### Health Check

```bash
curl http://localhost:3333/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-01-21T...",
  "uptime": 123.45
}
```

### Ver Documentação Swagger

Abra: http://localhost:3333/docs

---

## 🐛 Troubleshooting

### Erro: "Port already in use"

**Solução Windows:**
```bash
# Ver processo usando a porta
netstat -ano | findstr :3333

# Matar processo (substitua PID)
taskkill /PID <numero> /F
```

### Erro: "Docker daemon not running"

**Solução:**
1. Abrir Docker Desktop
2. Aguardar inicializar
3. Rodar `npm run docker:up` novamente

### Erro: "Prisma Client not generated"

**Solução:**
```bash
cd backend
npx prisma generate
```

### Frontend não conecta no Backend

**Solução:**
1. Verificar se backend está rodando: http://localhost:3333/health
2. Verificar CORS no arquivo `.env`:
   ```
   CORS_ORIGIN="http://localhost:5173"
   ```
3. Reiniciar backend

---

## 🎓 Próximos Passos

Agora que está rodando:

1. **Ler documentação:**
   - [README.md](../README.md) - Visão geral
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura
   - [ROADMAP.md](./ROADMAP.md) - Plano de desenvolvimento

2. **Implementar autenticação** (primeira funcionalidade):
   - Seguir Fase 1 do [ROADMAP.md](./ROADMAP.md)
   - Criar endpoints de login/register
   - Conectar frontend

3. **Explorar o código:**
   - Backend: `backend/src/`
   - Frontend: `frontend/src/`
   - Schema: `backend/prisma/schema.prisma`

---

## 📚 Comandos Úteis

```bash
# Ver logs em tempo real
npm run docker:logs

# Parar tudo
npm run docker:down

# Reiniciar um serviço específico
docker-compose -f docker/docker-compose.yml restart backend

# Entrar no container do backend
docker exec -it crm-backend sh

# Ver banco de dados visualmente
cd backend
npx prisma studio
```

---

## ✅ Checklist de Sucesso

- [ ] Docker está rodando
- [ ] `npm install` executou sem erros
- [ ] `npm run docker:up` subiu todos os containers
- [ ] http://localhost:3333/health retorna OK
- [ ] http://localhost:5173 abre o frontend
- [ ] http://localhost:3333/docs mostra Swagger
- [ ] Migrations foram executadas
- [ ] Posso ver tabelas no Prisma Studio

---

**Tudo funcionando? Parabéns! 🎉**

Agora é hora de começar a desenvolver seguindo o [ROADMAP](./ROADMAP.md).
