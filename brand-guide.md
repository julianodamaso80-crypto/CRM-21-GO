# 21Go Brand Guide

Documento de referencia para toda decisao visual, verbal e de produto da 21Go.
Aplicavel ao CRM, site, landing pages, materiais de comunicacao e agentes de IA.

---

## 1. Essencia da Marca

### Proposito
Democratizar a protecao veicular no Rio de Janeiro atraves do mutualismo, onde todos protegem todos.

### Valores
- **Confianca** -- 20+ anos de mercado, transparencia total
- **Mutualismo** -- forca coletiva, quanto mais associados melhor para todos
- **Acessibilidade** -- sem analise de perfil, sem restricao de condutor
- **Agilidade** -- processos rapidos, atendimento 24h, tecnologia a servico do associado

### Personalidade da Marca
| Atributo      | Descricao                                    |
|---------------|----------------------------------------------|
| Tom           | Confiante, direto, protetor                  |
| Registro      | Profissional mas acessivel                   |
| Energia       | Segura e resolutiva                          |
| Posicionamento| Premium popular -- qualidade alta, preco justo|

### Slogan
**"Nao conte com a sorte, conte com a 21Go!"**

### Brand Gap (Neumeier)
A diferenciacao da 21Go esta no cruzamento de **tradicao** (20+ anos) com **tecnologia** (CRM + IA). O gap entre estrategia e experiencia e fechado por: atendimento humano potencializado por 10 agentes de IA, interface premium que transmite solidez, e comunicacao que simplifica o complexo mundo da protecao veicular.

### Identity System (Wheeler)
O sistema de identidade e coeso e escalavel:
- **Logo**: "21" em quadrado dourado arredondado + "Go!" -- compacto, memoravel
- **Cor**: dourado quente como assinatura visual unica no segmento
- **Voz**: um unico tom em todos os canais (CRM, WhatsApp, site, agentes IA)
- **Experiencia**: cada touchpoint (do primeiro contato a abertura de sinistro) carrega a mesma identidade

---

## 2. Paleta de Cores

### 2.1 Primary -- Gold (assinatura da marca)

| Token         | Hex       | Uso                                          |
|---------------|-----------|----------------------------------------------|
| `gold-50`     | `#FDF8EC` | Background de highlight sutil                |
| `gold-100`    | `#FBF0D4` | Background de badges e tags                  |
| `gold-200`    | `#F6E0A8` | Bordas de elementos ativos                   |
| `gold-300`    | `#F0CE76` | Icones secundarios, hover states             |
| `gold-400`    | `#D4B455` | Texto de destaque, links hover               |
| `gold-500`    | `#C9A84C` | COR PRINCIPAL -- botoes, headings, logo      |
| `gold-600`    | `#B08F3A` | Botao hover, texto sobre fundo claro         |
| `gold-700`    | `#8E722E` | Texto enfatizado em fundos claros            |
| `gold-800`    | `#6B5522` | Bordas escuras, linhas de separacao          |
| `gold-900`    | `#4A3B18` | Backgrounds profundos com tom dourado        |
| `gold-950`    | `#2D2310` | Backgrounds mais escuros com tom dourado     |

### 2.2 Neutral -- Dark Scale (backgrounds e texto)

| Token         | Hex       | Uso                                          |
|---------------|-----------|----------------------------------------------|
| `dark-50`     | `#E8E8EE` | Texto principal sobre fundo escuro           |
| `dark-100`    | `#C5C5D2` | Texto secundario                             |
| `dark-200`    | `#9D9DB5` | Texto terciario, placeholders               |
| `dark-300`    | `#757598` | Texto desabilitado, icones inativos          |
| `dark-400`    | `#55557A` | Bordas hover                                 |
| `dark-500`    | `#3D3D5C` | Bordas ativas                                |
| `dark-600`    | `#2A2A42` | Background de inputs, dropdowns              |
| `dark-700`    | `#1E1E32` | Background de cards, sidebar                 |
| `dark-800`    | `#141422` | Background de secoes                         |
| `dark-900`    | `#0C0C18` | Background principal da pagina               |
| `dark-950`    | `#08080F` | Background mais profundo (root)              |

