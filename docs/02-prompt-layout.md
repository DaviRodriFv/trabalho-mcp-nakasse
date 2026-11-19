# Etapa 2: Prompt de LAYOUT (Figma via MCP)

Use em sessões curtas: **1 prompt de fundação + 1 prompt por tela**. Assim cada alteração fica barata.

---

## Prompt 0: Fundação (variáveis e componentes)

```
Contexto: leia @design.md (Balcão ERP). Você está conectado ao Figma pelo MCP TalkToFigma (channel: <COLE_O_CHANNEL>).

Tarefa: crie a página "00 Fundação" contendo:
1. Se as variáveis ainda não existirem, as coleções color, space, radius e size, com os nomes e valores exatos da seção 2.2 e 2.4.
2. Os estilos de texto da seção 2.3 (fonte Inter).
3. Os componentes da seção 2.5, TODOS em Auto Layout, ligados às variáveis (nada de valores soltos),
   com as variantes listadas. Organize-os em um frame "Componentes" com gap 48.

Regras: use apenas os tokens do design.md; nomeie camadas em inglês e de forma semântica (Button/Primary/md).
Ao final, liste o que foi criado e o que não foi possível criar.
```

## Prompt 1..N: Uma tela por vez

```
Contexto: @design.md. Use somente as instâncias de componentes e as variáveis da página "00 Fundação".

Crie na página "01 Telas" o frame "<T03 Painel principal>" de 1440×1024, seguindo a linha <T03> da tabela 2.6:
- Estrutura: Sidebar (240) | [Topbar (64) / Conteúdo (padding 32, grid 12 col, gutter 24)].
- Tudo em Auto Layout (frame raiz horizontal; conteúdo vertical, gap 24).
- Use os dados de exemplo da seção 2.7 (Mercadinho Bom Preço).
Não altere outros frames. Ao terminar, descreva a hierarquia de camadas em no máximo 15 linhas.
```

Ordem sugerida: T01 Login → T03 Painel → T04 Produtos → T05 PDV → T07 Clientes → T08 Usuários → T06, T09, T02.

## Prompt de ajuste (exemplo)

```
No frame "T03 Painel principal", troque o gráfico para barras e aumente o gap entre os KpiCards para space/6.
Altere somente esses elementos.
```
