# Orquestração do Banco de Dados — site 21go + PowerCRM + Evolution

Documento operacional do que foi implementado e o que precisa ser feito UMA VEZ
no servidor pra ativar tudo.

## 1. O que está implementado

### Tabelas Supabase (após rodar a migration)

| Tabela | Função | Garantia anti-duplicidade |
|---|---|---|
| `leads` | Lead com identidade + tracking + status do funil | `trk` UNIQUE, `event_id` UNIQUE, `quotation_code` UNIQUE |
| `conversations` | 1 linha por número WhatsApp na instância | `(jid, evolution_instance)` UNIQUE |
| `messages` | TODA mensagem trocada (in + out) | `(whatsapp_message_id, evolution_instance)` UNIQUE |
| `lead_status_history` | Trail de cada mudança de etapa do funil | (append-only) |
| `conversion_events_log` | Trail de envios pra Google Ads / Meta CAPI / GA4 MP | (append-only) |
| `webhook_inbound_log` | Auditoria de webhooks recebidos (PowerCRM, Evolution) | `(source, payload_hash)` UNIQUE |
| `outbound_event_log` | Auditoria de chamadas saintes (PowerAPI etc) | (append-only) |

### Fluxos cobertos

1. **Cliente preenche formulário no site** (`/cotacao` → `/api/vehicle/lead`):
   - Cria lead no PowerCRM (chain `cb→cmby→cmy` mantida)
   - UPSERT em `leads` (idempotente por `trk`)
   - UPSERT em `conversations` (idempotente por `jid`)
   - Envia WhatsApp (texto ou PDF) via Evolution
   - INSERT em `messages` com `whatsapp_message_id` retornado pela Evolution

2. **Cliente manda mensagem direto pelo WhatsApp** (sem passar pelo site):
   - Evolution envia evento `messages.upsert` pro nosso `/api/webhooks/evolution`
   - UPSERT em `conversations` (cria se não existir)
   - INSERT em `messages` (direção `inbound`)
   - Trigger atualiza `conversations.last_message_at` + `total_messages`

3. **Status de entrega do WhatsApp** (PENDING → SENT → DELIVERED → READ):
   - Evolution envia `messages.update` pro nosso webhook
   - UPDATE em `messages.status` + timestamps

4. **Lead vira QUENTE no PowerCRM** ("Liberada para cadastro"):
   - PowerCRM dispara webhook pro `/api/webhooks/powercrm/<slug>`
   - UPDATE `leads.etapa_funil = 'RELEASED_FOR_REGISTRATION'`
   - UPDATE `leads.liberado_cadastro = true`
   - INSERT em `lead_status_history`
   - Dispara `Lead` event nas 3 conversion APIs (Google Ads, Meta CAPI, GA4 MP)
   - Marca `google_ads_sent_at`, `meta_capi_sent_at`, `ga4_mp_sent_at`

5. **Venda concretizada no PowerCRM**:
   - Mesmo caminho mas com status `COMPLETED`
   - Busca valor real via `getNegotiation` do PowerCRM
   - Dispara `Purchase` event com valor

## 2. Setup necessário (FAZER UMA VEZ)

### A. Aplicar migration no Supabase

1. Abrir https://supabase.com/dashboard/project/noawceqgqfwtpnrzmvdo/sql
2. Cole o conteúdo de `supabase/migrations/001_orchestration.sql`
3. Clicar em **Run**

Validar:
```sql
SELECT trk, event_id, quotation_code FROM public.leads LIMIT 1;          -- novas colunas
SELECT jid, contact_phone FROM public.conversations LIMIT 1;             -- novas colunas
SELECT status, raw_payload FROM public.messages LIMIT 1;                 -- novas colunas
SELECT * FROM public.lead_status_history LIMIT 1;                        -- tabela criada
SELECT * FROM public.conversion_events_log LIMIT 1;                      -- tabela criada
```

### B. Configurar webhook da Evolution

A instância `21gosite` precisa apontar webhook events pro nosso endpoint.

URL alvo: `https://21go.site/api/webhooks/evolution`

Eventos a marcar:
- ✅ `MESSAGES_UPSERT` (mensagens novas, in + out)
- ✅ `MESSAGES_UPDATE` (status: SENT/DELIVERED/READ)
- ✅ `SEND_MESSAGE` (confirmação de envio)
- ⚪ Outros (CONNECTION_UPDATE, CONTACTS_UPSERT etc.) — opcional

Modo de configuração via API:

```bash
EVOLUTION_API_URL=https://automacoes-evolution-api.klo3fa.easypanel.host
EVOLUTION_INSTANCE=21gosite
EVOLUTION_API_KEY=52DE882E153D-40EF-BD72-946FEB2E5C1F
WEBHOOK_TOKEN=<gerar uuid e setar no Easypanel como EVOLUTION_WEBHOOK_TOKEN>

curl -X POST "$EVOLUTION_API_URL/webhook/set/$EVOLUTION_INSTANCE" \
  -H "apikey: $EVOLUTION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "enabled": true,
      "url": "https://21go.site/api/webhooks/evolution",
      "headers": {"apikey": "'"$WEBHOOK_TOKEN"'"},
      "byEvents": false,
      "base64": false,
      "events": [
        "MESSAGES_UPSERT",
        "MESSAGES_UPDATE",
        "SEND_MESSAGE"
      ]
    }
  }'
```

Ou via dashboard Evolution: Manager → instance 21gosite → Events.

### C. Gerar slug do webhook PowerCRM

