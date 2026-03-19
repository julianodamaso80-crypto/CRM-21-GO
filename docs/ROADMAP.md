# ROADMAP DE DESENVOLVIMENTO - CRM IA ENTERPRISE

## Filosofia de Desenvolvimento

Este roadmap segue a abordagem de **produto vendável desde o início**. Cada fase entrega valor real e pode ser demonstrada para clientes em potencial.

**Princípios:**
- Não entregamos MVPs rasos
- Cada feature é pensada para escala
- Qualidade de código é inegociável
- Segurança e performance são prioridades

---

## FASE 1: FOUNDATION (Semanas 1-3)

**Objetivo:** Base sólida para todo o sistema

### 1.1 Autenticação e Autorização ✓ CRÍTICO

**Tarefas:**
- [ ] Implementar registro de usuário + empresa
- [ ] Implementar login com JWT + Refresh Token
- [ ] Endpoint de refresh token
- [ ] Logout (blacklist de tokens)
- [ ] Recuperação de senha (email)
- [ ] Middleware de autenticação
- [ ] Sistema RBAC completo
- [ ] Seed de roles e permissions

**Entregáveis:**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- Middleware `@authenticate()`
- Middleware `@checkPermission(permission)`

**Critérios de Aceitação:**
- Usuário pode se registrar com empresa
- Login retorna access token + refresh token
- Token expira em 15 minutos
- Refresh token funciona por 7 dias
- Todas as rotas protegidas validam token
- RBAC bloqueia acessos não autorizados

### 1.2 Gestão de Usuários e Empresas

**Tarefas:**
- [ ] CRUD de usuários (admin only)
- [ ] Convidar usuários para empresa (email)
- [ ] Atualizar perfil próprio
- [ ] Upload de avatar
- [ ] Listar usuários da empresa
- [ ] Desativar/ativar usuários
- [ ] Atualizar dados da empresa
- [ ] Upload de logo da empresa

**Entregáveis:**
- GET /api/users (listar da empresa)
- GET /api/users/:id
- POST /api/users (admin)
- PATCH /api/users/:id
- DELETE /api/users/:id (soft delete)
- POST /api/users/invite
- PATCH /api/users/me (perfil próprio)
- PATCH /api/companies/me

**Critérios de Aceitação:**
- Admin pode gerenciar usuários
- Usuário comum só edita próprio perfil
- Convites por email funcionam
- Avatar e logo fazem upload para MinIO/S3

### 1.3 Sistema de Planos e Limites

**Tarefas:**
- [ ] Seed de planos (Free, Pro, Enterprise)
- [ ] Serviço de verificação de limites
- [ ] Middleware de plan enforcement
- [ ] Dashboard de uso (frontend)
- [ ] Bloqueio automático por limite

**Entregáveis:**
- GET /api/plans
- GET /api/companies/me/usage
- Middleware `@checkPlanLimit(feature)`
- Tela de "Upgrade Plan" no frontend

**Critérios de Aceitação:**
- Planos cadastrados no banco
- Sistema bloqueia ações além do limite
- Frontend mostra uso atual vs limite
- Usuário vê mensagem clara ao atingir limite

---

## FASE 2: CRM CORE (Semanas 4-6)

**Objetivo:** Funcionalidades essenciais de CRM

### 2.1 Gestão de Contatos

**Tarefas:**
- [ ] CRUD completo de contatos
- [ ] Busca e filtros avançados
- [ ] Importação CSV
- [ ] Exportação CSV
- [ ] Campos customizados (JSON)
- [ ] Tags
- [ ] Timeline de atividades do contato

**Entregáveis:**
- GET /api/contacts (com filtros)
- GET /api/contacts/:id
- POST /api/contacts
- PATCH /api/contacts/:id
- DELETE /api/contacts/:id
- POST /api/contacts/import
- GET /api/contacts/export
- Tela de lista de contatos (frontend)
- Tela de detalhes do contato (frontend)

**Critérios de Aceitação:**
- Busca por nome, email, telefone funciona
- Importação CSV cria contatos em batch
- Exportação respeita filtros aplicados
- Campos customizados são salvos e exibidos
- Timeline mostra histórico completo

### 2.2 Gestão de Leads

**Tarefas:**
- [ ] CRUD de leads
- [ ] Lead scoring automático
- [ ] Atribuição manual e automática
- [ ] Status customizáveis
- [ ] Conversão de lead para deal
- [ ] Filtros e busca
- [ ] Bulk actions (atribuir, mudar status)

