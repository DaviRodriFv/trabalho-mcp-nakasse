# Etapa 1: Conectar o Claude ao Figma (MCP)

> **O que foi usado de fato (19/11/2026):** apenas o servidor `figma` (oficial), com login OAuth via `/mcp`. Ele também **cria** no canvas (`use_figma`), então o plugin Talk to Figma, o Bun e o socket ficaram como alternativa e não foram necessários.
> Arquivo gerado: https://www.figma.com/design/Sya7DIvUetwY9emQ7X0zx9
> Limite do plano gratuito (Starter): 1 modo por coleção de variáveis, por isso o Figma não tem o modo escuro.

Dois servidores MCP, já configurados em [.mcp.json](../.mcp.json):

| Servidor | Para quê | Requisitos |
|---|---|---|
| `figma` (oficial, nuvem) | **Ler** o layout (estrutura, variáveis, screenshot) e gerar/comparar código | Conta Figma + login OAuth |
| `TalkToFigma` (comunidade) | **Criar e editar** telas no canvas pela IA | Figma Desktop + plugin + socket ([iniciar-figma-socket.cmd](../iniciar-figma-socket.cmd)) |

## Já feito
- `.mcp.json` com os dois servidores.
- Bun 1.2.21 instalado (necessário para o socket).
- Plugin baixado em `C:\Users\a949554\Documents\GitHub\talk-to-figma\src\cursor_mcp_plugin\manifest.json`.
- Atalho `iniciar-figma-socket.cmd` na raiz do projeto.

## Passo a passo (sua parte)
1. Instale o **Figma Desktop**: figma.com/downloads. Entre com sua conta.
2. No VS Code: `Ctrl+Shift+P` → **Developer: Reload Window**. Quando o Claude perguntar se confia nos servidores do `.mcp.json`, aprove.
3. No chat do Claude, digite `/mcp` → selecione **figma** → **Authenticate** → faça login no navegador e permita o acesso.
4. Dê dois cliques em **`iniciar-figma-socket.cmd`** e deixe a janela aberta.
5. No Figma Desktop, crie um arquivo de design "Balcão ERP". Depois vá em **Menu → Plugins → Development → Import plugin from manifest…** e escolha o `manifest.json` acima.
6. Rode o plugin: **Plugins → Development → Cursor MCP Plugin** → **Connect**. Copie o **channel** que aparece.
7. Importe os tokens: instale o plugin **Tokens Studio for Figma** (Community). Depois vá em **Tools → Load from file → `tokens/tokens.json`** → **Styles & Variables → Export to Figma** (marque Variables).
8. No chat, mande: *"channel: XXXX — rode o Prompt 0 de docs/02-prompt-layout.md"*.

## Problemas comuns
- **`/mcp` não lista os servidores:** confirme que o VS Code está aberto na pasta `trabalho-mcp-nakasse` e recarregue a janela.
- **O plugin não conecta:** a janela do socket (passo 4) precisa estar aberta. Também confira se a porta no plugin é 3055.
- **Erro de permissão no login do Figma:** o MCP oficial pode exigir um plano/seat específico. Veja help.figma.com → "Figma MCP server". O `TalkToFigma` não depende disso.

## Dicas para economizar requisições
- Gere **um frame por vez** e revise antes de seguir.
- Passe o **link do nó** (botão direito → *Copy link to selection*) em vez de pedir uma busca no arquivo inteiro.
- O `design.md` é o contexto fixo: não repita especificações no chat.
