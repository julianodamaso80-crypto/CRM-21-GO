-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'vendedor',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "associados" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "rg" TEXT,
    "data_nascimento" TIMESTAMP(3),
    "email" TEXT,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "endereco" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "status" TEXT NOT NULL DEFAULT 'em_adesao',
    "data_adesao" TIMESTAMP(3),
    "data_cancelamento" TIMESTAMP(3),
    "motivo_cancelamento" TEXT,
    "hinova_id" TEXT,
    "indicado_por_id" TEXT,
    "total_indicacoes" INTEGER NOT NULL DEFAULT 0,
    "desconto_mgm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendedor_id" TEXT,
    "nps_score" INTEGER,
    "ultimo_nps" TIMESTAMP(3),
    "origem" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "associados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "associado_id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "renavam" TEXT,
    "chassi" TEXT,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano_fabricacao" INTEGER NOT NULL,
    "ano_modelo" INTEGER NOT NULL,
    "cor" TEXT,
    "combustivel" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'carro',
    "codigo_fipe" TEXT,
    "valor_fipe" DOUBLE PRECISION,
    "plano" TEXT NOT NULL,
    "valor_mensal" DOUBLE PRECISION,
    "tem_rastreador" BOOLEAN NOT NULL DEFAULT false,
    "rastreador_marca" TEXT,
    "vistoria_status" TEXT NOT NULL DEFAULT 'pendente',
    "vistoria_data" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "placa_interesse" TEXT,
    "marca_interesse" TEXT,
    "modelo_interesse" TEXT,
    "ano_interesse" INTEGER,
    "valor_fipe_consultado" DOUBLE PRECISION,
    "cotacao_valor" DOUBLE PRECISION,
    "cotacao_plano" TEXT,
    "cotacao_enviada" BOOLEAN NOT NULL DEFAULT false,
    "cotacao_data" TIMESTAMP(3),
    "qualificado_por" TEXT,
    "score_qualificacao" INTEGER NOT NULL DEFAULT 0,
    "vendedor_id" TEXT,
    "agente_ia_conversa_id" TEXT,
    "etapa_funil" TEXT NOT NULL DEFAULT 'novo',
    "motivo_perda" TEXT,
    "origem" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "utm_term" TEXT,
    "associado_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotacoes" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "associado_id" TEXT,
    "veiculo_dados" JSONB NOT NULL DEFAULT '{}',
    "valor_fipe" DOUBLE PRECISION NOT NULL,
    "plano" TEXT NOT NULL,
    "taxa_plano" DOUBLE PRECISION NOT NULL,
    "taxa_admin" DOUBLE PRECISION NOT NULL,
    "valor_mensal" DOUBLE PRECISION NOT NULL,
    "validade" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sinistros" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "associado_id" TEXT NOT NULL,
    "veiculo_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "data_ocorrencia" TIMESTAMP(3) NOT NULL,
    "local_ocorrencia" TEXT,
    "boletim_ocorrencia" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aberto',
    "oficina_id" TEXT,
    "guincho_solicitado" BOOLEAN NOT NULL DEFAULT false,
    "guincho_realizado" BOOLEAN NOT NULL DEFAULT false,
    "custo_estimado" DOUBLE PRECISION,
    "custo_real" DOUBLE PRECISION,
    "data_abertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_encerramento" TIMESTAMP(3),
    "responsavel_id" TEXT,
    "fotos" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sinistros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oficinas" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "telefone" TEXT,
    "responsavel" TEXT,
    "especialidade" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "avaliacao_media" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oficinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vistorias" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "associado_id" TEXT NOT NULL,
    "veiculo_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'adesao',
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "data_agendada" TIMESTAMP(3),
    "data_realizada" TIMESTAMP(3),
    "vistoriador_id" TEXT,
    "fotos" JSONB NOT NULL DEFAULT '[]',
    "observacoes" TEXT,
    "motivo_reprovacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vistorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boletos" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "associado_id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data_vencimento" TIMESTAMP(3) NOT NULL,
    "data_pagamento" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "hinova_boleto_id" TEXT,
    "link_pagamento" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boletos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nps_surveys" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "associado_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "channel" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'periodico',
    "respondido_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nps_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicacoes" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "indicador_id" TEXT NOT NULL,
    "indicado_nome" TEXT NOT NULL,
    "indicado_telefone" TEXT,
    "indicado_email" TEXT,
    "lead_id" TEXT,
    "associado_resultante_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "desconto_aplicado" DOUBLE PRECISION,
    "data_indicacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_conversao" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indicacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projetos" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'backlog',
    "prioridade" TEXT NOT NULL DEFAULT 'media',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "responsavel" TEXT,
    "data_entrega" TIMESTAMP(3),
    "progresso" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "associado_id" TEXT,
    "lead_id" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'whatsapp',
    "status" TEXT NOT NULL DEFAULT 'open',
    "assigned_to_id" TEXT,
    "agente_ia_id" TEXT,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "sender_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_agents" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "descricao" TEXT,
    "icon" TEXT,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "squad" TEXT NOT NULL DEFAULT '21go-squad',
    "type" TEXT NOT NULL DEFAULT 'internal',
    "provider" TEXT NOT NULL DEFAULT 'anthropic',
    "model" TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "max_tokens" INTEGER NOT NULL DEFAULT 2000,
    "system_prompt" TEXT NOT NULL,
    "allowed_roles" JSONB NOT NULL DEFAULT '[]',
    "allowed_scopes" JSONB NOT NULL DEFAULT '[]',
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "knowledge_base_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_bases" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_bases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_documents" (
    "id" TEXT NOT NULL,
    "knowledge_base_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "file_name" TEXT,
    "file_size" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automacoes" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "conditions" JSONB NOT NULL DEFAULT '[]',
    "actions" JSONB NOT NULL DEFAULT '[]',
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT,
    "description" TEXT,
    "changes" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipes" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT NOT NULL DEFAULT '#1B4DA1',
    "status" TEXT NOT NULL DEFAULT 'active',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phases" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "pipe_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "position" INTEGER NOT NULL,
    "probability" INTEGER NOT NULL DEFAULT 0,
    "is_won" BOOLEAN NOT NULL DEFAULT false,
    "is_lost" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_definitions" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "pipe_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "config_json" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "pipe_id" TEXT NOT NULL,
    "current_phase_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_by_id" TEXT NOT NULL,
    "assigned_to_id" TEXT,
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_field_values" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "field_definition_id" TEXT NOT NULL,
    "value_json" JSONB NOT NULL DEFAULT 'null',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_company_id_idx" ON "users"("company_id");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "associados_company_id_idx" ON "associados"("company_id");