**Entregáveis:**
- GET /api/leads
- GET /api/leads/:id
- POST /api/leads
- PATCH /api/leads/:id
- DELETE /api/leads/:id
- POST /api/leads/:id/convert (lead → deal)
- PATCH /api/leads/bulk
- Tela de lista de leads (frontend)
- Tela de detalhes do lead (frontend)

**Critérios de Aceitação:**
- Lead pode ser criado manualmente ou via API
- Lead scoring calcula automaticamente
- Conversão para deal mantém contexto
- Filtros funcionam (status, atribuído, fonte)
- Bulk actions atualizam múltiplos leads

### 2.3 Pipeline de Vendas (Kanban)

**Tarefas:**
- [ ] CRUD de pipelines
- [ ] CRUD de stages
- [ ] CRUD de deals
- [ ] Drag & drop de deals entre stages
- [ ] Histórico de movimentações
- [ ] Cálculo automático de métricas
  - Taxa de conversão por stage
  - Tempo médio por stage
  - Valor total do pipeline
- [ ] Filtros de deals
- [ ] Detalhes do deal (modal/sidebar)

**Entregáveis:**
- GET /api/pipelines
- POST /api/pipelines
- GET /api/pipelines/:id/stages
- POST /api/stages
- PATCH /api/stages/:id/order
- GET /api/deals
- POST /api/deals
- PATCH /api/deals/:id
- PATCH /api/deals/:id/stage (mover)
- DELETE /api/deals/:id
- Kanban visual com drag & drop (frontend)
- Modal de detalhes do deal (frontend)
- Métricas do pipeline (frontend)

**Critérios de Aceitação:**
- Empresa pode ter múltiplos pipelines
- Stages são customizáveis
- Drag & drop funciona suavemente
- Histórico registra todas as movimentações
- Métricas são calculadas corretamente
- Deals podem ser filtrados por vendedor, valor, data

### 2.4 Sistema de Atividades

**Tarefas:**
- [ ] Criar atividade (call, email, meeting, note, task)
- [ ] Listar atividades (timeline)
- [ ] Filtrar atividades por tipo, data, usuário
- [ ] Marcar task como concluída
- [ ] Notificações de tasks pendentes
- [ ] Vincular atividade a lead/deal/contato

**Entregáveis:**
- POST /api/activities
- GET /api/activities (com filtros)
- PATCH /api/activities/:id
- DELETE /api/activities/:id
- Timeline de atividades (frontend)
- Modal de criar atividade (frontend)

**Critérios de Aceitação:**
- Atividades aparecem na timeline do contato/lead/deal
- Tasks pendentes aparecem em dashboard
- Filtros funcionam corretamente
- Atividades são auditadas

---

## FASE 3: COMMUNICATION (Semanas 7-9)

**Objetivo:** Chat omnichannel funcional

### 3.1 Infraestrutura de Chat

**Tarefas:**
- [ ] Setup WebSocket (Socket.io)
- [ ] Sistema de rooms por conversa
- [ ] Autenticação WebSocket
- [ ] Presence (online/offline)
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Delivery status

**Entregáveis:**
- WebSocket server
- Socket.io client (frontend)
- Real-time message delivery
- Status indicators (frontend)

**Critérios de Aceitação:**
- Mensagens chegam em tempo real
- Typing indicator funciona
- Read receipts são atualizados
- Conexão reconecta automaticamente

### 3.2 Chat Web (Interno)

**Tarefas:**
- [ ] CRUD de conversas
- [ ] Enviar mensagens
- [ ] Inbox unificada
- [ ] Busca de conversas
- [ ] Anexos (imagens, arquivos)
- [ ] Atribuir conversa a usuário
- [ ] Resolver/fechar conversa
- [ ] Notas internas (não visíveis para cliente)

**Entregáveis:**
- GET /api/conversations
- GET /api/conversations/:id/messages
- POST /api/conversations/:id/messages
- PATCH /api/conversations/:id/assign
- PATCH /api/conversations/:id/resolve
- Inbox UI (frontend)
- Chat UI (frontend)

**Critérios de Aceitação:**
- Inbox mostra todas as conversas
- Mensagens não lidas destacadas
- Atribuição funciona
- Anexos fazem upload e download
- Notas internas não vazam para cliente

### 3.3 Integração WhatsApp

