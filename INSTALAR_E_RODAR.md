# COMO RODAR O CRM 21Go - PASSO A PASSO

## IMPORTANTE: Siga NA ORDEM!

---

## PASSO 1: INSTALAR POSTGRESQL

### Opcao A: Com Docker (Recomendado)

1. **Baixar Docker Desktop:** https://www.docker.com/products/docker-desktop/
2. **Instalar** e **reiniciar o PC**
3. **Abrir Docker Desktop** e aguardar iniciar
4. No PowerShell, executar:

```powershell
cd "c:\Users\damas\Documents\PROJETOS\CRM"
docker compose -f docker/docker-compose.yml up postgres redis -d
```

### Opcao B: PostgreSQL Nativo (Sem Docker)

1. **Baixar:** https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. **Instalar PostgreSQL 15** ou 16
3. Durante instalacao:
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
cd "c:\Users\damas\Documents\PROJETOS\CRM\backend"
npx prisma migrate dev --name init
```

**Voce vera:** "Your database is now in sync with your schema."

---

## PASSO 3: POPULAR O BANCO (SEED)

```powershell
npx tsx prisma/seed.ts
```

**Voce vera:**

```
Starting database seed...
Creating plans...
Plans created!
Creating permissions...
Permissions created!
Creating company...
Company created!
Creating admin role...
Admin role created with all permissions!
Creating subscription...
Subscription created!
Creating admin user...
Admin user created!

Seed completed successfully!

Login credentials:
   Email: damasojuliano@gmail.com
```

---

## PASSO 4: INICIAR O BACKEND

```powershell
npm run dev
```

**Deixe este terminal aberto!**

---

## PASSO 5: INICIAR O FRONTEND

**Abra um NOVO PowerShell** e execute:

```powershell
cd "c:\Users\damas\Documents\PROJETOS\CRM\frontend"
npm run dev
```

---

## PASSO 6: ACESSAR O SISTEMA

Abra o navegador em: **http://localhost:5173**

**Login:**
- Email: `damasojuliano@gmail.com`
- Senha: (definida pelo admin)

---

## CHECKLIST

Antes de fazer login, certifique-se que:

- [x] PostgreSQL esta rodando (Docker ou nativo)
- [x] Migrations foram executadas sem erro
- [x] Seed foi executado
- [x] Backend esta rodando (porta 3333)
- [x] Frontend esta rodando (porta 5173)
- [x] Voce acessou http://localhost:5173

---

## PROBLEMAS COMUNS

### "Can't reach database server"

**Solucao:** PostgreSQL nao esta rodando.

- **Docker:** `docker ps` deve mostrar `crm-postgres`
- **Nativo:** Abrir "Services" do Windows e verificar se "postgresql" esta rodando

### "Port 3333 already in use"

**Solucao:** Algo ja esta usando a porta.

```powershell
netstat -ano | findstr :3333
taskkill /PID <numero> /F
```

### "Prisma Client not generated"

**Solucao:**

```powershell
cd backend
npx prisma generate
```

---

**21Go Protecao Veicular** | CRM + IA