### 2.3 Semantic -- Feedback e Status

| Token             | Hex       | Uso                                      |
|-------------------|-----------|------------------------------------------|
| `success`         | `#34D399` | Confirmacoes, status ativo, pagamentos ok|
| `success-subtle`  | `#065F46` | Background de alertas de sucesso         |
| `warning`         | `#FBBF24` | Alertas, vencimentos proximos            |
| `warning-subtle`  | `#78350F` | Background de alertas de atencao         |
| `error`           | `#FB7185` | Erros, inadimplencia, cancelamentos      |
| `error-subtle`    | `#881337` | Background de alertas de erro            |
| `info`            | `#5B8DEF` | Informacoes, links, acoes neutras        |
| `info-subtle`     | `#1E3A5F` | Background de alertas informativos       |

### 2.4 Accent -- Destaques Secundarios

| Token         | Hex       | Uso                                          |
|---------------|-----------|----------------------------------------------|
| `accent-blue`    | `#5B8DEF` | Leads, links, graficos primarios          |
| `accent-purple`  | `#A78BFA` | Agentes IA, automacoes                    |
| `accent-emerald` | `#34D399` | Financeiro positivo, crescimento          |
| `accent-rose`    | `#FB7185` | Sinistros, alertas criticos               |
| `accent-amber`   | `#FBBF24` | MGM, gamificacao, indicacoes              |
| `accent-cyan`    | `#22D3EE` | Operacao, vistorias, rastreamento         |

### 2.5 Backgrounds Compostos

| Nome                  | Valor                                              | Uso                        |
|-----------------------|----------------------------------------------------|----------------------------|
| `gradient-gold`       | `linear-gradient(135deg, #C9A84C, #D4B455, #F0CE76)` | Botoes CTA, headers      |
| `gradient-gold-subtle`| `linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.05))` | Cards highlight |
| `gradient-dark`       | `linear-gradient(180deg, #141422, #0C0C18)`        | Background de pagina       |
| `gradient-card`       | `linear-gradient(135deg, rgba(30,30,50,0.8), rgba(20,20,34,0.9))` | Cards elevados |

---

## 3. Tipografia

### Font Pairing

| Papel         | Fonte         | Fallback                  | Uso                           |
|---------------|---------------|---------------------------|-------------------------------|
| Display       | **Outfit**    | system-ui, sans-serif     | Headings, titulos, numeros KPI|
| Body          | **DM Sans**   | system-ui, sans-serif     | Corpo de texto, labels, UI    |
| Mono          | **JetBrains Mono** | monospace            | Codigo, IDs, placas de veiculo|

### Escala de Tamanhos

| Token   | Tamanho  | Line Height | Uso                              |
|---------|----------|-------------|----------------------------------|
| `xs`    | 0.75rem  | 1rem        | Captions, badges, metadata       |
| `sm`    | 0.875rem | 1.25rem     | Labels, texto secundario         |
| `base`  | 1rem     | 1.5rem      | Corpo de texto padrao            |
| `lg`    | 1.125rem | 1.75rem     | Subtitulos, labels de secao      |
| `xl`    | 1.25rem  | 1.75rem     | Headings de card                 |
| `2xl`   | 1.5rem   | 2rem        | Headings de secao                |
| `3xl`   | 1.875rem | 2.25rem     | Headings de pagina               |
| `4xl`   | 2.25rem  | 2.5rem      | KPI numbers, hero titles         |
| `5xl`   | 3rem     | 1           | Dashboard hero numbers           |

### Pesos