-- CreateIndex
CREATE INDEX "associados_hinova_id_idx" ON "associados"("hinova_id");

-- CreateIndex
CREATE INDEX "associados_vendedor_id_idx" ON "associados"("vendedor_id");

-- CreateIndex
CREATE INDEX "associados_status_idx" ON "associados"("status");

-- CreateIndex
CREATE INDEX "associados_origem_idx" ON "associados"("origem");

-- CreateIndex
CREATE INDEX "associados_nome_idx" ON "associados"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "associados_company_id_cpf_key" ON "associados"("company_id", "cpf");

-- CreateIndex
CREATE INDEX "vehicles_associado_id_idx" ON "vehicles"("associado_id");

-- CreateIndex
CREATE INDEX "vehicles_codigo_fipe_idx" ON "vehicles"("codigo_fipe");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_company_id_placa_key" ON "vehicles"("company_id", "placa");

-- CreateIndex
CREATE INDEX "leads_company_id_idx" ON "leads"("company_id");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "leads_telefone_idx" ON "leads"("telefone");

-- CreateIndex
CREATE INDEX "leads_vendedor_id_idx" ON "leads"("vendedor_id");

-- CreateIndex
CREATE INDEX "leads_etapa_funil_idx" ON "leads"("etapa_funil");

-- CreateIndex
CREATE INDEX "leads_origem_idx" ON "leads"("origem");

-- CreateIndex
CREATE INDEX "cotacoes_company_id_idx" ON "cotacoes"("company_id");

