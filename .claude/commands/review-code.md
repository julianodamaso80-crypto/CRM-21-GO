# Review de Código

Faça uma revisão completa do código em: $ARGUMENTS

## Checklist de Review:

### 1. TypeScript
- [ ] Type hints em todas as funções públicas
- [ ] Sem uso de `any` (exceto quando inevitável)
- [ ] Types do `shared/types/` sendo usados
- [ ] Interfaces bem definidas

### 2. React/Frontend
- [ ] Componentes funcionais (sem classes)
- [ ] Hooks no topo do componente
- [ ] Keys únicas em listas
- [ ] useCallback/useMemo onde necessário
- [ ] Sem re-renders desnecessários

### 3. Backend
- [ ] Multi-tenant: filtrando por `companyId`
- [ ] Validações com Zod
- [ ] Erros tratados com `AppError`
- [ ] Logs apropriados
- [ ] Sem dados sensíveis expostos

### 4. Segurança
- [ ] SQL injection protegido (Prisma já faz)
- [ ] XSS protegido
- [ ] RBAC verificado onde necessário
- [ ] Tokens validados
- [ ] Rate limiting ativo

### 5. Performance
- [ ] Queries otimizadas (select apenas necessário)
- [ ] Paginação implementada
- [ ] Índices no banco
- [ ] Lazy loading onde apropriado

### 6. UX/UI
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Feedback visual (toasts)
- [ ] Responsivo

### 7. Padrões do Projeto
- [ ] Estrutura de pastas correta
- [ ] Nomenclatura consistente
- [ ] Seguindo patterns de `contacts/`
- [ ] Código DRY (não repetido)

## Pontos a reportar:
- Bugs encontrados
- Melhorias sugeridas
- Code smells
- Dívidas técnicas
