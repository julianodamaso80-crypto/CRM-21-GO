# GTM Server Container — Setup Manual (Stape.io)

O container Server NÃO pode ser importado via JSON porque usa templates
do Stape.io que precisam ser instalados manualmente. Siga este guia:

---

## 1. Criar Container Server no Stape.io

1. Acesse https://stape.io e crie uma conta
2. Crie um Server Container
3. Anote a URL (ex: `https://sgtm.21go.site` ou `https://xxx.stape.io`)
4. No GTM Web, vá em Admin > Container Settings > Server Container URL
5. Cole a URL do Stape

---

## 2. Tags a Criar no GTM Server

### Tag 1: GA4 Client
- Template: **GA4** (nativo do GTM Server)
- Config: Enable Auto-Config = ON
- Trigger: **All Requests**

### Tag 2: GA4 Server
- Template: **Google Analytics: GA4** (nativo)
- Measurement ID: `G-XXXXXXXXXX` (mesmo do Web)
- Trigger: **All Events** (do GA4 Client)

### Tag 3: Meta CAPI
- Template: Instalar **"Facebook Conversions API Tag"** do Stape.io
  (Community Template Gallery > buscar "Facebook CAPI Stape")
- Configuração:
  - **API Access Token**: (gerar no Meta Business Suite > Events Manager > Settings)
  - **Pixel ID**: `000000000000000` (mesmo do Web)
  - **Event Name**: Use Lookup Table:
    | Evento DataLayer | Evento Meta |
    |---|---|
    | page_view | PageView |
    | cotacao_inicio | InitiateCheckout |
    | cotacao_completa | Lead |
    | whatsapp_click | Contact |
  - **Event ID**: `{{Event Data - event_id}}` (CRUCIAL pra deduplicação)
  - **Action Source**: `website`
  - **Event Source URL**: `{{Event Data - page_location}}`
  - **Client IP**: `{{Event Data - ip_override}}`
  - **Client User Agent**: `{{Event Data - user_agent}}`
  - **FBC**: `{{Event Data - _fbc}}`
  - **FBP**: `{{Event Data - _fbp}}`
  - **Custom Data** (para Lead e Contact):
    - Value: `{{Event Data - value}}`
    - Currency: `BRL`
- Trigger: Custom Event onde Event Name = `page_view|cotacao_inicio|cotacao_completa|whatsapp_click`

### Tag 4: Google Ads Enhanced Conversions (opcional)
- Template: **Google Ads Conversion Tracking** (nativo)
- Conversion ID: `AW-0000000000`
- Conversion Label: (do Google Ads)
- Value: `{{Event Data - value}}`
- Currency: BRL
- Order ID: `{{Event Data - event_id}}`
- Trigger: Custom Event onde Event Name = `cotacao_completa`

---

## 3. Variables a Criar no GTM Server

Todas do tipo **Event Data**:

| Nome | Key |
|---|---|
| ED - event_id | `event_id` |
| ED - plan_name | `plan_name` |
| ED - plan_value | `value` |
| ED - page_location | `page_location` |
| ED - ip_override | `ip_override` |
| ED - user_agent | `user_agent` |
| ED - fbc | `_fbc` |
| ED - fbp | `_fbp` |
| ED - fbclid | `fbclid` |
| ED - gclid | `gclid` |
| ED - email_hash | `x-ga-ud-email` |
| ED - phone_hash | `x-ga-ud-phone` |

---

## 4. Stape Cookie Keeper

1. No Stape dashboard, ative **Cookie Keeper**
2. Isso mantém cookies first-party via server (importante pra Safari/iOS)
3. Os cookies `_21go_gclid`, `_21go_fbclid` etc serão preservados por 90 dias

---

## 5. Validação

1. No GTM Server, use Preview Mode
2. Acesse o site e faça uma cotação
3. Verifique nos logs do Stape que os 4 eventos chegaram
4. No Meta Events Manager > Test Events, confirme que os eventos CAPI aparecem
5. Confirme que event_id bate entre client e server (deduplicação)
