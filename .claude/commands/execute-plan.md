# Executa um PLAN.md

- **$ARGUMENTS**: Arquivo de plano e explicações adicionais sobre a tarefa (pode especificar tarefas específicas ou escopo)

Use o agente `plan-task-executor` para executar as tarefas definidas no arquivo PLAN.md fornecido.

**IMPORTANTE**: O agente deve ser acionado **INDIVIDUALMENTE** para cada tarefa dentro do escopo solicitado.

## Fluxo de Execução

1. **Identificar escopo**: Analisar $ARGUMENTS para determinar quais tarefas devem ser executadas:
   - Se nenhuma tarefa específica for mencionada: executar TODAS as tarefas pendentes do PLAN.md
   - Se tarefas específicas forem mencionadas: executar apenas essas tarefas
   - Se um escopo for mencionado (ex: "Epic 1.1"): executar todas as tarefas daquele escopo

2. **Executar tarefas sequencialmente**: Para cada tarefa identificada no escopo:
   - Invocar o agente `plan-task-executor` com a tarefa específica
   - Aguardar conclusão da tarefa atual antes de prosseguir para a próxima
   - Verificar se a tarefa foi marcada como concluída no PLAN.md
   - Se houver erro, reportar e perguntar ao usuário se deve continuar

3. **O agente `plan-task-executor` irá (para cada tarefa)**:
   - Ler o arquivo PLAN.md especificado
   - Identificar a tarefa específica a ser executada
   - Ler os arquivos SPEC referenciados na tarefa
   - Implementar a tarefa seguindo as especificações e arquitetura
   - Atualizar o PLAN.md marcando a tarefa como concluída
   - Retornar resultado da execução

4. **Finalização**: Após todas as tarefas do escopo serem concluídas:
   - Reportar resumo de tarefas executadas
   - Indicar se houve alguma falha
   - Sugerir próximos passos se houver tarefas pendentes
