# STORY-module-helpdesk-user-profile-rbac.md

## Área Temática: Perfil de Usuário e Controle de Acesso (RBAC)

### Visão Geral

Esta área representa a **camada de controle de acesso** do sistema HelpDesk, englobando gestão de perfis pessoais e todo o sistema de permissões baseado em papéis (RBAC). As histórias deste grupo definem como usuários gerenciam suas informações pessoais, como administradores controlam quem tem acesso ao sistema, e como permissões são organizadas e atribuídas.

O agrupamento forma uma unidade coesa que implementa gestão de perfil individual (dados pessoais, preferências, tema), administração de usuários (cadastro, edição, ativação/desativação), sistema completo de RBAC (papéis fixos e customizáveis) e permissões granulares com overrides individuais. Esta área define "quem pode fazer o quê" no sistema.

---

## User Stories

### US003 - Perfil do Usuário
**Como** usuário logado
**Eu quero** visualizar e editar meu perfil
**Para que** eu possa manter meus dados atualizados

**Critérios de Sucesso:**
- [ ] Página de perfil com dados pessoais
- [ ] Upload de avatar/foto
- [ ] Edição de nome de exibição, telefone
- [ ] Configuração de fuso horário e idioma
- [ ] Preferências de tema (claro/escuro/auto)
- [ ] Configurações de notificações (email/push)
- [ ] Histórico de último login e IPs

**Tabelas Relacionadas:** `TBusuario`

---

### US004 - Gestão de Usuários (Admin)
**Como** administrador
**Eu quero** gerenciar usuários do sistema
**Para que** eu possa controlar acessos e permissões

**Critérios de Sucesso:**
- [ ] Lista paginada de usuários com filtros
- [ ] Formulário de criação de usuário
- [ ] Edição de dados de usuários existentes
- [ ] Ativação/desativação de contas
- [ ] Visualização de papéis atribuídos
- [ ] Histórico de atividades do usuário
- [ ] Busca por nome, email ou papel

**Tabelas Relacionadas:** `TBusuario`, `TBusuario_papel`, `TBpapel`

---

### US005 - Gestão de Papéis (Admin)
**Como** administrador
**Eu quero** gerenciar papéis e suas permissões
**Para que** eu possa controlar o que cada tipo de usuário pode fazer

**Critérios de Sucesso:**
- [ ] Lista de papéis existentes
- [ ] Criação de novos papéis (exceto fixos)
- [ ] Edição de papéis removíveis
- [ ] Atribuição de permissões por papel
- [ ] Interface visual para permissões (matriz)
- [ ] Prevenção de remoção de papéis fixos
- [ ] Auditoria de mudanças em papéis

**Tabelas Relacionadas:** `TBpapel`, `TBpapel_permissao`, `TBpermissao`

---

### US006 - Permissões Individuais (Admin)
**Como** administrador
**Eu quero** definir permissões específicas para usuários
**Para que** eu possa fazer exceções às regras dos papéis

**Critérios de Sucesso:**
- [ ] Interface para override de permissões por usuário
- [ ] Visualização de permissões efetivas
- [ ] Definição de data de expiração para permissões
- [ ] Campo obrigatório para justificativa
- [ ] Histórico de permissões concedidas/revogadas
- [ ] Alertas para permissões próximas do vencimento

**Tabelas Relacionadas:** `TBusuario_permissao`, `PERMITIDO` (view)

---

## Schema do Banco de Dados

### Tabelas Principais
- **TBusuario**: Dados dos usuários do sistema
  - Informações pessoais (nome, email, telefone)
  - Preferências (tema, idioma, fuso horário)
  - Avatar/foto
  - Histórico de login
- **TBpapel**: Definição de papéis de acesso
  - Papéis fixos: ESPECTADOR, ADMINISTRADOR (não removíveis)
  - Papéis customizáveis criados pelo administrador
- **TBpermissao**: Catálogo de permissões disponíveis
  - Ações granulares por recurso
