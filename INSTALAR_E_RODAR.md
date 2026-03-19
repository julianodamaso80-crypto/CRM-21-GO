# 🚀 COMO RODAR O CRM - PASSO A PASSO COMPLETO

## ⚠️ IMPORTANTE: Siga NA ORDEM!

---

## PASSO 1: INSTALAR POSTGRESQL

### Opção A: Com Docker (Recomendado)

1. **Baixar Docker Desktop:** https://www.docker.com/products/docker-desktop/
2. **Instalar** e **reiniciar o PC**
3. **Abrir Docker Desktop** e aguardar iniciar
4. No PowerShell, executar:

```powershell
cd "c:\Users\damas\Documents\PROJETOS\CRM TUBOMINAS"
docker compose -f docker/docker-compose.yml up postgres redis -d
```

### Opção B: PostgreSQL Nativo (Sem Docker)

1. **Baixar:** https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. **Instalar PostgreSQL 15** ou 16
3. Durante instalação:
   - Senha: `crm_password`
   - Porta: `5432`
4. **Abrir pgAdmin ou SQL Shell** e executar:

```sql
CREATE DATABASE crm_database;
CREATE USER crm_user WITH PASSWORD 'crm_password';
GRANT ALL PRIVILEGES ON DATABASE crm_database TO crm_user;
ALTER DATABASE crm_database OWNER TO crm_user;
```

---

## PASSO 2: RODAR MIGRATIONS

No PowerShell:

```powershell
cd "c:\Users\damas\Documents\PROJETOS\CRM TUBOMINAS\backend"
npx prisma migrate dev --name init
```

**Você verá:** "Your database is now in sync with your schema."

---

## PASSO 3: POPULAR O BANCO (SEED)

```powershell
npx tsx prisma/seed.ts
```

**Você verá:**

```
🌱 Starting database seed...
📦 Creating plans...
✅ Plans created!
🔐 Creating permissions...
✅ Permissions created!
🏢 Creating demo company...
✅ Company created!
👑 Creating admin role...
✅ Admin role created with all permissions!
💳 Creating subscription...
✅ Subscription created!
👤 Creating admin user...
✅ Admin user created!

🎉 Seed completed successfully!

📝 Login credentials:
   Email: admin@crm.com
   Password: Admin123!
```

---

## PASSO 4: INICIAR O BACKEND

```powershell
npm run dev
```

**Você verá:**

```
╔═══════════════════════════════════════════════════╗
║   🚀 CRM IA ENTERPRISE - BACKEND STARTED         ║
║   📍 Server: http://localhost:3333              ║
║   📚 Docs:   http://localhost:3333/docs        ║
╚═══════════════════════════════════════════════════╝
```

**Deixe este terminal aberto!**

---

## PASSO 5: INICIAR O FRONTEND

**Abra um NOVO PowerShell** e execute:

```powershell
cd "c:\Users\damas\Documents\PROJETOS\CRM TUBOMINAS\frontend"
npm run dev
```

**Você verá:**

```
VITE v5.4.21  ready in 276 ms

➜  Local:   http://localhost:5173/
```

---

## PASSO 6: ACESSAR O SISTEMA

Abra o navegador em: **http://localhost:5173**

**Login:**
- Email: `admin@crm.com`
- Senha: `Admin123!`

---

## ✅ CHECKLIST

Antes de fazer login, certifique-se que:

- [x] PostgreSQL está rodando (Docker ou nativo)
- [x] Migrations foram executadas sem erro
- [x] Seed foi executado e mostrou as credenciais
- [x] Backend está rodando (porta 3333)
- [x] Frontend está rodando (porta 5173)
- [x] Você acessou http://localhost:5173

---

## 🐛 PROBLEMAS COMUNS

### "Can't reach database server"

**Solução:** PostgreSQL não está rodando.

- **Docker:** `docker ps` deve mostrar `crm-postgres`
- **Nativo:** Abrir "Services" do Windows e verificar se "postgresql" está rodando

### "Port 3333 already in use"

**Solução:** Algo já está usando a porta.

```powershell
netstat -ano | findstr :3333
taskkill /PID <numero> /F
```

### "Prisma Client not generated"

**Solução:**

```powershell
cd backend
npx prisma generate
```

---

## 📞 PRECISA DE AJUDA?

Se algo der errado:

1. **Feche tudo** (Ctrl+C nos terminais)
2. **Me envie uma screenshot do erro**
3. **Diga em qual passo parou**

---

**Boa sorte! 🚀**
