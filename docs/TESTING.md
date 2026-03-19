# Guia de Testes

## 🧪 Setup de Testes

### Backend (Vitest)

**Instalado:**
- Vitest
- Prisma Test Environment

**Testes Existentes:**
- `backend/src/modules/ai/ai.test.ts` ✅
- `backend/src/modules/pipes/pipes.test.ts` ✅

### Executar Testes
```bash
cd backend
npm test              # Rodar todos os testes
npm test -- --watch   # Modo watch
npm run test:coverage # Com cobertura
```

---

## 📝 Estrutura de Teste

### Exemplo: Contact Service Test

```typescript
// backend/src/modules/contacts/contacts.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { ContactsService } from './contacts.service'
import { prisma } from '../../config/database'

describe('ContactsService', () => {
  let service: ContactsService
  let testCompanyId: string

  beforeAll(async () => {
    service = new ContactsService()
    // Setup: criar company de teste
    const company = await prisma.company.create({
      data: { name: 'Test Company', slug: 'test-company', email: 'test@test.com' }
    })
    testCompanyId = company.id
  })

  afterAll(async () => {
    // Cleanup: deletar dados de teste
    await prisma.contact.deleteMany({ where: { companyId: testCompanyId } })
    await prisma.company.delete({ where: { id: testCompanyId } })
    await prisma.$disconnect()
  })

  it('should create a contact', async () => {
    const contact = await service.createContact(testCompanyId, {
      fullName: 'John Doe',
      email: 'john@test.com',
      phone: '11999999999',
    })

    expect(contact).toBeDefined()
    expect(contact.fullName).toBe('John Doe')
    expect(contact.email).toBe('john@test.com')
    expect(contact.companyId).toBe(testCompanyId)
  })

  it('should list contacts', async () => {
    const result = await service.listContacts(testCompanyId, {})
    expect(result.data).toBeInstanceOf(Array)
    expect(result.data.length).toBeGreaterThan(0)
  })

  it('should update a contact', async () => {
    const contact = await service.createContact(testCompanyId, {
      fullName: 'Jane Doe',
      email: 'jane@test.com',
    })

    const updated = await service.updateContact(contact.id, testCompanyId, {
      phone: '11988888888',
    })

    expect(updated.phone).toBe('11988888888')
  })

  it('should delete a contact', async () => {
    const contact = await service.createContact(testCompanyId, {
      fullName: 'To Delete',
      email: 'delete@test.com',
    })

    const result = await service.deleteContact(contact.id, testCompanyId)
    expect(result.success).toBe(true)

    // Verificar que foi deletado
    const deleted = await prisma.contact.findUnique({ where: { id: contact.id } })
    expect(deleted).toBeNull()
  })
})
```

---

## 🎯 Criar Testes para Outros Módulos

### 1. Leads
```bash
touch backend/src/modules/leads/leads.test.ts
```

Testar:
- ✅ Criar lead
- ✅ Listar leads com filtros
- ✅ Atualizar status
- ✅ Estatísticas

### 2. Associados
```bash
touch backend/src/modules/associados/associados.test.ts
```

Testar:
- Criar associado
- Validar CPF unico
- Listar com filtros
- Inativar associado

### 3. Veiculos
```bash
touch backend/src/modules/vehicles/vehicles.test.ts
```

Testar:
- Criar veiculo vinculado a associado
- Validar placa unica
- Consultar FIPE
- Listar veiculos do associado

### 4. Sinistros
```bash
touch backend/src/modules/sinistros/sinistros.test.ts
```

Testar:
- Abrir sinistro
- Atualizar status (5 etapas)
- Upload de fotos
- Timeline de eventos

---

## 🚀 Frontend (Vitest + React Testing Library)

### Setup (Não implementado ainda)

```bash
cd frontend
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui
```

### Exemplo: Contact Form Test