-- CreateIndex
CREATE INDEX "cotacoes_lead_id_idx" ON "cotacoes"("lead_id");

-- CreateIndex
CREATE INDEX "cotacoes_associado_id_idx" ON "cotacoes"("associado_id");

-- CreateIndex
CREATE INDEX "cotacoes_status_idx" ON "cotacoes"("status");

-- CreateIndex
CREATE INDEX "sinistros_company_id_idx" ON "sinistros"("company_id");

-- CreateIndex
CREATE INDEX "sinistros_associado_id_idx" ON "sinistros"("associado_id");

-- CreateIndex
CREATE INDEX "sinistros_veiculo_id_idx" ON "sinistros"("veiculo_id");

-- CreateIndex
CREATE INDEX "sinistros_status_idx" ON "sinistros"("status");

-- CreateIndex
CREATE INDEX "sinistros_data_abertura_idx" ON "sinistros"("data_abertura");

-- CreateIndex
CREATE INDEX "sinistros_oficina_id_idx" ON "sinistros"("oficina_id");

-- CreateIndex
CREATE INDEX "oficinas_company_id_idx" ON "oficinas"("company_id");

-- CreateIndex
CREATE INDEX "oficinas_ativa_idx" ON "oficinas"("ativa");

-- CreateIndex
CREATE INDEX "vistorias_company_id_idx" ON "vistorias"("company_id");

-- CreateIndex
CREATE INDEX "vistorias_associado_id_idx" ON "vistorias"("associado_id");

-- CreateIndex
CREATE INDEX "vistorias_veiculo_id_idx" ON "vistorias"("veiculo_id");

-- CreateIndex
CREATE INDEX "vistorias_status_idx" ON "vistorias"("status");

-- CreateIndex
CREATE INDEX "boletos_company_id_idx" ON "boletos"("company_id");

-- CreateIndex
CREATE INDEX "boletos_associado_id_idx" ON "boletos"("associado_id");

-- CreateIndex
CREATE INDEX "boletos_status_idx" ON "boletos"("status");

-- CreateIndex
CREATE INDEX "boletos_data_vencimento_idx" ON "boletos"("data_vencimento");

-- CreateIndex
CREATE INDEX "nps_surveys_company_id_idx" ON "nps_surveys"("company_id");

-- CreateIndex
CREATE INDEX "nps_surveys_associado_id_idx" ON "nps_surveys"("associado_id");

-- CreateIndex
CREATE INDEX "nps_surveys_score_idx" ON "nps_surveys"("score");

-- CreateIndex
CREATE UNIQUE INDEX "indicacoes_lead_id_key" ON "indicacoes"("lead_id");

-- CreateIndex
CREATE INDEX "indicacoes_company_id_idx" ON "indicacoes"("company_id");

-- CreateIndex
CREATE INDEX "indicacoes_indicador_id_idx" ON "indicacoes"("indicador_id");

-- CreateIndex
CREATE INDEX "indicacoes_status_idx" ON "indicacoes"("status");

-- CreateIndex
CREATE INDEX "projetos_company_id_idx" ON "projetos"("company_id");

-- CreateIndex
CREATE INDEX "projetos_status_idx" ON "projetos"("status");

-- CreateIndex
CREATE INDEX "conversations_company_id_idx" ON "conversations"("company_id");

-- CreateIndex
CREATE INDEX "conversations_associado_id_idx" ON "conversations"("associado_id");

-- CreateIndex
CREATE INDEX "conversations_lead_id_idx" ON "conversations"("lead_id");

-- CreateIndex
CREATE INDEX "conversations_assigned_to_id_idx" ON "conversations"("assigned_to_id");

-- CreateIndex
CREATE INDEX "conversations_status_idx" ON "conversations"("status");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE INDEX "ai_agents_company_id_idx" ON "ai_agents"("company_id");

-- CreateIndex
CREATE INDEX "ai_agents_agent_id_idx" ON "ai_agents"("agent_id");

-- CreateIndex
CREATE INDEX "knowledge_bases_company_id_idx" ON "knowledge_bases"("company_id");

-- CreateIndex
CREATE INDEX "knowledge_documents_knowledge_base_id_idx" ON "knowledge_documents"("knowledge_base_id");

