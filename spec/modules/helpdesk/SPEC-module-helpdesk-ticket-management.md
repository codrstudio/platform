# SPEC-module-helpdesk-ticket-management.md

## Especificação: Módulo HelpDesk - Gestão de Chamados

### Escopo

Este documento define os **requisitos de gestão completa de chamados** do módulo HelpDesk.

---

## 1. Criação e Edição de Chamados

**SPEC-MH-TKT-001** - O sistema DEVE permitir abertura de chamados por contatos no portal

**Origem:** OSD051 | **Implementa:** US015 | **Prioridade:** MUST

---

**SPEC-MH-TKT-002** - O sistema DEVE permitir abertura de chamados por atendentes em nome de clientes

**Origem:** OSD052 | **Implementa:** US016 | **Prioridade:** MUST

---

**SPEC-MH-TKT-003** - O sistema DEVE gerar protocolo único e sequencial para cada chamado

**Origem:** OSD053 | **Implementa:** US015, US016 | **Prioridade:** MUST

---

**SPEC-MH-TKT-004** - O sistema DEVE validar campos obrigatórios na criação de chamados

**Origem:** OSD054 | **Implementa:** US015, US016 | **Prioridade:** MUST

---

**SPEC-MH-TKT-005** - O sistema DEVE permitir seleção de departamento e categoria

**Origem:** OSD055 | **Implementa:** US015, US016 | **Prioridade:** MUST

---

**SPEC-MH-TKT-006** - O sistema DEVE suportar upload de múltiplos anexos por chamado

**Origem:** OSD056 | **Implementa:** US015, US016, US017 | **Prioridade:** MUST

---

**SPEC-MH-TKT-007** - O sistema DEVE calcular SLA automaticamente baseado em regras configuradas

**Origem:** OSD057 | **Implementa:** US016, US017, US021 | **Prioridade:** MUST

---

## 2. Atribuição e Workflow

**SPEC-MH-ASSIGN-001** - O sistema DEVE permitir atribuição manual de chamados a atendentes

**Origem:** OSD058 | **Implementa:** US019 | **Prioridade:** MUST

---

**SPEC-MH-ASSIGN-002** - O sistema DEVE suportar regras de auto-atribuição configuráveis

**Origem:** OSD059 | **Implementa:** US019 | **Prioridade:** SHOULD

---

**SPEC-MH-ASSIGN-003** - O sistema DEVE validar que atendentes pertencem ao departamento do chamado

**Origem:** OSD060 | **Implementa:** US019 | **Prioridade:** MUST

---

**SPEC-MH-ASSIGN-004** - O sistema DEVE permitir reatribuição de chamados entre atendentes

**Origem:** OSD061 | **Implementa:** US019 | **Prioridade:** MUST

---

**SPEC-MH-ASSIGN-005** - O sistema DEVE notificar atendentes sobre chamados atribuídos

**Origem:** OSD062 | **Implementa:** US019 | **Prioridade:** MUST

---

**SPEC-MH-ASSIGN-006** - O sistema DEVE registrar histórico completo de atribuições

**Origem:** OSD063 | **Implementa:** US019 | **Prioridade:** MUST

---

**SPEC-MH-ASSIGN-007** - O sistema DEVE permitir atribuição em lote de múltiplos chamados

**Origem:** OSD064 | **Implementa:** US019 | **Prioridade:** SHOULD

---

## 3. Status e Workflow

**SPEC-MH-WF-001** - O sistema DEVE implementar workflow de status configurável

**Origem:** OSD065 | **Implementa:** US021 | **Prioridade:** MUST

---

**SPEC-MH-WF-002** - O sistema DEVE validar transições de status baseado em regras de negócio

**Origem:** OSD066 | **Implementa:** US021 | **Prioridade:** MUST

---

**SPEC-MH-WF-003** - O sistema DEVE permitir campos obrigatórios específicos por transição

**Origem:** OSD067 | **Implementa:** US021 | **Prioridade:** SHOULD

---

**SPEC-MH-WF-004** - O sistema DEVE calcular tempos de primeira resposta e resolução

**Origem:** OSD068 | **Implementa:** US021, US022 | **Prioridade:** MUST

---

**SPEC-MH-WF-005** - O sistema DEVE alertar sobre chamados próximos do vencimento de SLA

**Origem:** OSD069 | **Implementa:** US013, US014 | **Prioridade:** MUST

---

**SPEC-MH-WF-006** - O sistema DEVE permitir reabertura de chamados fechados quando necessário

**Origem:** OSD070 | **Implementa:** US022 (relacionado a US026) | **Prioridade:** MUST

---

**SPEC-MH-WF-007** - O sistema DEVE registrar todos os status anteriores no histórico

**Origem:** OSD071 | **Implementa:** US017, US021 | **Prioridade:** MUST

---

## 4. Comentários e Comunicação

**SPEC-MH-COMM-001** - O sistema DEVE permitir comentários internos (apenas atendentes) e externos (visíveis ao cliente)

**Origem:** OSD072 | **Implementa:** US020 | **Prioridade:** MUST

---

**SPEC-MH-COMM-002** - O sistema DEVE suportar editor de texto rico para comentários

**Origem:** OSD073 | **Implementa:** US020 | **Prioridade:** SHOULD

---

**SPEC-MH-COMM-003** - O sistema DEVE permitir anexos em comentários

**Origem:** OSD074 | **Implementa:** US020 | **Prioridade:** SHOULD

---

**SPEC-MH-COMM-004** - O sistema DEVE implementar sistema de menções (@usuario) em comentários

**Origem:** OSD075 | **Implementa:** US020 | **Prioridade:** SHOULD

---

**SPEC-MH-COMM-005** - O sistema DEVE notificar automaticamente sobre novos comentários

**Origem:** OSD076 | **Implementa:** US020 | **Prioridade:** MUST

---

**SPEC-MH-COMM-006** - O sistema DEVE permitir edição de comentários próprios com histórico

**Origem:** OSD077 | **Implementa:** US020 | **Prioridade:** SHOULD

---

**SPEC-MH-COMM-007** - O sistema DEVE suportar templates de respostas rápidas

**Origem:** OSD078 | **Implementa:** US020 | **Prioridade:** SHOULD

---

## Resumo de Requisitos

### Estatísticas
- **Total de Requisitos:** 28
- **Origem:** OSD051-OSD078
- **User Stories Implementadas:** US013-US022

---

**Data de reorganização:** 2025-01-15
**Versão:** 2.0
