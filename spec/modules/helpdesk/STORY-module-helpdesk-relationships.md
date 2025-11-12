# STORY-module-helpdesk-relationships.md

## Área Temática: Gestão de Relacionamentos

### Visão Geral

Esta área representa o "CRM interno" do sistema HelpDesk, gerenciando todas as entidades externas (clientes e seus contatos) e suas relações com o sistema. As histórias deste grupo definem como a organização modela seus clientes, desde estruturas hierárquicas complexas (matriz/filial) até os contatos individuais que interagem com o suporte.

O agrupamento forma uma unidade coesa que permite cadastro e manutenção de clientes, gestão de múltiplos contatos por cliente, e a crucial vinculação entre contatos e usuários do sistema (que permite acesso ao portal de autoatendimento). Esta é a base para todo o relacionamento B2B e rastreabilidade de solicitações por organização.

---

## User Stories

### US007 - Lista de Clientes
**Como** atendente
**Eu quero** visualizar a lista de clientes
**Para que** eu possa encontrar e gerenciar informações dos clientes

**Critérios de Sucesso:**
- [ ] Lista paginada com busca e filtros
- [ ] Colunas: nome, email, telefone, status, data criação
- [ ] Filtros por status (ativo/inativo)
- [ ] Ordenação por diferentes campos
- [ ] Indicador visual de clientes com hierarquia
- [ ] Contagem de chamados por cliente
- [ ] Ações rápidas (editar, desativar, ver chamados)

**Tabelas Relacionadas:** `TBcliente`, `TBchamado`

---

### US008 - Cadastro de Cliente
**Como** atendente
**Eu quero** cadastrar novos clientes
**Para que** eu possa associar chamados e contatos a eles

**Critérios de Sucesso:**
- [ ] Formulário com campos obrigatórios e opcionais
- [ ] Validação de email único
- [ ] Seleção de cliente pai (hierarquia)
- [ ] Upload de logo/imagem do cliente
- [ ] Configuração de limite de chamados mensais
- [ ] Campos personalizados configuráveis
- [ ] Salvamento com feedback visual

**Tabelas Relacionadas:** `TBcliente`

---

### US009 - Edição de Cliente
**Como** atendente
**Eu quero** editar dados de clientes existentes
**Para que** eu possa manter as informações atualizadas

**Critérios de Sucesso:**
- [ ] Formulário pré-preenchido com dados atuais
- [ ] Histórico de alterações
- [ ] Validação de campos obrigatórios
- [ ] Prevenção de alterações que quebrem integridade
- [ ] Auditoria de quem fez as alterações
- [ ] Confirmação antes de salvar mudanças críticas

**Tabelas Relacionadas:** `TBcliente`, `TBauditoria`

---

### US010 - Lista de Contatos
**Como** atendente
**Eu quero** visualizar contatos dos clientes
**Para que** eu possa gerenciar os usuários finais

**Critérios de Sucesso:**
- [ ] Lista filtrada por cliente
- [ ] Indicação de contato principal
- [ ] Status de usuário vinculado (tem login ou não)
- [ ] Filtros por cliente, status, tipo
- [ ] Busca por nome ou email
- [ ] Ações: editar, criar usuário, desativar
- [ ] Histórico de chamados por contato

**Tabelas Relacionadas:** `TBcontato`, `TBusuario`, `TBchamado`

---

### US011 - Cadastro de Contato
**Como** atendente
**Eu quero** cadastrar contatos para os clientes
**Para que** eles possam abrir chamados e usar o portal

**Critérios de Sucesso:**
- [ ] Seleção obrigatória de cliente
- [ ] Campos: nome, email, telefone, cargo, departamento
- [ ] Opção para definir como contato principal
- [ ] Configuração de recebimento de notificações
- [ ] Opção para criar usuário simultaneamente
- [ ] Validação de email único no sistema
- [ ] Associação automática com cliente selecionado

**Tabelas Relacionadas:** `TBcontato`, `TBcliente`, `TBusuario`

---

### US012 - Vinculação Usuário-Contato
**Como** administrador
**Eu quero** vincular usuários a contatos
**Para que** contatos possam acessar o portal do cliente

**Critérios de Sucesso:**
- [ ] Interface para buscar usuários existentes
- [ ] Criação de usuário diretamente do contato
- [ ] Validação de unicidade (1 usuário = 1 contato)
- [ ] Envio de credenciais por email
- [ ] Desvinculação quando necessário
- [ ] Auditoria de vinculações/desvinculações

**Tabelas Relacionadas:** `TBcontato`, `TBusuario`, `TBtemplate_email`

---

## Schema do Banco de Dados

### Tabelas Principais
- **TBcliente**: Dados dos clientes/organizações
  - Suporta hierarquia (cliente_pai_id)
  - Limites de chamados configuráveis
  - Campos personalizados
- **TBcontato**: Contatos individuais de cada cliente
  - Vinculação 1:1 opcional com TBusuario
  - Contato principal por cliente
  - Configurações de notificação
- **TBusuario**: Contas de acesso ao sistema
- **TBtemplate_email**: Templates para envio de credenciais
- **TBauditoria**: Registro de alterações em clientes
- **TBchamado**: Referência para contagem de chamados

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Clientes:**
- OSD037 a OSD043: Cadastro, hierarquia, limites, campos personalizados, histórico

**Contatos:**
- OSD044 a OSD050: Múltiplos contatos, contato principal, vinculação com usuários, notificações

---

## Relacionamentos Importantes

### Hierarquia de Clientes
```
Cliente Matriz
├── Filial A
│   ├── Contato 1 (principal)
│   └── Contato 2
└── Filial B
    ├── Contato 3 (principal) → vinculado a Usuario X
    └── Contato 4
```

### Vinculação Usuário-Contato
- Um contato pode existir sem usuário vinculado (apenas referência)
- Um contato pode ter um usuário vinculado (acesso ao portal)
- Um usuário só pode estar vinculado a um contato
- Desvinculação não remove o contato nem o usuário

---

## Resumo

**Total de User Stories:** 6
**Personas Envolvidas:** Atendentes, Administradores
**Complexidade:** Média
**Prioridade:** Alta (necessária antes de chamados)
**Dependências:** STORY-module-helpdesk-identity (TBusuario)
