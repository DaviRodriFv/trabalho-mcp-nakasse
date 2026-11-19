# Balcão ERP — Especificação de Projeto (design.md)

> Documento-fonte de contexto para a IA. Usado nas 3 etapas: **layout (Figma)**, **leitura via MCP** e **protótipo (código)**.
> Se a ferramenta não lê `.md`, cole este arquivo inteiro no chat.

---

## 1. Básico

### 1.1 Nome
**Balcão ERP**: gestão simples para o comércio de bairro.

### 1.2 Finalidade (problema que resolve)
Pequenos comércios (mercadinhos, lojas de roupas, papelarias, autopeças) controlam estoque e vendas em caderno ou em planilhas soltas. Por isso:
- não sabem o que está acabando até faltar na prateleira;
- não sabem quanto venderam ou lucraram no dia ou no mês;
- não têm histórico de clientes nem controle de quem fez cada venda.

O Balcão ERP junta **estoque, vendas, clientes e usuários** num painel único e fácil, pensado para quem não é da área de tecnologia.

### 1.3 Funções

**Requisitos de usuário (RU)**
| ID | Como… | quero… | para… |
|---|---|---|---|
| RU01 | dono | ver no painel o faturamento do dia e do mês | acompanhar o negócio rapidamente |
| RU02 | dono/gerente | ser avisado de produtos com estoque baixo | repor antes de faltar |
| RU03 | vendedor | registrar uma venda em poucos cliques | atender rápido no balcão |
| RU04 | gerente | cadastrar e editar produtos | manter o catálogo atualizado |
| RU05 | vendedor | cadastrar/buscar clientes | vincular a venda ao cliente |
| RU06 | dono | criar usuários com perfis diferentes | limitar o que cada funcionário acessa |
| RU07 | qualquer usuário | entrar com e-mail e senha | proteger os dados da loja |

**Requisitos funcionais (RF)**
| ID | Requisito |
|---|---|
| RF01 | Autenticação por e-mail/senha, com "lembrar-me" e "esqueci a senha" |
| RF02 | Controle de acesso por perfil: **Admin**, **Gerente**, **Vendedor** |
| RF03 | Painel com KPIs: vendas hoje, faturamento do mês, ticket médio, itens com estoque baixo |
| RF04 | Gráfico de vendas dos últimos 7 / 30 dias e ranking dos 5 produtos mais vendidos |
| RF05 | CRUD de produtos (nome, SKU, categoria, preço de custo, preço de venda, estoque, estoque mínimo) |
| RF06 | Busca, filtro por categoria/status e paginação nas listas |
| RF07 | Ponto de venda (PDV): buscar produto, adicionar ao carrinho, desconto, forma de pagamento, finalizar |
| RF08 | Baixa automática de estoque ao finalizar a venda |
| RF09 | Histórico de vendas com detalhe e cancelamento (Admin/Gerente) |
| RF10 | CRUD de clientes (nome, CPF, telefone, e-mail) com histórico de compras |
| RF11 | CRUD de usuários (somente Admin), com ativar/desativar |
| RF12 | Tela de perfil: alterar nome, senha e tema (claro/escuro) |
| RF13 | Feedback visual: toasts de sucesso/erro, estados vazios e de carregamento |

### 1.4 Usuário
| Perfil | Quem é | Faixa etária | Familiaridade com tecnologia | Uso |
|---|---|---|---|---|
| **Admin** | dono(a) da loja | 30–60 | baixa a média | painel, relatórios, usuários |
| **Gerente** | encarregado(a) | 25–50 | média | produtos, estoque, vendas |
| **Vendedor** | atendente/caixa | 18–40 | média | PDV e clientes |

Público: micro e pequenas empresas (MEI, ME) do varejo, com 1 a 15 funcionários.
Diretrizes resultantes: textos claros, sem jargão, botões grandes, números legíveis e ações principais sempre visíveis.

---

## 2. Técnico

### 2.1 Abordagem
**Desktop first.** Frame base **1440 × 1024**. Deve funcionar bem de 1280 px a 1920 px e se adaptar a tablet (≥ 768 px), com a sidebar recolhida. O celular não é alvo do MVP.

