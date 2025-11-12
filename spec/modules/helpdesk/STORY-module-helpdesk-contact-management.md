# STORY-module-helpdesk-contact-management.md

## Área Temática: Gestão de Contatos

### Visão Geral

Esta área representa a **gestão de pessoas físicas** dentro dos clientes corporativos. As histórias deste grupo definem como a organização mantém informações sobre os contatos individuais que interagem com o suporte, e como esses contatos podem ser vinculados a usuários do sistema para acesso ao portal.

O agrupamento forma uma unidade coesa que implementa cadastro de múltiplos contatos por cliente, definição de contatos principais, vinculação opcional com contas de usuário (para acesso ao portal de autoatendimento) e gestão de configurações de notificação. Esta área é essencial para rastreabilidade de quem solicitou cada chamado.

---

## User Stories

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
- **TBcontato**: Contatos individuais de cada cliente
  - Vinculação obrigatória com TBcliente
  - Vinculação 1:1 opcional com TBusuario
  - Indicador de contato principal
  - Configurações de notificação
  - Dados pessoais (nome, email, telefone, cargo)
- **TBcliente**: Clientes aos quais os contatos pertencem
- **TBusuario**: Contas de acesso ao sistema (vinculação opcional)
- **TBtemplate_email**: Templates para envio de credenciais
- **TBchamado**: Referência para histórico de chamados por contato

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Contatos:**
- SPEC-MH-CON-001 a SPEC-MH-CON-007: Múltiplos contatos, contato principal, vinculação com usuários, notificações

---

## Relacionamento Contato-Cliente-Usuário

### Cenários Possíveis

**Cenário 1: Contato sem usuário vinculado**
```
Cliente: Empresa XYZ
└── Contato: João Silva (principal)
    ├── Email: joao@empresa.com
    ├── Usuário vinculado: NÃO
    └── Pode: Ser referenciado em chamados, receber emails
```

**Cenário 2: Contato com usuário vinculado**
```
Cliente: Empresa ABC
└── Contato: Maria Santos
    ├── Email: maria@empresa.com
    ├── Usuário vinculado: SIM (user-123)
    └── Pode: Login no portal, abrir chamados, acompanhar status
```

**Cenário 3: Cliente com múltiplos contatos**
```
Cliente: Empresa DEF
├── Contato 1: Pedro Costa (principal) → usuário vinculado
├── Contato 2: Ana Lima → usuário vinculado
├── Contato 3: Carlos Souza → sem usuário
└── Contato 4: Julia Dias → sem usuário
```

---

## Regras de Vinculação

### Unicidade
- Um usuário só pode estar vinculado a um contato
- Um contato só pode ter um usuário vinculado
- Um cliente pode ter múltiplos contatos
- Apenas um contato pode ser "principal" por cliente

### Criação de Usuário
Ao criar usuário para um contato:
1. Sistema valida email único
2. Gera senha temporária
3. Cria registro em TBusuario
4. Vincula usuário ao contato
5. Envia email com credenciais
6. Define papel padrão (ex: CLIENTE)

### Desvinculação
- Desvinculação não remove contato nem usuário
- Apenas quebra a ligação 1:1
- Contato continua existindo como referência
- Usuário pode ser vinculado a outro contato

---

## Resumo

**Total de User Stories:** 3
**Personas Envolvidas:** Atendentes, Administradores
**Complexidade:** Média
**Prioridade:** Alta (necessária antes de chamados)
**Dependências:**
- STORY-module-helpdesk-user-profile-rbac (TBusuario)
- STORY-module-helpdesk-client-management (TBcliente)