**Tarefas:**
- [ ] Webhook receiver (WhatsApp → CRM)
- [ ] Message sender (CRM → WhatsApp)
- [ ] Sincronização de mensagens
- [ ] Tratamento de media (imagens, áudio)
- [ ] Status de entrega
- [ ] Templates de mensagens

**Entregáveis:**
- POST /webhooks/whatsapp
- POST /api/channels/whatsapp/send
- Configuração de canal WhatsApp (frontend)
- Mensagens WhatsApp na inbox

**Critérios de Aceitação:**
- Mensagens recebidas via webhook aparecem no CRM
- Mensagens enviadas pelo CRM chegam no WhatsApp
- Status de entrega é atualizado
- Media funciona corretamente

### 3.4 Integração Instagram

**Tarefas:**
- [ ] Webhook receiver (Instagram → CRM)
- [ ] Message sender (CRM → Instagram)
- [ ] Sincronização de DMs
- [ ] Tratamento de media
- [ ] Story mentions (opcional)

**Entregáveis:**
- POST /webhooks/instagram
- POST /api/channels/instagram/send
- Configuração de canal Instagram (frontend)
- Mensagens Instagram na inbox

**Critérios de Aceitação:**
- DMs do Instagram aparecem no CRM
- Respostas do CRM chegam no Instagram
- Media funciona corretamente

---

## FASE 4: AI & AUTOMATION (Semanas 10-12)

**Objetivo:** IA e automações funcionais

### 4.1 Camada de Abstração de IA

**Tarefas:**
- [ ] Interface AIProvider
- [ ] Implementação OpenAI
- [ ] Implementação Anthropic
- [ ] Implementação Google Gemini
- [ ] Fallback automático entre providers
- [ ] Rate limiting de IA por plano
- [ ] Logs de uso de IA

**Entregáveis:**
- Serviço AIService
- POST /api/ai/generate (interno)
- Dashboard de uso de IA (frontend)

**Critérios de Aceitação:**
- Sistema funciona com qualquer provider
- Fallback funciona em caso de erro
- Uso é contabilizado corretamente
- Limites do plano são respeitados

### 4.2 Chatbot Básico

**Tarefas:**
- [ ] CRUD de AI Agents
- [ ] Configuração de prompts
- [ ] Contexto do CRM (acesso a dados)
- [ ] Resposta automática em conversas
- [ ] Handoff para humano
- [ ] Histórico de interações IA

**Entregáveis:**
- GET /api/ai-agents
- POST /api/ai-agents
- PATCH /api/ai-agents/:id
- Bot responde automaticamente em inbox
- Configuração de bot (frontend)

**Critérios de Aceitação:**
- Bot responde mensagens automaticamente
- Bot acessa dados do CRM (com permissões)
- Bot transfere para humano quando solicitado
- Todas as respostas da IA são auditadas

### 4.3 Qualificação Automática de Leads

**Tarefas:**
- [ ] IA analisa mensagens
- [ ] Extrai intenção e entidades
- [ ] Cria lead automaticamente
- [ ] Preenche campos do lead
- [ ] Atribui score
- [ ] Notifica vendedor

**Entregáveis:**
- Serviço LeadQualificationService
- Leads criados automaticamente da conversa
- Notificação de novo lead (frontend)

**Critérios de Aceitação:**
- IA identifica interesse de compra
- Lead é criado com dados corretos
- Vendedor é notificado
- Lead aparece no CRM imediatamente

### 4.4 Webhooks

**Tarefas:**
- [ ] CRUD de webhooks
- [ ] Webhook dispatcher
- [ ] Retry automático (3x com backoff)
- [ ] Logs de chamadas
- [ ] Validação de secrets
- [ ] Teste de webhook (ping)

**Entregáveis:**
- GET /api/webhooks
- POST /api/webhooks
- POST /api/webhooks/:id/test
- Configuração de webhooks (frontend)
- Logs de webhooks (frontend)

**Critérios de Aceitação:**
- Webhook dispara em eventos corretos
- Retry funciona em caso de falha
- Logs mostram request e response
- Teste de webhook funciona

### 4.5 Sistema de Automações

**Tarefas:**
- [ ] CRUD de automações
- [ ] Rule engine (if-then)
- [ ] Ações suportadas:
  - Criar lead/deal
  - Atribuir usuário
  - Enviar mensagem
  - Chamar webhook
  - Adicionar tag
  - Mudar status
- [ ] Logs de execução

**Entregáveis:**
- GET /api/automations
- POST /api/automations
- Builder de automações (frontend)
- Logs de execução (frontend)