| Peso       | Valor | Uso                                    |
|------------|-------|----------------------------------------|
| Regular    | 400   | Corpo de texto                         |
| Medium     | 500   | Labels, navegacao                      |
| Semibold   | 600   | Subtitulos, botoes                     |
| Bold       | 700   | Headings, KPIs, enfase                 |

---

## 4. Espacamento e Grid

### Escala de Espacamento (base 4px)

| Token | Valor  | Uso                                     |
|-------|--------|-----------------------------------------|
| `1`   | 4px    | Gap minimo entre icone e texto          |
| `2`   | 8px    | Padding interno de badges               |
| `3`   | 12px   | Gap entre elementos inline              |
| `4`   | 16px   | Padding de inputs, gap de grid          |
| `5`   | 20px   | Padding de cards compactos              |
| `6`   | 24px   | Padding padrao de cards e secoes        |
| `8`   | 32px   | Gap entre secoes de formulario          |
| `10`  | 40px   | Margin entre blocos de conteudo         |
| `12`  | 48px   | Padding de pagina (desktop)             |
| `16`  | 64px   | Espacamento entre secoes de pagina      |

### Grid

- **Layout principal**: sidebar fixa (256px) + conteudo fluido
- **Cards grid**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` gap-6
- **Formularios**: max-width 640px, campos full-width
- **Tabelas**: full-width com scroll horizontal em mobile
- **Mobile (operacao)**: padding 16px, botoes min-height 48px

---

## 5. Componentes Base (Atomic Design - Frost)

### Atoms

#### Botoes

| Variante    | Estilo                                               |
|-------------|------------------------------------------------------|
| Primary     | `bg-gradient-gold text-dark-950 font-semibold`       |
| Secondary   | `bg-dark-700 text-dark-50 border border-dark-500`    |
| Ghost       | `bg-transparent text-dark-100 hover:bg-dark-700`     |
| Danger      | `bg-error/10 text-error border border-error/20`      |
| Tamanhos    | `sm` (h-8 px-3), `md` (h-10 px-4), `lg` (h-12 px-6)|
| Border radius | `rounded-lg` (8px)                                |
| Transicao   | `transition-all duration-200 ease-smooth`            |

#### Inputs

| Estado      | Estilo                                               |
|-------------|------------------------------------------------------|
| Default     | `bg-dark-600 border-dark-500 text-dark-50 rounded-lg`|
| Focus       | `border-gold-500 ring-1 ring-gold-500/20`            |
| Error       | `border-error ring-1 ring-error/20`                  |
| Disabled    | `opacity-50 cursor-not-allowed`                      |
| Placeholder | `text-dark-300`                                      |

#### Badges / Tags

| Variante    | Estilo                                               |
|-------------|------------------------------------------------------|
| Gold        | `bg-gold-500/10 text-gold-400 border border-gold-500/20` |
| Success     | `bg-success/10 text-success border border-success/20`    |
| Warning     | `bg-warning/10 text-warning border border-warning/20`    |
| Error       | `bg-error/10 text-error border border-error/20`          |
| Info        | `bg-info/10 text-info border border-info/20`             |
| Neutral     | `bg-dark-600 text-dark-200 border border-dark-500`       |

### Molecules

#### Cards

```
bg-dark-700 border border-dark-500/50 rounded-xl
shadow-card hover:shadow-card-hover
transition-all duration-200
p-6
```

#### Card com Header
```
[Card base]
  > header: border-b border-dark-500/50 pb-4 mb-4
  > title: font-display text-lg font-semibold text-dark-50
  > subtitle: text-sm text-dark-200
