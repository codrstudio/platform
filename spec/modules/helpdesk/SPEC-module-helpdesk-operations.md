# SPEC-module-helpdesk-operations.md

## Especificação: Módulo HelpDesk - Operações

### Escopo

Este documento define os **requisitos de gestão de chamados e atendimento online** do módulo HelpDesk. Agrupa requisitos relacionados ao ciclo completo de chamados, atribuição, workflow, comunicação e chat em tempo real.

### Relacionamento com Outros Documentos

```
STORY-module-helpdesk-*.md (User Stories)
   ↓ implementadas por
SPEC-module-helpdesk-operations.md (Requisitos - ESTE DOCUMENTO)
   ↓ usando design de
ARCH-module-helpdesk-domain.md (Arquitetura/Funcionalidades)
```

---

## 4. Requisitos de Gestão de Chamados

### 4.1. Criação e Edição

**SPEC-MH-TKT-001** - O sistema DEVE permitir abertura de chamados por contatos no portal

**SPEC-MH-TKT-002** - O sistema DEVE permitir abertura de chamados por atendentes em nome de clientes

**SPEC-MH-TKT-003** - O sistema DEVE gerar protocolo único e sequencial para cada chamado

**SPEC-MH-TKT-004** - O sistema DEVE validar campos obrigatórios na criação de chamados

**SPEC-MH-TKT-005** - O sistema DEVE permitir seleção de departamento e categoria

**SPEC-MH-TKT-006** - O sistema DEVE suportar upload de múltiplos anexos por chamado

**SPEC-MH-TKT-007** - O sistema DEVE calcular SLA automaticamente baseado em regras configuradas

**Origem:** OSD051-OSD057 | **Implementa:** US015, US016, US017, US018

---

### 4.2. Atribuição e Workflow

**SPEC-MH-ASSIGN-001** - O sistema DEVE permitir atribuição manual de chamados a atendentes

**SPEC-MH-ASSIGN-002** - O sistema DEVE suportar regras de auto-atribuição configuráveis

**SPEC-MH-ASSIGN-003** - O sistema DEVE validar que atendentes pertencem ao departamento do chamado

**SPEC-MH-ASSIGN-004** - O sistema DEVE permitir reatribuição de chamados entre atendentes

**SPEC-MH-ASSIGN-005** - O sistema DEVE notificar atendentes sobre chamados atribuídos

**SPEC-MH-ASSIGN-006** - O sistema DEVE registrar histórico completo de atribuições

**SPEC-MH-ASSIGN-007** - O sistema DEVE permitir atribuição em lote de múltiplos chamados

**Origem:** OSD058-OSD064 | **Implementa:** US019

---

### 4.3. Status e Workflow

**SPEC-MH-WF-001** - O sistema DEVE implementar workflow de status configurável

**SPEC-MH-WF-002** - O sistema DEVE validar transições de status baseado em regras de negócio

**SPEC-MH-WF-003** - O sistema DEVE permitir campos obrigatórios específicos por transição

**SPEC-MH-WF-004** - O sistema DEVE calcular tempos de primeira resposta e resolução

**SPEC-MH-WF-005** - O sistema DEVE alertar sobre chamados próximos do vencimento de SLA

**SPEC-MH-WF-006** - O sistema DEVE permitir reabertura de chamados fechados quando necessário

**SPEC-MH-WF-007** - O sistema DEVE registrar todos os status anteriores no histórico

**Origem:** OSD065-OSD071 | **Implementa:** US021, US022

---

### 4.4. Comentários e Comunicação

**SPEC-MH-COMM-001** - O sistema DEVE permitir comentários internos (apenas atendentes) e externos (visíveis ao cliente)

**SPEC-MH-COMM-002** - O sistema DEVE suportar editor de texto rico para comentários

**SPEC-MH-COMM-003** - O sistema DEVE permitir anexos em comentários

**SPEC-MH-COMM-004** - O sistema DEVE implementar sistema de menções (@usuario) em comentários

**SPEC-MH-COMM-005** - O sistema DEVE notificar automaticamente sobre novos comentários

**SPEC-MH-COMM-006** - O sistema DEVE permitir edição de comentários próprios com histórico

**SPEC-MH-COMM-007** - O sistema DEVE suportar templates de respostas rápidas

**Origem:** OSD072-OSD078 | **Implementa:** US020

---

## 5. Requisitos de Atendimento Online

### 5.1. Chat em Tempo Real

**SPEC-MH-CHAT-001** - O sistema DEVE fornecer widget de chat para incorporação em sites

**SPEC-MH-CHAT-002** - O sistema DEVE suportar atendimento em tempo real via chat

**SPEC-MH-CHAT-003** - O sistema DEVE implementar sistema de filas para distribuição de atendimentos

**SPEC-MH-CHAT-004** - O sistema DEVE capturar informações básicas do visitante (nome, email, página)

**SPEC-MH-CHAT-005** - O sistema DEVE detectar localização geográfica do visitante

**SPEC-MH-CHAT-006** - O sistema DEVE suportar envio de arquivos e imagens no chat

**SPEC-MH-CHAT-007** - O sistema DEVE implementar indicadores de digitação em tempo real

**Origem:** OSD079-OSD085 | **Implementa:** US023, US024

---

### 5.2. Gestão de Atendimentos

**SPEC-MH-CHATMGMT-001** - O sistema DEVE permitir transferência de atendimentos entre atendentes

**SPEC-MH-CHATMGMT-002** - O sistema DEVE preservar histórico completo de mensagens nas transferências

**SPEC-MH-CHATMGMT-003** - O sistema DEVE permitir finalização de atendimentos com observações

**SPEC-MH-CHATMGMT-004** - O sistema DEVE suportar criação de chamados a partir de atendimentos

**SPEC-MH-CHATMGMT-005** - O sistema DEVE calcular tempo total de atendimento

**SPEC-MH-CHATMGMT-006** - O sistema DEVE enviar transcrição do atendimento por email quando solicitado

**SPEC-MH-CHATMGMT-007** - O sistema DEVE implementar pesquisa de satisfação automática pós-atendimento

**Origem:** OSD086-OSD092 | **Implementa:** US025, US026

---

## Resumo de Requisitos

### Estatísticas
- **Total de Requisitos:** 42
- **Categorias:** 2 áreas (Gestão de Chamados + Atendimento Online)
- **Origem:** OSD051-OSD092
- **User Stories Implementadas:** US015-US026
- **Arquitetura Relacionada:** FN007-FN014 (ver ARCH-module-helpdesk-domain.md)

### Rastreabilidade
Todos os requisitos incluem:
- **Origem:** Código OSD original do documento fonte
- **Implementa:** User Stories (US) relacionadas

---

**Documento gerado a partir de:** `SPEC-module-helpdesk.md`
**Data de divisão:** 2025-01-12
**Versão:** 1.0
