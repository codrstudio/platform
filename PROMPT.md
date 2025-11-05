**Prompt para Claude Code**

Crie uma **extensão para VSCodium (compatível com qualquer IDE baseada nele)** chamada `plan-monitor`.

### Objetivo

Exibir um **painel lateral (WebviewViewProvider)** que interpreta e renderiza visualmente um **arquivo Markdown de checklist** (`PLAN*.md`) com base nas seguintes regras:

### Regras de funcionamento

1. **Descoberta de arquivos**

   * Buscar recursivamente no workspace arquivos que correspondam ao padrão `PLAN*.md`.
   * Exibir um combo (dropdown) no topo do painel para selecionar o plano ativo.

2. **Parsing do Markdown**

   * Interpretar tarefas com base nas seguintes marcações:

     * `[ ]` pendente
     * `[x]` feito
     * `[-]` em andamento
     * `[!]` bloqueado
   * Usar a hierarquia dos títulos (`#`, `##`, `###`, etc.) para definir a estrutura hierárquica das tarefas.
   * O título principal do plano é a **primeira linha** do arquivo (sem marcação Markdown).
   * O subtítulo é o nome do arquivo (`PLAN*.md`) com link direto para o arquivo.

3. **Comportamento do painel**

   * Apenas leitura (visualização). Nenhuma modificação no arquivo.
   * Ao clicar em uma tarefa, abrir o arquivo correspondente e navegar até a **linha exata** onde o item está.
   * Atualizar automaticamente quando o arquivo for modificado no disco (`FileSystemWatcher`).
   * Implementar **cache** com invalidação via `mtime` para evitar parsing desnecessário.

4. **Interface**

   * Sidebar estilizada com ícones e cores distintas para cada status.
   * Renderização hierárquica (expansível).
   * Suporte a tema claro/escuro.

5. **Boas práticas**

   * Código em TypeScript.
   * Estrutura de projeto padrão VSCode Extension: `src/extension.ts`, `webview/`, `package.json`.
   * Logs e erros via `OutputChannel`.
   * Compatibilidade com VSCodium, VSCode e Code-OSS.

### Entregável

* Estrutura funcional completa (buildável e instalável via `vsce package`).
* Parsing eficiente linha a linha com mapeamento linha→tarefa.
* Documentação mínima no README explicando instalação e uso.