```

#### Tabelas

| Parte       | Estilo                                               |
|-------------|------------------------------------------------------|
| Container   | `bg-dark-800 rounded-xl border border-dark-500/50`  |
| Header row  | `bg-dark-700/50 text-xs text-dark-200 uppercase tracking-wider` |
| Body row    | `border-b border-dark-500/30 hover:bg-dark-600/50`  |
| Cell        | `px-4 py-3 text-sm text-dark-100`                   |

### Organisms

#### Sidebar
```
w-64 bg-dark-800 border-r border-dark-500/50
shadow-sidebar
Logo no topo + nav items + user info no rodape
Nav item ativo: bg-gold-500/10 text-gold-400 border-l-2 border-gold-500
Nav item inativo: text-dark-200 hover:text-dark-50 hover:bg-dark-700
```

#### Header de Pagina
```
flex justify-between items-center mb-8
h1: font-display text-2xl font-bold text-dark-50
Breadcrumbs: text-sm text-dark-300
Acoes: botoes alinhados a direita
```

#### Dashboard KPI Card
```
[Card base]
  > Icone em circulo bg-gold-500/10 text-gold-400
  > Valor: font-display text-3xl font-bold text-dark-50
  > Label: text-sm text-dark-200
  > Variacao: text-success (positiva) ou text-error (negativa) + seta