**Critérios de Aceitação:**
- Automações executam corretamente
- Todas as ações funcionam
- Logs mostram execuções
- Sistema é performático

---

## FASE 5: ANALYTICS & BILLING (Semanas 13-15)

**Objetivo:** Dashboards e monetização

### 5.1 Dashboard Analítico

**Tarefas:**
- [ ] Métricas de leads
  - Total por período
  - Por fonte
  - Por status
  - Taxa de conversão
- [ ] Métricas de deals
  - Total por pipeline
  - Por stage
  - Valor total
  - Tempo médio de fechamento
- [ ] Métricas de vendedores
  - Performance individual
  - Ranking
- [ ] Métricas de IA
  - Conversas atendidas
  - Taxa de handoff
- [ ] Gráficos (Recharts)
- [ ] Filtros de período

**Entregáveis:**
- GET /api/analytics/leads
- GET /api/analytics/deals
- GET /api/analytics/users
- GET /api/analytics/ai
- Dashboard completo (frontend)

**Critérios de Aceitação:**
- Todas as métricas são calculadas corretamente
- Gráficos são interativos
- Filtros funcionam
- Performance é aceitável (< 2s)

### 5.2 Integração Stripe

**Tarefas:**
- [ ] Criar customer no Stripe
- [ ] Criar subscription
- [ ] Webhook de pagamento confirmado
- [ ] Webhook de pagamento falhado
- [ ] Upgrade/downgrade de plano
- [ ] Cancelamento de assinatura
- [ ] Histórico de invoices
- [ ] Portal de billing (Stripe hosted)

**Entregáveis:**
- POST /api/billing/subscribe
- POST /api/billing/upgrade
- POST /api/billing/cancel
- GET /api/billing/invoices
- POST /webhooks/stripe
- Tela de billing (frontend)
- Modal de checkout (frontend)

**Critérios de Aceitação:**
- Usuário consegue assinar plano
- Pagamento é processado corretamente
- Acesso é liberado após pagamento
- Acesso é bloqueado após inadimplência
- Upgrade/downgrade funciona com prorata

### 5.3 Notificações

**Tarefas:**
- [ ] Sistema de notificações in-app
- [ ] Notificações por email
- [ ] Preferências de notificação
- [ ] Marcar como lida
- [ ] Notificações em tempo real (WebSocket)

**Entregáveis:**
- GET /api/notifications
- PATCH /api/notifications/:id/read
- PATCH /api/users/me/notification-preferences
- Bell icon com contador (frontend)
- Lista de notificações (frontend)

**Critérios de Aceitação:**
- Notificações aparecem em tempo real
- Email é enviado para eventos importantes
- Usuário pode configurar preferências
- Notificações antigas são limpas automaticamente

---

## FASE 6: ENTERPRISE FEATURES (Semanas 16-18)

**Objetivo:** Recursos para clientes enterprise

### 6.1 Auditoria Completa

**Tarefas:**
- [ ] Audit log para todas as ações
- [ ] Filtros avançados de auditoria
- [ ] Exportação de logs
- [ ] Retenção configurável
- [ ] Interface de auditoria (admin only)

**Entregáveis:**
- GET /api/audit-logs
- Tela de auditoria (frontend)

**Critérios de Aceitação:**
- Todas as ações são registradas
- Logs incluem IP, user agent, timestamp
- Filtros funcionam
- Performance é aceitável

### 6.2 API Pública

**Tarefas:**
- [ ] API keys (geração, revogação)
- [ ] Rate limiting por API key
- [ ] Documentação completa (Swagger)
- [ ] SDKs (JavaScript, Python)
- [ ] Webhooks de API (opcional)

**Entregáveis:**
- GET /api/api-keys
- POST /api/api-keys
- DELETE /api/api-keys/:id
- Documentação completa
- SDK JavaScript
- SDK Python (opcional)

**Critérios de Aceitação:**
- API keys funcionam para auth
- Rate limiting por key funciona
- Documentação está completa
- SDKs facilitam integração

### 6.3 Exportação de Dados

**Tarefas:**
- [ ] Exportar todos os dados da empresa
- [ ] Formato JSON
- [ ] Formato CSV (por entidade)
- [ ] GDPR compliance
- [ ] Agendamento de exports

**Entregáveis:**
- POST /api/exports
- GET /api/exports/:id/download
- Tela de exportação (frontend)

**Critérios de Aceitação:**
- Export inclui todos os dados
- Formato é legível
- Performance é aceitável
- Dados sensíveis são protegidos

