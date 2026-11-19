# Roteiro de apresentação: Balcão ERP

**Duração alvo:** 10 a 12 minutos · **O que deixar aberto antes de começar:**
1. VS Code com o repositório (abas: `design.md`, `tokens/tokens.json`, `docs/02-prompt-layout.md`, `app/src/components/ui.tsx`)
2. Figma com o arquivo https://www.figma.com/design/Sya7DIvUetwY9emQ7X0zx9 (páginas "00 Fundação" e "01 Telas")
3. Terminal com `cd app && npm run dev` já rodando e o navegador em `http://localhost:5173/login`

> As capturas em [docs/telas/](telas/) servem de plano B se algo falhar ao vivo.

---

## 1. Abertura e problema (1 min)
**Mostrar:** a tela de login.

**Falar:**
> "O Balcão ERP é um sistema de gestão para comércio de bairro, como mercadinho, papelaria ou loja de roupas. Hoje esses donos controlam estoque e vendas em caderno ou em planilha. Por isso não sabem o que está acabando, quanto venderam no mês nem quem vendeu o quê. O sistema junta estoque, caixa, clientes e usuários num painel simples, pensado para quem não é da área de tecnologia."

## 2. O método: visão geral (1 min)
**Mostrar:** a tabela "Método" do [README.md](../README.md).

**Falar:**
> "Usei o Claude Code dentro do VS Code como agente. O fluxo teve quatro etapas: especificação, protótipo em código, Figma via MCP e validação por capturas de tela. A regra que segui foi dar contexto uma vez só: tudo parte de um único arquivo, o `design.md`. Tanto o código quanto o Figma saíram dele, e por isso batem entre si."

## 3. Especificação: design.md (2 min)
**Mostrar:** o `design.md`, rolando pelas três seções.

- **Básico:** nome, finalidade, tabela de requisitos de usuário (RU01–RU07) e funcionais (RF01–RF13), e os 3 perfis com faixa etária.
- **Técnico:** desktop first (1440×1024); primária verde-petróleo `#0F766E`, secundária ardósia `#1E293B`, terciária âmbar `#F59E0B`; escala tipográfica Inter (32/24/20/16/14/13/12); espaçamento base 4 px; grid de 12 colunas.
- **Específico:** banco de dados (entidades), dispositivo preferencial e arquitetura React + Vite + Tailwind.

**Falar:**
> "Antes de gerar qualquer coisa, a IA me fez três perguntas (o projeto, a stack e o caminho do layout) e eu respondi tudo de uma vez. Isso evitou idas e vindas: o `design.md` saiu num único prompt."

## 4. Figma via MCP (2 min)
**Mostrar:** o arquivo [Balcão ERP no Figma](https://www.figma.com/design/Sya7DIvUetwY9emQ7X0zx9):
1. *Local variables*: coleções Color, Spacing, Radius e Size, com os mesmos nomes do `design.md`.
2. Página "00 Fundação": ícones, Button (12 variantes), Badge, Input, Checkbox, Avatar, SidebarItem, Sidebar, Topbar e KpiCard.
3. Página "01 Telas": as 9 telas.

**Falar:**
> "Conectei o Claude ao Figma pelo MCP oficial. Com o `design.md` como contexto, ele criou no Figma as variáveis, os estilos de texto e sombra, os componentes com variantes e propriedades e depois as 9 telas. Tudo foi feito com instâncias dos componentes e em Auto Layout. Nenhuma cor ou espaçamento ficou solto: tudo está ligado a uma variável. A cada tela ele tirava uma captura para conferir e corrigia o que saía errado, como a área do gráfico, que saiu sólida, e a grade de pagamento do PDV."

**Destacar:** selecione uma tela (por exemplo, "T03 Painel principal") e mostre no painel direito o Auto Layout e as variáveis aplicadas. Depois clique num botão: é uma instância de `Button` com as propriedades Style, Size e Label. Esses são os requisitos obrigatórios.

**Se perguntarem do modo escuro no Figma:** o plano gratuito do Figma permite só 1 modo por coleção. Por isso o tema escuro existe no código, mas não no Figma.

## 5. Do design ao código (1 min)
**Mostrar:** [tailwind.config.js](../app/tailwind.config.js) e [tokens.css](../app/src/styles/tokens.css) lado a lado.

**Falar:**
> "No código, os mesmos tokens viram CSS variables e entram no Tailwind. Quando escrevo `bg-primary-600` ou `text-h1`, uso exatamente o token do Figma. Até o modo escuro é só uma troca de valores das variáveis. Os componentes ficam todos em um arquivo, `ui.tsx`, e nenhuma tela usa cor ou tamanho fora dos tokens."

## 6. Demonstração ao vivo (3 min)
Siga esta ordem, que conta a história de um dia na loja:

| # | Ação | O que apontar |
|---|---|---|
| 1 | Login: clicar em **Admin** nas contas de demonstração → Entrar | RF01: login, "lembrar-me", "esqueci a senha" |
| 2 | **Painel** | KPIs, gráfico 7/30 dias, top 5, últimas vendas, card de estoque baixo (RF03, RF04) |
| 3 | **Nova venda**: digitar "arroz" + Enter, "café" + Enter; escolher cliente e Pix → **Finalizar** | PDV rápido pelo teclado; o estoque do café cai de 4 para 3 (RF07, RF08) |
| 4 | **Vendas**: clicar na venda recém-criada → **Cancelar venda** | Detalhe e cancelamento com devolução ao estoque (RF09) |
| 5 | **Produtos**: filtrar "Estoque baixo" → editar o Café, estoque 30 → salvar | O badge na barra lateral diminui (RF05, RF06, RF13) |
| 6 | Alternar o **tema escuro** pelo ícone da lua | Tokens também no modo escuro |
| 7 | Sair e entrar como **Vendedor** (Júlia) → digitar `/usuarios` na URL | Menu reduzido e "Acesso restrito" (RF02) |

## 7. Resultado e tempo (1 min)
**Mostrar:** a tabela de [registro.md](registro.md), já preenchida.

**Falar:**
> "Resultado: 9 telas, 13 requisitos funcionais, controle de acesso por perfil e modo claro/escuro. Do zero, eu estimaria [X] horas só no código e [Y] no layout. Com a IA e o MCP, levei [Z]. O ganho maior não foi digitar menos. Foi não precisar retrabalhar, porque o contexto estava todo no `design.md`."

## 8. Aprendizados e próximos passos (30 s)
- **O que funcionou:** decidir tudo antes de gerar; uma tela por prompt; pedir "liste as divergências" em vez de "refaça".
- **O que ajustei manualmente:** filtros que empilhavam, nomes cortados no carrinho e altura do gráfico. Encontrei esses problemas comparando as capturas de tela.
- **Próximos passos:** API Node + PostgreSQL no lugar do localStorage (a camada `services/` já está isolada para isso) e emissão de NFC-e.

---

## Perguntas prováveis (cola rápida)
- **"Os dados são reais?"** São dados de exemplo gerados com semente fixa e salvos no navegador. Dá para restaurar em *Perfil → Restaurar dados de exemplo*.
- **"Tem banco de dados?"** No protótipo, `localStorage`, atrás de uma camada de serviço. O modelo relacional está no `design.md`, seção 3.
- **"Por que React e não HTML puro?"** São 9 telas com componentes repetidos (tabela, modal, badge). Componentizar com tokens deixou tudo consistente com o Figma.
- **"A IA fez tudo sozinha?"** Ela gerou a especificação, os layouts e o código a partir do meu contexto. Eu decidi o escopo, revisei cada tela por captura e pedi ajustes pontuais.
