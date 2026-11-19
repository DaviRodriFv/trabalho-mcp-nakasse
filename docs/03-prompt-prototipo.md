# Etapa 3: Prompt de PROTÓTIPO (Figma MCP → código)

Pré-requisito: o Figma MCP oficial conectado (ver [01-figma-mcp-setup.md](01-figma-mcp-setup.md)) e as telas prontas no Figma.

---

## Prompt A: Setup do projeto + tokens (uma única vez)

```
Contexto: @design.md (seção 3: arquitetura e pastas).

1. Crie o projeto em ./app com Vite + React + TypeScript + Tailwind, React Router, Recharts e lucide-react.
2. Use o Figma MCP (get_variable_defs no frame "00 Fundação" <LINK_DO_NÓ>) para gerar src/styles/tokens.css
   (CSS variables) e mapear no tailwind.config (colors, spacing, borderRadius, fontSize, boxShadow).
   Se houver divergência entre o Figma e o design.md, o Figma vence; liste as divergências.
3. Crie os componentes base de src/components conforme a seção 2.5, usando somente os tokens.
4. Crie src/services com dados mock em localStorage (seção 2.7) e src/contexts/AuthContext com os 3 perfis.
Não crie telas ainda. Ao final, rode o build e informe o resultado.
```

## Prompt B: Uma tela por vez

```
Contexto: @design.md. Implemente a tela <T03 Painel principal> a partir do Figma: <LINK_DO_NÓ>.
- Use get_design_context e get_screenshot desse nó.
- Reaproveite os componentes de src/components; não crie estilos fora dos tokens.
- Dados via src/services. Respeite as permissões por perfil (RF02).
- Rota: /painel, dentro do AppLayout.
Compare o resultado com o screenshot e liste as diferenças visuais restantes.
```

## Prompt C: Validação final

```
Revise o app em ./app contra o design.md: liste os RF01–RF13 como ✔/✖ com o arquivo responsável,
e verifique o contraste AA das combinações de cor usadas. Não altere código; apenas relate.
```