### 2.2 Cores (tokens)
| Token | Hex | Uso |
|---|---|---|
| `color/primary/600` **Primária** | `#0F766E` | botões principais, links, item ativo, gráficos |
| `color/primary/700` | `#115E59` | hover da primária |
| `color/primary/50` | `#F0FDFA` | fundo de destaque/selecionado |
| `color/secondary/900` **Secundária** | `#1E293B` | sidebar, títulos |
| `color/secondary/800` | `#334155` | hover na sidebar |
| `color/tertiary/500` **Terciária** | `#F59E0B` | alertas de estoque, badges, destaques |
| `color/tertiary/50` | `#FFFBEB` | fundo de alerta |
| `color/neutral/0` | `#FFFFFF` | superfícies (cards, modais) |
| `color/neutral/50` | `#F8FAFC` | fundo da aplicação |
| `color/neutral/200` | `#E2E8F0` | bordas e divisores |
| `color/neutral/500` | `#64748B` | texto secundário, placeholders |
| `color/neutral/900` | `#0F172A` | texto principal |
| `color/success` | `#16A34A` | sucesso, "em estoque", variação positiva |
| `color/danger` | `#DC2626` | erro, excluir, "sem estoque" |
| `color/info` | `#2563EB` | informação |

Contraste: texto principal sobre `neutral/0` e branco sobre `primary/600` ≥ 4.5:1 (WCAG AA).
Modo escuro (opcional): fundo `#0B1220`, superfície `#111827`, borda `#1F2937`, texto `#E5E7EB`, primária `#14B8A6`.

### 2.3 Tipografia
Fonte: **Inter** (Google Fonts). Números com `font-variant-numeric: tabular-nums`.

| Token | Tamanho / Altura de linha | Peso | Uso |
|---|---|---|---|
| `text/display` | 32 / 40 | 700 | valor dos KPIs |
| `text/h1` | 24 / 32 | 600 | título da página |
| `text/h2` | 20 / 28 | 600 | título de card/modal |
| `text/h3` | 16 / 24 | 600 | subtítulos e cabeçalho de seção |
| `text/body-lg` | 16 / 24 | 400 | textos de destaque, login |
| `text/body` | 14 / 20 | 400 | texto padrão, células de tabela |
| `text/label` | 13 / 16 | 500 | rótulos de campo, botões, cabeçalho de tabela |
| `text/caption` | 12 / 16 | 400 | legendas, metadados, badges |

### 2.4 Espaçamentos e grid
- **Base 4 px.** Escala: `space/1`=4, `2`=8, `3`=12, `4`=16, `5`=20, `6`=24, `8`=32, `10`=40, `12`=48, `16`=64.
- **Raios:** `radius/sm`=4 (badges), `radius/md`=8 (inputs, botões), `radius/lg`=12 (cards, modais), `radius/full`=9999 (avatar, pill).
- **Sombras:** `shadow/sm` = 0 1 2 rgba(15,23,42,.06); `shadow/md` = 0 4 12 rgba(15,23,42,.08); `shadow/lg` = 0 12 32 rgba(15,23,42,.12) (modais).
- **Layout da aplicação:**
  - Sidebar fixa **240 px** (recolhida: 72 px), padding 16.
  - Header (topbar) **64 px**, padding horizontal 32.
  - Área de conteúdo: padding **32**, largura máx. 1200, grid de **12 colunas** com gutter **24**.
  - Gap entre cards: 24. Padding interno de card: 24.
- **Componentes:**
  - Botão: altura 40 (sm 32, lg 48), padding horizontal 16, gap ícone–texto 8.
  - Input: altura 40, padding 12, borda 1 px `neutral/200`, foco com anel 2 px `primary/600`.
  - Linha de tabela: altura 52, padding de célula 16 horizontal.
  - Ícones: Lucide, 20 px (16 em botões sm).