- **TBusuario_papel**: Associação N:N entre usuários e papéis
  - Um usuário pode ter múltiplos papéis
- **TBpapel_permissao**: Associação N:N entre papéis e permissões
- **TBusuario_permissao**: Permissões individuais por usuário (overrides)
  - Data de expiração opcional
  - Justificativa obrigatória

### View
- **PERMITIDO**: View que calcula permissões efetivas
  - Considera papéis + overrides individuais
  - Lógica: negado > permitido > indefinido = negado

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Controle de Acesso:**
- SPEC-MH-RBAC-001 a SPEC-MH-RBAC-008: RBAC, papéis fixos, permissões granulares, overrides individuais

**Gestão de Usuários:**
- SPEC-MH-USER-001 a SPEC-MH-USER-007: Cadastro, perfil, preferências, histórico
- SPEC-MH-PERM-001 a SPEC-MH-PERM-007: Atribuição de papéis, visualização de permissões efetivas, notificações

**Segurança:**
- SPEC-MH-SEC-003: Auditoria de operações críticas

---

## Sistema RBAC - Conceitos

### Papéis Fixos (Não Removíveis)
- **ESPECTADOR**: Acesso somente leitura
- **ADMINISTRADOR**: Acesso total ao sistema

### Papéis Customizáveis
- Criados pelo administrador conforme necessidade
- Exemplos: ATENDENTE, SUPERVISOR, GERENTE, etc.

### Permissões Granulares
```
Formato: recurso.ação
Exemplos:
- chamado.criar
- chamado.editar
- chamado.deletar
- chamado.visualizar
- usuario.gerenciar
- relatorio.exportar
```

### Lógica de Permissão
```
1. Sistema coleta todas as permissões dos papéis do usuário
2. Aplica overrides individuais do usuário
3. Regra de precedência:
   - NEGADO explícito > PERMITIDO > indefinido = NEGADO
4. Verifica data de expiração de overrides
```

---

## Fluxo de Gestão de Permissões

### Atribuição de Papel a Usuário
```
1. Admin acessa gestão de usuários
   ↓
2. Seleciona usuário
   ↓
3. Visualiza papéis atuais
   ↓
4. Adiciona/remove papéis
   ↓
5. Sistema recalcula permissões efetivas
   ↓
6. Registra auditoria da mudança
   ↓
7. Notifica usuário sobre mudança
```

### Override Individual de Permissão
```
1. Admin acessa perfil do usuário
   ↓
2. Acessa aba "Permissões Especiais"
   ↓
3. Seleciona permissão a conceder/negar
   ↓
4. Define data de expiração (opcional)
   ↓
5. Informa justificativa (obrigatório)
   ↓
6. Sistema aplica override
   ↓
7. Registra auditoria
   ↓
8. Notifica usuário
```

---

## Matriz de Permissões (Exemplo)

| Recurso | Espectador | Atendente | Supervisor | Admin |
|---------|-----------|-----------|------------|-------|
| chamado.criar | ✗ | ✓ | ✓ | ✓ |
| chamado.visualizar | ✓ | ✓ | ✓ | ✓ |
| chamado.editar | ✗ | ✓ (próprios) | ✓ (todos) | ✓ |
| chamado.deletar | ✗ | ✗ | ✓ | ✓ |
| usuario.gerenciar | ✗ | ✗ | ✗ | ✓ |
| relatorio.visualizar | ✗ | ✓ (próprios) | ✓ (equipe) | ✓ |
| config.sistema | ✗ | ✗ | ✗ | ✓ |

---

## Resumo

**Total de User Stories:** 4
**Personas Envolvidas:** Todos os usuários, Administradores
**Complexidade:** Alta (sistema de permissões complexo)
**Prioridade:** Crítica (controle de acesso é fundamental)
**Dependências:** STORY-module-helpdesk-authentication (autenticação deve existir primeiro)