A env `POWERCRM_WEBHOOK_SLUG` está como placeholder.

```bash
# Gerar UUID v4
openssl rand -hex 16
# Exemplo: a3f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6
```

Setar no Easypanel (ambiente do projeto `social-21go/site`):
```
POWERCRM_WEBHOOK_SLUG=a3f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6
```

URL final: `https://21go.site/api/webhooks/powercrm/a3f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6`

Configurar essa URL no PowerCRM (UI da Letícya ou via API). Pedir suporte do PowerCRM se não houver self-service.

### D. Variáveis de ambiente — Conversion APIs (opcional, ativam quando setadas)

#### Meta Conversions API
```
META_PIXEL_ID=<id do pixel>
META_CAPI_ACCESS_TOKEN=<EAA... long-lived token gerado em Events Manager>
META_TEST_EVENT_CODE=TEST12345  # opcional, só pra teste no Test Events
```

Onde gerar: https://business.facebook.com/events_manager → Pixel → Settings → Conversions API → Generate Access Token.

#### Google Ads (Enhanced Conversions for Leads)
```
GOOGLE_ADS_DEVELOPER_TOKEN=<developer token MCC>
GOOGLE_ADS_LOGIN_CUSTOMER_ID=4854858072         # MCC Juliano (sem traços)
GOOGLE_ADS_CUSTOMER_ID=4712440780               # 21 GO - JULIANO (sem traços)
GOOGLE_ADS_OAUTH_REFRESH_TOKEN=1//0...
GOOGLE_ADS_OAUTH_CLIENT_ID=<google_oauth_client_id>
GOOGLE_ADS_OAUTH_CLIENT_SECRET=<google_oauth_client_secret>
GOOGLE_ADS_CONVERSION_ACTION_ID=<id da Conversion Action criada>
```

Passos:
1. https://ads.google.com → conta `21 GO - JULIANO` → Tools → Conversions → criar uma "Lead" e uma "Sale"
2. Pegar o ID numérico da Conversion Action
3. Developer token: https://ads.google.com/aw/apicenter (com MCC selecionada)
4. OAuth: criar projeto em https://console.cloud.google.com → OAuth client (Desktop app) → autorizar uma vez com email `damasojuliano@gmail.com` → guardar refresh_token

#### GA4 Measurement Protocol
```
GA4_MEASUREMENT_ID=G-XXXXXXX
GA4_API_SECRET=<gerado em Admin → Data Streams → Measurement Protocol API secrets>
```

#### Webhook Evolution token
```
EVOLUTION_WEBHOOK_TOKEN=<o uuid usado em B>
```

### E. Reiniciar o container do site no Easypanel

Após setar todas as envs:
1. Easypanel → social-21go → site → **Rebuild** (com no-cache se possível)
2. Ou simplesmente **Restart**

## 3. Como validar end-to-end

### Teste 1 — Lead via formulário site
1. Abrir https://21go.site/cotacao
2. Preencher com `?utm_source=test&utm_medium=cpc&gclid=TESTGCLID123` na URL
3. Submeter o form
4. Conferir no Supabase:
   ```sql
   SELECT id, trk, nome, telefone, gclid, utm_source, quotation_code, etapa_funil
   FROM leads ORDER BY created_at DESC LIMIT 1;
   ```
5. Conferir conversa criada:
   ```sql
   SELECT id, jid, contact_phone, total_messages
   FROM conversations ORDER BY created_at DESC LIMIT 1;
   ```
6. Conferir mensagem registrada:
   ```sql
   SELECT id, direction, status, message_type, content
   FROM messages ORDER BY created_at DESC LIMIT 1;
   ```

### Teste 2 — Cliente novo escreve no WhatsApp
1. Mandar mensagem do seu celular pessoal pro número Letycia (5521979034169)
2. Em até alguns segundos, deve aparecer no Supabase:
   ```sql
   SELECT * FROM messages ORDER BY created_at DESC LIMIT 1;       -- direction='inbound'
   SELECT * FROM conversations ORDER BY created_at DESC LIMIT 1;  -- nova conversa
   ```

### Teste 3 — Webhook PowerCRM
1. No PowerCRM, mover o lead pra "Liberada para cadastro"
2. Conferir:
   ```sql
   SELECT id, etapa_funil, liberado_cadastro, liberado_cadastro_em FROM leads WHERE id = 'lead_<trk>';
   SELECT * FROM lead_status_history WHERE lead_id = 'lead_<trk>' ORDER BY changed_at DESC;
   SELECT * FROM conversion_events_log WHERE lead_id = 'lead_<trk>' ORDER BY sent_at DESC;
   ```
3. Se as Conversion APIs estiverem configuradas, o evento "Lead" deve aparecer em:
   - Meta Events Manager → Test Events
   - Google Ads → Conversions → ver "Conversões offline"
   - GA4 → DebugView (se sandbox) ou Realtime

## 4. Notas importantes

- **Nada quebra se o Supabase cair** — `try/catch` em volta de cada gravação no Supabase, lead segue indo pro PowerCRM normalmente.
- **Nada quebra se Conversion API não estiver configurada** — função retorna `{skipped: true}`, lead marcado como "tentei" pra não retentar a cada webhook.
- **Idempotência total** — webhook duplicado (Evolution ou PowerCRM) é absorvido pelos UNIQUEs.
- **`messages` cresce rápido** — em ~6 meses pode passar dos 100k. Se ficar lento, particionar por `created_at` (mensal) ou criar arquivamento. Por agora os índices em `(conversation_id)` e `(created_at DESC)` cobrem.
