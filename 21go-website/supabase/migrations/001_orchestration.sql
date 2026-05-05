-- =============================================================================
-- 001_orchestration.sql
-- Orquestra leads + conversas + mensagens + tracking, sem duplicidade.
-- Aproveita tabelas existentes (leads, conversations, messages, whatsapp_instances).
-- Adiciona colunas faltantes, UNIQUE constraints e 2 tabelas de auditoria.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) LEADS — adicionar colunas de tracking, idempotência e PowerCRM
-- -----------------------------------------------------------------------------
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS trk text,
  ADD COLUMN IF NOT EXISTS event_id text,
  ADD COLUMN IF NOT EXISTS quotation_code text,
  ADD COLUMN IF NOT EXISTS negotiation_code text,
  ADD COLUMN IF NOT EXISTS gbraid text,
  ADD COLUMN IF NOT EXISTS wbraid text,
  ADD COLUMN IF NOT EXISTS ga_client_id text,
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS ga4_mp_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ga4_mp_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS landing_page text,
  ADD COLUMN IF NOT EXISTS liberado_cadastro boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS liberado_cadastro_em timestamptz,
  ADD COLUMN IF NOT EXISTS fipe_codigo text,
  ADD COLUMN IF NOT EXISTS ano_fabricacao int,
  ADD COLUMN IF NOT EXISTS cidade text,
  ADD COLUMN IF NOT EXISTS estado text,
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS powercrm_payload jsonb,
  ADD COLUMN IF NOT EXISTS conversion_value_cents int,
  ADD COLUMN IF NOT EXISTS evolution_instance text;

CREATE UNIQUE INDEX IF NOT EXISTS uq_leads_trk
  ON public.leads(trk) WHERE trk IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_leads_event_id
  ON public.leads(event_id) WHERE event_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_leads_quotation_code
  ON public.leads(quotation_code) WHERE quotation_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_leads_telefone ON public.leads(telefone);
CREATE INDEX IF NOT EXISTS ix_leads_whatsapp ON public.leads(whatsapp);
CREATE INDEX IF NOT EXISTS ix_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS ix_leads_etapa ON public.leads(etapa_funil);
CREATE INDEX IF NOT EXISTS ix_leads_liberado ON public.leads(liberado_cadastro)
  WHERE liberado_cadastro = true;

-- -----------------------------------------------------------------------------
-- 2) CONVERSATIONS — adicionar campos pra suportar contato direto via WhatsApp
-- -----------------------------------------------------------------------------
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS jid text,
  ADD COLUMN IF NOT EXISTS evolution_instance text,
  ADD COLUMN IF NOT EXISTS pushname text,
  ADD COLUMN IF NOT EXISTS profile_pic_url text,
  ADD COLUMN IF NOT EXISTS total_messages int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unread_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_inbound_at timestamptz,
  ADD COLUMN IF NOT EXISTS first_outbound_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS uq_conversations_jid_inst
  ON public.conversations(jid, evolution_instance)
  WHERE jid IS NOT NULL AND evolution_instance IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_conversations_phone ON public.conversations(contact_phone);
CREATE INDEX IF NOT EXISTS ix_conversations_lead ON public.conversations(lead_id);
CREATE INDEX IF NOT EXISTS ix_conversations_last_msg ON public.conversations(last_message_at DESC);

