# STORY-module-helpdesk-ticket-lifecycle.md

## Área Temática: Ciclo de Vida e Resolução de Chamados

### Visão Geral

Esta área representa os **estágios finais do ciclo de vida** de chamados no sistema HelpDesk. As histórias deste grupo definem como chamados são resolvidos, fechados e potencialmente reabertos quando necessário. É a conclusão natural do processo de atendimento.

O agrupamento forma uma unidade coesa focada especificamente nos eventos de resolução e reabertura de chamados, complementando a gestão operacional definida em STORY-module-helpdesk-ticket-management. Esta separação permite focar nas regras de negócio e métricas específicas do fechamento e reabertura.

---

## User Stories

### US025 - Resolução de Chamado
**Como** atendente
**Eu quero** marcar chamados como resolvidos
**Para que** o cliente seja notificado da solução e possa avaliar

**Critérios de Sucesso:**
- [ ] Formulário de resolução com descrição da solução
- [ ] Seleção de categoria de resolução (fixado, workaround, etc.)
- [ ] Campo para tempo total gasto
- [ ] Validação de campos obrigatórios
- [ ] Cálculo automático de métricas de SLA
- [ ] Envio automático de email ao cliente
- [ ] Disparo de pesquisa de satisfação
- [ ] Registro completo no histórico

**Tabelas Relacionadas:** `TBchamado`, `TBchamado_historico`, `TBchamado_satisfacao`, `TBtemplate_email`

---

### US026 - Reabertura de Chamado
**Como** cliente ou atendente
**Eu quero** reabrir chamados fechados
**Para que** problemas não resolvidos possam ser tratados novamente

**Critérios de Sucesso:**
- [ ] Botão de reabertura visível em chamados fechados
- [ ] Campo obrigatório para motivo da reabertura
- [ ] Validação de prazo (ex: até 7 dias após fechamento)
- [ ] Restauração para status anterior ao fechamento
- [ ] Notificação ao atendente original
- [ ] Registro no histórico com motivo
- [ ] Recálculo de métricas de SLA
- [ ] Incremento de contador de reaberturas

**Tabelas Relacionadas:** `TBchamado`, `TBchamado_historico`, `TBnotificacao`

---

## Schema do Banco de Dados

### Tabelas Principais
- **TBchamado**: Dados principais dos chamados
  - status_id (incluindo "resolvido" e "fechado")
  - data_resolucao
  - data_fechamento
  - categoria_resolucao
  - solucao (texto da resolução)
  - tempo_total_gasto
  - contador_reaberturas
  - pode_reabrir (calculado: data_fechamento + 7 dias)
- **TBchamado_historico**: Timeline de mudanças
  - Registra resoluções e reaberturas
  - Motivos de reabertura
  - Usuário responsável pela ação
- **TBchamado_satisfacao**: Avaliações pós-fechamento
  - Link para chamado
  - Nota de satisfação
  - Comentários do cliente
  - Data de resposta
- **TBtemplate_email**: Templates de notificação
- **TBnotificacao**: Notificações enviadas

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Resolução:**
- SPEC-MH-WF-004: Cálculo de tempos de resolução
- SPEC-MH-WF-007: Registro de status no histórico
- SPEC-MH-SAT-001: Envio de pesquisas de satisfação pós-fechamento

**Reabertura:**
- SPEC-MH-WF-006: Reabertura de chamados fechados quando necessário
- SPEC-MH-WF-007: Registro completo no histórico

---

## Fluxo de Resolução

```
1. Chamado em status "Em Atendimento"
   ↓
2. Atendente identifica solução do problema
   ↓
3. Atendente acessa formulário de resolução
   - Descreve solução aplicada
   - Seleciona categoria de resolução
   - Informa tempo gasto total
   ↓
4. Sistema valida informações obrigatórias
   ↓
5. Altera status para "Resolvido"
   ↓
6. Registra data/hora de resolução
   ↓
7. Calcula métricas:
   - Tempo de primeira resposta
   - Tempo total de resolução
   - Cumprimento de SLA
   ↓
8. Envia email ao cliente:
   - Notifica sobre resolução
   - Inclui descrição da solução
   - Link para avaliação de satisfação
   ↓
9. Aguarda feedback do cliente (7 dias)
   ↓
10. Se não reaberto: status → "Fechado"
```