```typescript
// frontend/src/pages/contacts/__tests__/ContactForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ContactForm } from '../ContactForm'

describe('ContactForm', () => {
  const queryClient = new QueryClient()

  it('should render form fields', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ContactForm />
      </QueryClientProvider>
    )

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ContactForm />
      </QueryClientProvider>
    )

    const submitButton = screen.getByRole('button', { name: /salvar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/nome \u00e9 obrigat\u00f3rio/i)).toBeInTheDocument()
    })
  })

  it('should submit valid data', async () => {
    const mockOnSubmit = vi.fn()

    render(
      <QueryClientProvider client={queryClient}>
        <ContactForm onSubmit={mockOnSubmit} />
      </QueryClientProvider>
    )

    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@test.com' } })

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        fullName: 'John Doe',
        email: 'john@test.com',
      })
    })
  })
})
```

---

## 🔍 E2E Tests (Playwright - Opcional)

### Setup
```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

### Exemplo: Login Flow
```typescript
// frontend/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('should login successfully', async ({ page }) => {
  await page.goto('http://localhost:5173/login')

  await page.fill('input[type="email"]', 'damasojuliano@gmail.com')
  await page.fill('input[type="password"]', '160807')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('http://localhost:5173/')
  await expect(page.locator('h1')).toContainText('Dashboard')
})

test('should create a contact', async ({ page }) => {
  // Login primeiro
  await page.goto('http://localhost:5173/login')
  await page.fill('input[type="email"]', 'damasojuliano@gmail.com')
  await page.fill('input[type="password"]', '160807')
  await page.click('button[type="submit"]')

  // Navegar para associados
  await page.goto('http://localhost:5173/associados')
  await page.click('text=Novo Associado')

  // Preencher formulario
  await page.fill('input[name="fullName"]', 'Test Associado')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="phone"]', '21999999999')
  await page.click('button[type="submit"]')

  // Verificar sucesso
  await expect(page.locator('text=Associado criado')).toBeVisible()
})
```

---

## ✅ Checklist de Cobertura

### Backend
- [ ] **Auth**: login, register, refresh token, logout
- [ ] **Contacts**: CRUD, busca, tags, stats
- [x] **Pipes**: CRUD, phases, cards, kanban ✅
- [ ] **Leads**: CRUD, stats, conversão
- [ ] **Associados**: CRUD, CPF, filtros
- [ ] **Veiculos**: CRUD, placa, FIPE
- [ ] **Sinistros**: abertura, status, timeline
- [ ] **NPS**: criar survey, responder, stats
- [ ] **Inbox**: conversas, mensagens, status
- [x] **AI**: chat, knowledge base ✅
- [ ] **Automations**: criar, executar
- [ ] **Webhooks**: registrar, logs
- [ ] **Billing**: criar subscription, webhook
- [ ] **Upload**: single file, multiple files

### Frontend
- [ ] **Forms**: validação, submit
- [ ] **Tables**: paginação, filtros, ordenação
- [ ] **Modals**: abrir, fechar, ações
- [ ] **Auth**: login, logout, redirect
- [ ] **API**: interceptors, error handling
- [ ] **Hooks**: queries, mutations, invalidation

### E2E
- [ ] **User Journey**: registro → login → dashboard
- [ ] **CRUD Flow**: criar → editar → deletar contato
- [ ] **Sinistro Flow**: abrir → avaliar → oficina → concluir
- [ ] **Kanban Flow**: criar card → mover → completar
- [ ] **Search**: buscar associado, lead, veiculo

---

## 📊 Comandos Úteis

```bash
# Backend
npm test                  # Rodar testes
npm test -- --coverage    # Com cobertura
npm test -- --ui          # Interface visual

# Frontend
npm test                  # Rodar testes
npm test -- --watch       # Modo watch
npm run test:e2e          # E2E com Playwright
npm run test:e2e -- --ui  # E2E modo visual
```

---

## 🎯 Meta de Cobertura

- **Backend:** 80% de cobertura em services críticos
- **Frontend:** 60% de cobertura em componentes principais
- **E2E:** Fluxos principais funcionando

---

## 📚 Documentação Adicional

- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [Prisma Testing](https://www.prisma.io/docs/guides/testing)

---

**Próximos Passos:**
1. Implementar testes faltantes seguindo os exemplos
2. Configurar CI/CD para rodar testes automaticamente
3. Adicionar testes E2E para fluxos críticos