-- -----------------------------------------------------------------------------
-- 3) MESSAGES — adicionar status, payload bruto, dedup, lead_id snapshot
-- -----------------------------------------------------------------------------
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS raw_payload jsonb,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS read_at timestamptz,
  ADD COLUMN IF NOT EXISTS evolution_instance text,
  ADD COLUMN IF NOT EXISTS jid text,
  ADD COLUMN IF NOT EXISTS pushname text,
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS media_filename text,
  ADD COLUMN IF NOT EXISTS lead_id text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'messages_status_check' AND table_name = 'messages'
  ) THEN
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_status_check
      CHECK (status IN ('PENDING','SENT','SERVER_ACK','DELIVERED','READ','FAILED','RECEIVED'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_messages_wa_id_inst
  ON public.messages(whatsapp_message_id, evolution_instance)
  WHERE whatsapp_message_id IS NOT NULL AND evolution_instance IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_messages_conv ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS ix_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS ix_messages_jid ON public.messages(jid);
CREATE INDEX IF NOT EXISTS ix_messages_lead ON public.messages(lead_id);

-- -----------------------------------------------------------------------------
-- 4) LEAD_STATUS_HISTORY — trail de mudanças de status do PowerCRM
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id text NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  source text NOT NULL,
  raw_payload jsonb,
  changed_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_lsh_lead ON public.lead_status_history(lead_id, changed_at DESC);

-- -----------------------------------------------------------------------------
-- 5) CONVERSION_EVENTS_LOG — trail de envios pra Google Ads / Meta CAPI / GA4 MP
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversion_events_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id text NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  destino text NOT NULL,
  event_name text NOT NULL,
  event_id text,
  payload jsonb,
  response_status int,
  response_body jsonb,
  success boolean,
  error_message text,
  sent_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_cev_lead ON public.conversion_events_log(lead_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS ix_cev_destino ON public.conversion_events_log(destino, success);

-- -----------------------------------------------------------------------------
-- 6) WEBHOOK_INBOUND_LOG — auditoria de webhooks recebidos (PowerCRM, Evolution)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webhook_inbound_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  path text,
  headers jsonb,
  payload jsonb,
  payload_hash text,
  status text DEFAULT 'received',
  lead_id text REFERENCES public.leads(id) ON DELETE SET NULL,
  processed_at timestamptz,
  error text,
  created_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_wil_payload_hash
  ON public.webhook_inbound_log(source, payload_hash)
  WHERE payload_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_wil_lead ON public.webhook_inbound_log(lead_id);
CREATE INDEX IF NOT EXISTS ix_wil_created ON public.webhook_inbound_log(created_at DESC);

-- -----------------------------------------------------------------------------
-- 7) OUTBOUND_EVENT_LOG — auditoria de chamadas saintes (PowerCRM API, Conversion APIs)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.outbound_event_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id text REFERENCES public.leads(id) ON DELETE SET NULL,
  kind text NOT NULL,
  request_payload jsonb,
  response_payload jsonb,
  status_code int,
  latency_ms int,
  error text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_oel_lead ON public.outbound_event_log(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_oel_kind ON public.outbound_event_log(kind);

-- -----------------------------------------------------------------------------
-- 8) LIMPEZA — remover leads dummies de seed
-- -----------------------------------------------------------------------------
DELETE FROM public.leads WHERE id IN ('lead-1','lead-2','lead-3','lead-4','lead-5');

-- -----------------------------------------------------------------------------
-- 9) TRIGGER — atualizar conversations.last_message_at + total_messages
--    quando insere uma message
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE public.conversations
    SET
      last_message_at = COALESCE(NEW.sent_at, NEW.created_at, now()),
      total_messages = total_messages + 1,
      first_inbound_at = CASE
        WHEN NEW.direction = 'inbound' AND first_inbound_at IS NULL
          THEN COALESCE(NEW.sent_at, NEW.created_at, now())
        ELSE first_inbound_at
      END,
      first_outbound_at = CASE
        WHEN NEW.direction = 'outbound' AND first_outbound_at IS NULL
          THEN COALESCE(NEW.sent_at, NEW.created_at, now())
        ELSE first_outbound_at
      END,
      updated_at = now()
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_conversation_on_message ON public.messages;
CREATE TRIGGER trg_update_conversation_on_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.fn_update_conversation_on_message();

-- -----------------------------------------------------------------------------
-- FIM
-- -----------------------------------------------------------------------------