---

## Fluxo de Reabertura

```
1. Chamado em status "Resolvido" ou "Fechado"
   ↓
2. Cliente ou atendente identifica problema não resolvido
   ↓
3. Acessa chamado e clica em "Reabrir"
   ↓
4. Sistema valida:
   - Prazo de reabertura (7 dias)
   - Permissões do usuário
   ↓
5. Exibe formulário com campo obrigatório:
   - Motivo da reabertura
   ↓
6. Sistema processa reabertura:
   - Altera status para "Reaberto"
   - Incrementa contador de reaberturas
   - Registra motivo no histórico
   - Atribui ao atendente original
   ↓
7. Notifica atendente:
   - Email com motivo da reabertura
   - Alerta no dashboard
   ↓
8. Recalcula SLA:
   - Considera tempo já decorrido
   - Define novo prazo de resolução
   ↓
9. Chamado volta ao fluxo normal de atendimento
```

---

## Categorias de Resolução

Exemplos de categorias que podem ser selecionadas:

- **Fixado**: Problema completamente resolvido
- **Workaround**: Solução temporária aplicada
- **Orientação**: Cliente instruído sobre uso correto
- **Não Reproduzível**: Problema não pôde ser reproduzido
- **Duplicado**: Chamado duplicado de outro
- **Cancelado**: Cliente solicitou cancelamento
- **Resolvido Automaticamente**: Problema cessou sozinho

---

## Métricas de Resolução

### Por Chamado Individual
- Tempo de primeira resposta
- Tempo total de resolução
- Tempo dentro/fora do SLA
- Número de interações até resolução
- Número de reaberturas

### Agregadas
- Taxa de resolução no primeiro contato (FCR)
- Tempo médio de resolução por departamento
- Taxa de reabertura (% de chamados reabertos)
- Distribuição de categorias de resolução
- Cumprimento de SLA (%)

---

## Regras de Reabertura

### Quem Pode Reabrir
- **Cliente**: Apenas seus próprios chamados
- **Atendente**: Chamados de sua equipe
- **Supervisor**: Qualquer chamado do departamento
- **Administrador**: Qualquer chamado

### Quando Pode Reabrir
- Até 7 dias após fechamento (configurável)
- Enquanto o chamado ainda está "Resolvido" (antes do fechamento automático)
- Chamados "Fechados" há mais de 7 dias devem abrir novo chamado

### Impacto da Reabertura
- Contador de reaberturas é incrementado
- Métrica de "taxa de reabertura" afeta avaliação do atendente
- SLA é recalculado considerando tempo já decorrido
- Pesquisa de satisfação anterior é mantida mas marcada como "chamado reaberto"

---

## Email de Resolução (Exemplo)

```
Assunto: Seu chamado #2025-00123 foi resolvido

Olá João Silva,

Seu chamado foi marcado como resolvido!

Protocolo: 2025-00123
Título: Problema com impressora
Atendente: Maria Santos

Solução Aplicada:
Foi identificado que o driver da impressora estava desatualizado.
Realizamos a atualização para a versão mais recente e testamos
a impressão com sucesso.

Categoria de Resolução: Fixado

Se o problema persistir, você pode reabrir este chamado em até 7 dias
clicando no link abaixo:

[Reabrir Chamado]

Sua opinião é importante! Avalie nosso atendimento:
[Avaliar Atendimento]

Atenciosamente,
Equipe de Suporte
```

---

## Resumo

**Total de User Stories:** 2
**Personas Envolvidas:** Atendentes, Clientes
**Complexidade:** Média
**Prioridade:** Alta (conclusão natural do ciclo)
**Dependências:**
- STORY-module-helpdesk-ticket-management (gestão de chamados)
- STORY-module-helpdesk-reports-satisfaction (pesquisa de satisfação)
