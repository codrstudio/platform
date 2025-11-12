# ARCH-module-helpdesk-configuration.md

## Arquitetura: Módulo HelpDesk - Configuração

### Escopo

Este documento descreve as **funcionalidades de configuração, administração e automação** do módulo HelpDesk. Inclui configurações organizacionais, gestão de departamentos, categorias, SLA, templates e automação de processos.

### Relacionamento com Outros Documentos

```
STORY-module-helpdesk-*.md (User Stories)
   ↓ implementadas por
SPEC-module-helpdesk-administration.md (Requisitos)
   ↓ usando design de
ARCH-module-helpdesk-configuration.md (Arquitetura - ESTE DOCUMENTO)
```

---

## 7. Configuração e Personalização

### FN022: Configurações Organizacionais

**Descrição:**
O sistema permite personalização completa da identidade visual e configurações operacionais.

**Categorias de Configuração:**
1. **Identidade Visual** - Nome da empresa, Logo, Cores, Fonte customizada
2. **Email (SMTP)** - Servidor, Porta/SSL/TLS, Autenticação
3. **Segurança** - Política de senha, Timeout, 2FA, IPs permitidos
4. **Limites e Quotas** - Max anexos, Tamanho max, Chamados por página
5. **Integrações** - APIs externas, Webhooks, SSO providers

**Decisões de Design:**
- Armazenamento JSON (flexibilidade)
- Versionamento de configurações
- Auditoria completa
- Validação antes de salvar

**Implementa Requisitos:** SPEC-MH-CFG-001 a SPEC-MH-CFG-007
**Relacionado a User Stories:** US034

---

### FN023: Gestão de Departamentos

**Descrição:**
Organização interna da equipe de atendimento.

**Características:**
- Atendentes em múltiplos departamentos (N:N)
- Papel diferenciado (membro vs. supervisor)
- Capacidade configurável
- Horários diferentes por dia
- Email específico

**Decisões de Design:**
- Associação N:N (flexibilidade)
- Horários em JSON
- Validação de integridade
- Soft delete

**Implementa Requisitos:** SPEC-MH-DEPT-001 a SPEC-MH-DEPT-007
**Relacionado a User Stories:** US035

---

### FN024: Configuração de SLA

**Descrição:**
Sistema de SLA altamente configurável.

**Tipos:** Geral, Por Cliente, Por Categoria, Por Prioridade, Combinado

**Cálculo:** Horário comercial, Pausa em feriados, Pausa aguardando cliente

**Escalações Automáticas:** 50% prazo (notificar supervisor), 80% (notificar gestor), 100% (atribuir supervisor)

**Implementa Requisitos:** SPEC-MH-SLA-001 a SPEC-MH-SLA-007
**Relacionado a User Stories:** US037

---

### FN025: Automação de Processos

**Descrição:**
Regras que executam ações automaticamente.

**Triggers:** chamado_criado, status_alterado, sla_vencendo, agendado

**Ações:** atribuir, alterar_status, notificar, webhook, adicionar_tag

**Interface:** Drag-and-drop, Templates, Teste, Preview, Simulação

**Monitoramento:** Log, Métricas, Alertas, Dashboard

**Implementa Requisitos:** SPEC-MH-AUTO-001 a SPEC-MH-AUTO-007
**Relacionado a User Stories:** US039

---

### FN026: Notificações Multicanal

**Descrição:**
Notificações em múltiplos canais: email, push, sistema, WhatsApp, SMS.

**Agrupamento:** Notificações similares → uma agregada

**Retry:** 3x com backoff exponencial, Fallback: email → push → sistema

**Implementa Requisitos:** SPEC-MH-NOTIF-001 a SPEC-MH-NOTIF-007
**Relacionado a User Stories:** US044, US045

---

### FN027: Templates Inteligentes

**Descrição:**
Templates com variáveis dinâmicas.

**Tipos:** Email, Push, SMS, WhatsApp, Comentários

**Variáveis:** Chamado, Usuários, Sistema

**Editor:** WYSIWYG, Drag-and-drop, Preview, Validação

**Versionamento:** Histórico, Rollback, Comparação

**Implementa Requisitos:** SPEC-MH-TPL-001 a SPEC-MH-TPL-007
**Relacionado a User Stories:** US038

---

### FN028: Central de Notificações

**Descrição:**
Central unificada de notificações.

**Características:** Badge contador, Agrupamento, Filtros, Ações diretas, Histórico, Busca

**Tipos:** Informação, Sucesso, Aviso, Erro, Ação requerida

**Retenção:** Não lidas (ilimitado), Lidas (30 dias), Arquivadas (90 dias)

**Implementa Requisitos:** SPEC-MH-NOTIFCTR-001 a SPEC-MH-NOTIFCTR-007
**Relacionado a User Stories:** US044

---

## Resumo de Funcionalidades

### Estatísticas
- **Total de Funcionalidades:** 7 (FN022-FN028)
- **Categorias:** 1 módulo (Configuração)
- **Requisitos Implementados:** 49
- **User Stories Cobertas:** US034-US039, US044-US045

---

**Documento gerado a partir de:** `ARCH-module-helpdesk.md`
**Data de divisão:** 2025-01-12
**Versão:** 1.0
