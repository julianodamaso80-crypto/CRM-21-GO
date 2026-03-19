# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- Estrutura completa do monorepo (backend, frontend, shared, docker, docs)
- Schema Prisma completo com 37 tabelas
- Sistema de autenticação JWT + Refresh Token (estrutura)
- Sistema RBAC com roles e permissions
- Middlewares de autenticação e autorização
- Error handling global
- Logs estruturados com Pino
- Validação de environment variables com Zod
- Configuração Docker Compose completa
- Frontend React + Vite + TypeScript + TailwindCSS
- State management com Zustand
- React Query para cache de API
- Layouts e páginas placeholder
- Types TypeScript compartilhados
- Documentação completa (README, ARCHITECTURE, GETTING_STARTED, ROADMAP)
- Sistema de multi-tenancy por company_id
- Audit log para todas as entidades
- Sistema de planos (Free, Pro, Enterprise)

## [0.1.0] - 2025-01-21

### Added
- Inicialização do projeto
- Setup inicial da arquitetura
