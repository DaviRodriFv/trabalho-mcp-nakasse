# Registro do processo (para a apresentação)

Anote cada etapa ao fazê-la: serve de roteiro para mostrar o método e comparar o tempo gasto.

| Data | Etapa | Ferramenta/IA | Nº de prompts | Tempo | Observações (o que funcionou / o que ajustei) |
|---|---|---|---|---|---|
| 19/11/2026 | Especificação (design.md) + tokens + guias | Claude Code (Opus) | 1 | | Escolhas feitas no início (projeto, stack, layout), sem idas e vindas |
| 19/11/2026 | App completo (9 telas, tokens → Tailwind, dados de exemplo) | Claude Code (Opus) | 1 | | Gerado a partir do design.md; build sem erros |
| 19/11/2026 | Validação visual por capturas (navegador automatizado) | Claude Code | (mesmo prompt) | | 3 ajustes: filtros empilhados, nomes cortados no carrinho, altura do gráfico |
| 19/11/2026 | Setup Figma MCP (`.mcp.json` + login OAuth) | Claude Code + MCP oficial do Figma | 1 | | O plugin "Talk to Figma" não foi necessário: o MCP oficial já cria no canvas |
| 19/11/2026 | Fundação no Figma: 42 variáveis, 10 estilos de texto, 3 sombras, 30 ícones, 10 componentes | Claude Code + Figma MCP | (mesmo prompt) | | Plano gratuito limita a 1 modo: o modo escuro ficou só no código |
| 19/11/2026 | 9 telas no Figma (Auto Layout + instâncias + variáveis) | Claude Code + Figma MCP | (mesmo prompt) | | 4 correções por captura: nome do ícone trocado, select dentro de instância, opacidade do gráfico, grade de pagamento |

## Estimativa: do zero vs. com IA
| Etapa | Do zero (estimado) | Com IA (real) |
|---|---|---|
| Especificação | | |
| Layout | | |
| Código | | |
| **Total** | | |

## Estratégias de economia de contexto usadas
- `design.md` único como fonte de verdade, referenciado com `@design.md` em vez de colado em cada prompt.
- Decisões tomadas antes de gerar (sem retrabalho).
- Um frame/tela por prompt; links de nó do Figma em vez de buscas no arquivo inteiro.
- Pedidos de "liste divergências" no lugar de reescritas completas.