### 6.4 White-Label (Opcional)

**Tarefas:**
- [ ] Custom domain
- [ ] Custom logo
- [ ] Custom cores
- [ ] Custom email templates
- [ ] Remove branding "Powered by CRM IA"

**Entregáveis:**
- Configuração de white-label (admin)
- Sistema aplica branding customizado

**Critérios de Aceitação:**
- Empresa consegue usar domínio próprio
- Logo e cores aplicam corretamente
- Emails usam template customizado
- Branding é removido (plano enterprise)

---

## FASE 7: POLISH & LAUNCH (Semanas 19-20)

**Objetivo:** Preparar para lançamento

### 7.1 Testes

**Tarefas:**
- [ ] Testes unitários (Services)
- [ ] Testes de integração (API)
- [ ] Testes E2E (Playwright)
- [ ] Testes de carga (k6)
- [ ] Testes de segurança (OWASP)

**Critérios de Aceitação:**
- Cobertura > 80%
- Todos os testes passam
- Performance é aceitável
- Sem vulnerabilidades críticas

### 7.2 Performance

**Tarefas:**
- [ ] Otimizar queries N+1
- [ ] Implementar indexes faltantes
- [ ] Cache estratégico (Redis)
- [ ] Lazy loading no frontend
- [ ] Code splitting
- [ ] Compress assets

**Critérios de Aceitação:**
- API responde < 200ms (p95)
- Frontend carrega < 3s (3G)
- Lighthouse score > 90

### 7.3 Documentação

**Tarefas:**
- [ ] Documentação de API completa
- [ ] Guia de usuário
- [ ] Tutoriais em vídeo
- [ ] FAQ
- [ ] Changelog

**Entregáveis:**
- Docs site (Docusaurus)
- Help center
- Vídeos tutoriais

### 7.4 Deploy Production

**Tarefas:**
- [ ] Setup Kubernetes/Cloud Run
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring (Datadog/Sentry)
- [ ] Backups automáticos
- [ ] SSL certificates
- [ ] Domain setup
- [ ] Email setup (transacional)

**Entregáveis:**
- Sistema rodando em produção
- Monitoring ativo
- Backups configurados

### 7.5 Marketing Site

**Tarefas:**
- [ ] Landing page
- [ ] Página de pricing
- [ ] Página de features
- [ ] Blog (opcional)
- [ ] SEO optimization

**Entregáveis:**
- Marketing site (Next.js)
- Formulário de cadastro
- Integração com CRM

---

## MÉTRICAS DE SUCESSO

### Técnicas
- [ ] Uptime > 99.9%
- [ ] API latency < 200ms (p95)
- [ ] Frontend load < 3s
- [ ] Zero critical bugs
- [ ] Cobertura de testes > 80%

### Negócio
- [ ] 10 empresas beta testando
- [ ] 3 empresas pagantes no primeiro mês
- [ ] MRR > R$ 5.000 no terceiro mês
- [ ] Churn < 10%
- [ ] NPS > 50

---

## BACKLOG (Futuro)

### Features Avançadas
- [ ] Multi-idioma (i18n)
- [ ] Mobile app (React Native)
- [ ] Integrações nativas (Zapier, Make)
- [ ] Voice calls (Twilio)
- [ ] SMS campaigns
- [ ] Email marketing
- [ ] Relatórios customizáveis
- [ ] Forecasting de vendas (ML)
- [ ] Gamification para vendedores

### Integrações
- [ ] Google Calendar
- [ ] Microsoft Teams
- [ ] Slack
- [ ] Zoom
- [ ] Calendly
- [ ] HubSpot (sync)
- [ ] Salesforce (sync)

### Enterprise+
- [ ] SSO (SAML, OAuth)
- [ ] Dedicated instances
- [ ] Custom SLA
- [ ] Priority support
- [ ] Dedicated success manager

---

## CONCLUSÃO

Este roadmap é agressivo mas realista. Em 20 semanas, teremos um CRM completo, competitivo e pronto para venda.

**Cada fase entrega valor incremental** e pode ser demonstrada para clientes. A arquitetura foi pensada para escalar, então não haverá rewrites.

**Próximos passos imediatos:**
1. Completar autenticação e RBAC
2. Implementar CRM core (contacts, leads, deals)
3. Entregar primeira versão beta para teste

**Foco:** Qualidade sobre velocidade. Melhor entregar bem feito do que rápido e quebrado.
