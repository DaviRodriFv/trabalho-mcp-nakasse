# Balcão ERP: prototipação rápida com IA + MCP

ERP simples para pequenos comércios (estoque, vendas/PDV, clientes e usuários), feito como exercício de prototipação com IA e MCP.

## Método (passo a passo)

| # | Etapa | Ferramenta | Arquivo |
|---|---|---|---|
| 1 | Especificação (básico, técnico, específico) | Claude Code | [design.md](design.md) |
| 2 | Tokens de design | JSON → Tokens Studio → Figma Variables | [tokens/tokens.json](tokens/tokens.json) |
| 3 | Configuração dos MCPs | Talk to Figma MCP + Figma MCP oficial | [docs/01-figma-mcp-setup.md](docs/01-figma-mcp-setup.md) |
| 4 | Layout no Figma (Auto Layout + variáveis) | Claude Code + MCP | [docs/02-prompt-layout.md](docs/02-prompt-layout.md) |
| 5 | Protótipo em código | Claude Code + Figma MCP → React/Vite/Tailwind | [docs/03-prompt-prototipo.md](docs/03-prompt-prototipo.md) |
| 6 | Registro para a apresentação | — | [docs/registro.md](docs/registro.md) |

## Como rodar
```bash
cd app
npm install
npm run dev      # http://localhost:5173
```
Contas de demonstração (também aparecem na tela de login):

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | ana@bompreco.com | admin123 |
| Gerente | carlos@bompreco.com | gerente123 |
| Vendedor | julia@bompreco.com | vendedor123 |

**Figma:** https://www.figma.com/design/Sya7DIvUetwY9emQ7X0zx9 (página "00 Fundação" com variáveis e componentes; página "01 Telas" com as 9 telas)

**Apresentação:** [docs/Balcao-ERP-apresentacao.pptx](docs/Balcao-ERP-apresentacao.pptx) (12 slides, com falas nas anotações do apresentador)

Capturas das telas: [docs/telas/](docs/telas/) · Roteiro da apresentação: [docs/roteiro-apresentacao.md](docs/roteiro-apresentacao.md)

## Stack
React 18 · Vite · TypeScript · Tailwind CSS · React Router · Recharts · Lucide. Dados mock em localStorage (camada `services/` trocável por uma API).