```

---

## 6. Iconografia

### Biblioteca
**Lucide React** -- icones consistentes, finos (stroke 1.5-2px), alinhados com o design system.

### Tamanhos

| Contexto         | Tamanho   | Uso                           |
|------------------|-----------|-------------------------------|
| Inline (texto)   | 16px      | Dentro de botoes, labels      |
| UI padrao        | 20px      | Sidebar, toolbar, acoes       |
| Feature          | 24px      | Headers, cards, destaques     |
| Hero             | 32-48px   | Dashboard KPIs, empty states  |

### Cores de Icones
- **Ativo/destaque**: `text-gold-400`
- **Padrao**: `text-dark-200`
- **Hover**: `text-dark-50`
- **Semantico**: cor do status correspondente (success, error, etc.)

### Icones dos Agentes IA

| Agente       | Icone Lucide    |
|--------------|-----------------|
| 21Go Chief   | `Shield`        |
| Pre-Venda    | `Bot`           |
| Pos-Venda    | `Handshake`     |
| Gestores     | `Brain`         |
| Retencao     | `ShieldCheck`   |
| Crescimento  | `Rocket`        |
| Trafego      | `Target`        |
| Operacao     | `Wrench`        |
| Financeiro   | `DollarSign`    |
| Sinistros    | `AlertTriangle` |

---

## 7. Tom de Voz

### Principios
1. **Direto** -- va ao ponto, sem enrolacao
2. **Humano** -- fale como pessoa, nao como corporacao
3. **Protetor** -- transmita seguranca e cuidado
4. **Acessivel** -- qualquer pessoa entende

### Exemplos

| Contexto                  | Certo                                          | Errado                                         |
|---------------------------|-------------------------------------------------|------------------------------------------------|
| Boas-vindas               | "Bem-vindo a 21Go! Sua protecao comeca agora." | "Prezado(a), informamos que seu cadastro..."   |
| Sinistro aberto           | "Recebemos sua ocorrencia. Vamos resolver."     | "Protocolo #4521 registrado no sistema."       |
| Boleto atrasado           | "Seu boleto venceu. Regularize para manter sua protecao." | "Informamos inadimplencia na fatura ref..." |
| Cotacao                   | "Seu Honda Civic 2020 fica R$189/mes no plano Completo." | "Conforme tabela FIPE vigente, o valor..." |
| Indicacao MGM             | "Indique um amigo e ganhe 10% de desconto!"     | "Programa de indicacao: beneficio de 10%..."   |
| Erro no sistema           | "Algo deu errado. Estamos corrigindo."           | "Erro 500: Internal Server Error"              |
| Agente IA respondendo     | "Oi! Sou o assistente da 21Go. Como posso ajudar?" | "Voce esta interagindo com um agente virtual de IA..." |

### Regras Gerais
- Usar "voce" (nunca "Vossa Senhoria", "V.Sa.", "Prezado")
- Frases curtas (max 2 linhas em mobile)
- Numeros sempre formatados: R$1.234,56 / 12.345 km
- Datas: "15 de marco" (nunca "15/03/2026")
- Sem jargao juridico (associado entende "protecao", nao "mutualizacao de riscos")

---

## 8. Aplicacao no CRM

### Sidebar
- Fundo: `dark-800`
- Logo 21Go no topo com `glow-gold` sutil
- Navegacao agrupada por secao (Vendas, Operacao, Gestao, Config)
- Item ativo: barra dourada na esquerda + fundo `gold-500/10`
- Icones Lucide 20px + label em `DM Sans` medium

### Header
- Fundo: `dark-900` com borda inferior `dark-500/50`
- Breadcrumbs + titulo da pagina a esquerda
- Notificacoes + avatar do usuario a direita
- Barra de busca global centralizada (quando houver)

### Dashboard
- Grid responsivo de KPI cards no topo
- Graficos Recharts com paleta gold + accent
- Listas de atividades recentes em cards compactos
- Alertas e pendencias com badges coloridos

### Formularios
- Labels em `DM Sans` medium, `text-dark-200`
- Inputs com fundo `dark-600`, borda `dark-500`
- Botao primario (gold gradient) a direita
- Validacao inline com mensagem em `text-error`

### Tabelas
- Header fixo com fundo sutil `dark-700/50`
- Rows com hover `dark-600/50`
- Acoes (editar, deletar) no final de cada row
- Paginacao com design compacto

### Mobile (Operacao)
- Bottom navigation em vez de sidebar
- Cards empilhados full-width
- Botoes de acao com min 48px de altura
- Upload de foto com camera nativa
- Status com badges grandes e coloridos

---

## 9. Sombras e Elevacao

| Token           | Valor                                              | Uso                    |
|-----------------|----------------------------------------------------|------------------------|
| `glow-gold`     | `0 0 20px rgba(201,168,76,0.15)`                  | Logo, elementos marca  |
| `glow-gold-lg`  | `0 0 40px rgba(201,168,76,0.2)`                   | Hover em CTAs          |
| `glass`         | `0 8px 32px rgba(0,0,0,0.3)`                      | Modais, drawers        |
| `glass-lg`      | `0 16px 48px rgba(0,0,0,0.4)`                     | Overlays grandes       |
| `card`          | `0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)` | Cards em repouso |
| `card-hover`    | `0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)` | Cards em hover   |
| `sidebar`       | `4px 0 24px rgba(0,0,0,0.3)`                      | Sidebar fixa           |

---

## 10. Animacoes e Micro-Interacoes

| Animacao          | Duracao  | Uso                                  |
|-------------------|----------|--------------------------------------|
| `fade-in`         | 500ms    | Entrada de pagina                    |
| `fade-in-up`      | 500ms    | Cards e secoes aparecendo            |
| `fade-in-down`    | 300ms    | Dropdowns, tooltips                  |
| `slide-in-left`   | 300ms    | Sidebar, drawers                     |
| `slide-in-right`  | 300ms    | Drawers laterais                     |
| `scale-in`        | 200ms    | Modais, popovers                     |
| `glow-pulse`      | 2s loop  | Elementos que pedem atencao          |
| `shimmer`         | 2s loop  | Loading skeletons                    |
| `stagger-1..5`    | 500ms+   | Listas aparecendo sequencialmente    |

### Principios de Animacao
- Easing padrao: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-smooth)
- Nunca bloquear interacao durante animacao
- Respeitar `prefers-reduced-motion` do sistema
- Mobile: reduzir duracoes em 30%

---

## 11. Acessibilidade

- Contraste minimo 4.5:1 para texto (WCAG AA)
- Dourado `#C9A84C` sobre `#08080F` = ratio 7.2:1 (passa AAA)
- Branco `#E8E8EE` sobre `#141422` = ratio 11.8:1 (passa AAA)
- Focus visible em todos os elementos interativos
- Aria labels em icones sem texto
- Teclado: Tab navega, Enter/Space ativa, Escape fecha