### 2.5 Componentes (biblioteca no Figma, todos em Auto Layout + variantes)
`Button` (primary | secondary | ghost | danger × sm | md | lg × default | hover | disabled) ·
`Input` (default | focus | error | disabled, com/sem ícone) · `Select` · `Checkbox` · `Badge` (success | warning | danger | neutral) ·
`KpiCard` · `Card` · `Table` + `TableRow` · `Pagination` · `SidebarItem` (default | active | hover) · `Topbar` ·
`Modal` · `Toast` (success | error) · `EmptyState` · `Avatar`.

### 2.6 Telas
| # | Tela | Perfis | Conteúdo principal |
|---|---|---|---|
| T01 | **Login** | todos | split: ilustração/marca à esquerda (secondary/900) e formulário à direita |
| T02 | Recuperar senha | todos | campo de e-mail + mensagem de confirmação |
| T03 | **Painel principal** | todos (dados conforme perfil) | 4 KpiCards · gráfico de vendas (8 col) · top 5 produtos (4 col) · tabela de últimas vendas · card de estoque baixo |
| T04 | Produtos | Admin, Gerente | tabela com busca/filtros/paginação + modal de criar/editar |
| T05 | PDV / Nova venda | todos | busca de produto à esquerda (8 col) · carrinho e total à direita (4 col) |
| T06 | Histórico de vendas | todos (cancelar: Admin/Gerente) | tabela + painel de detalhe |
| T07 | Clientes | todos | tabela + modal + histórico de compras |
| T08 | Usuários | Admin | tabela com perfil, status e ações |
| T09 | Perfil / Configurações | todos | dados do usuário, troca de senha, tema |

### 2.7 Exemplos (dados fictícios para mocks)
- Loja: **"Mercadinho Bom Preço"**.
- KPIs: Vendas hoje **R$ 1.284,50** (+12% vs. ontem) · Faturamento do mês **R$ 38.920,00** · Ticket médio **R$ 42,80** · Estoque baixo **7 itens**.
- Produtos: "Arroz Tipo 1 5kg" (SKU ARZ-005, R$ 27,90, estoque 34) · "Café Torrado 500g" (CAF-500, R$ 18,49, estoque 4 ⚠) · "Detergente 500ml" (DET-500, R$ 2,79, estoque 0 ✖).
- Usuários: Ana Souza (Admin), Carlos Lima (Gerente), Júlia Rocha (Vendedor).

Exemplo de KpiCard:
```
┌──────────────────────────────┐  card: neutral/0, radius/lg, padding 24, shadow/sm
│ [ícone 20]  Vendas hoje      │  label: text/label, neutral/500
│ R$ 1.284,50                  │  valor: text/display, neutral/900
│ ▲ 12% vs. ontem              │  caption: success
└──────────────────────────────┘
```

---

## 3. Específico

| Item | Definição |
|---|---|
| **Usa banco de dados?** | Sim, no produto final (relacional). No **protótipo**, os dados ficam em mocks persistidos em `localStorage`, atrás de uma camada `services/` que pode ser trocada por uma API sem mexer nas telas. |
| **Entidades** | `usuarios`(id, nome, email, senha_hash, perfil, ativo) · `categorias`(id, nome) · `produtos`(id, sku, nome, categoria_id, custo, preco, estoque, estoque_min) · `clientes`(id, nome, cpf, telefone, email) · `vendas`(id, data, usuario_id, cliente_id, desconto, total, pagamento, status) · `itens_venda`(venda_id, produto_id, qtd, preco_unit) |
| **Dispositivo preferencial** | Desktop/notebook no balcão (1366–1920 px), com mouse e teclado. Também funciona em tablet. |
| **Arquitetura** | **React 18 + Vite + TypeScript + Tailwind CSS**, React Router, Recharts (gráficos), Lucide (ícones). Tokens do Figma → `tailwind.config` / CSS variables. |
| **Estrutura de pastas** | `src/components` (UI reutilizável) · `src/pages` (telas) · `src/layouts` (AppLayout com sidebar/topbar) · `src/services` (dados mock) · `src/contexts` (Auth) · `src/styles/tokens.css` |
| **Futuro (fora do MVP)** | API Node/Express + PostgreSQL, emissão de NFC-e, relatórios em PDF. |