-- CreateIndex
CREATE INDEX "automacoes_company_id_idx" ON "automacoes"("company_id");

-- CreateIndex
CREATE INDEX "audit_logs_company_id_idx" ON "audit_logs"("company_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_resource_resource_id_idx" ON "audit_logs"("resource", "resource_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "pipes_company_id_idx" ON "pipes"("company_id");

-- CreateIndex
CREATE INDEX "phases_pipe_id_position_idx" ON "phases"("pipe_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "field_definitions_pipe_id_name_key" ON "field_definitions"("pipe_id", "name");

-- CreateIndex
CREATE INDEX "cards_company_id_pipe_id_idx" ON "cards"("company_id", "pipe_id");

-- CreateIndex
CREATE INDEX "cards_current_phase_id_idx" ON "cards"("current_phase_id");

-- CreateIndex
CREATE INDEX "cards_status_idx" ON "cards"("status");

-- CreateIndex
CREATE UNIQUE INDEX "card_field_values_card_id_field_definition_id_key" ON "card_field_values"("card_id", "field_definition_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "associados" ADD CONSTRAINT "associados_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "associados" ADD CONSTRAINT "associados_indicado_por_id_fkey" FOREIGN KEY ("indicado_por_id") REFERENCES "associados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "associados" ADD CONSTRAINT "associados_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotacoes" ADD CONSTRAINT "cotacoes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotacoes" ADD CONSTRAINT "cotacoes_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotacoes" ADD CONSTRAINT "cotacoes_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinistros" ADD CONSTRAINT "sinistros_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinistros" ADD CONSTRAINT "sinistros_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinistros" ADD CONSTRAINT "sinistros_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinistros" ADD CONSTRAINT "sinistros_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficinas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinistros" ADD CONSTRAINT "sinistros_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oficinas" ADD CONSTRAINT "oficinas_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vistorias" ADD CONSTRAINT "vistorias_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vistorias" ADD CONSTRAINT "vistorias_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vistorias" ADD CONSTRAINT "vistorias_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vistorias" ADD CONSTRAINT "vistorias_vistoriador_id_fkey" FOREIGN KEY ("vistoriador_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletos" ADD CONSTRAINT "boletos_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletos" ADD CONSTRAINT "boletos_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nps_surveys" ADD CONSTRAINT "nps_surveys_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nps_surveys" ADD CONSTRAINT "nps_surveys_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicacoes" ADD CONSTRAINT "indicacoes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicacoes" ADD CONSTRAINT "indicacoes_indicador_id_fkey" FOREIGN KEY ("indicador_id") REFERENCES "associados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicacoes" ADD CONSTRAINT "indicacoes_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicacoes" ADD CONSTRAINT "indicacoes_associado_resultante_id_fkey" FOREIGN KEY ("associado_resultante_id") REFERENCES "associados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_associado_id_fkey" FOREIGN KEY ("associado_id") REFERENCES "associados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_agents" ADD CONSTRAINT "ai_agents_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_agents" ADD CONSTRAINT "ai_agents_knowledge_base_id_fkey" FOREIGN KEY ("knowledge_base_id") REFERENCES "knowledge_bases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_knowledge_base_id_fkey" FOREIGN KEY ("knowledge_base_id") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automacoes" ADD CONSTRAINT "automacoes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipes" ADD CONSTRAINT "pipes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phases" ADD CONSTRAINT "phases_pipe_id_fkey" FOREIGN KEY ("pipe_id") REFERENCES "pipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_definitions" ADD CONSTRAINT "field_definitions_pipe_id_fkey" FOREIGN KEY ("pipe_id") REFERENCES "pipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_pipe_id_fkey" FOREIGN KEY ("pipe_id") REFERENCES "pipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_current_phase_id_fkey" FOREIGN KEY ("current_phase_id") REFERENCES "phases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_field_values" ADD CONSTRAINT "card_field_values_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_field_values" ADD CONSTRAINT "card_field_values_field_definition_id_fkey" FOREIGN KEY ("field_definition_id") REFERENCES "field_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

