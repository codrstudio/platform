# STORY-module-helpdesk-identity.md

## Área Temática: Identidade e Controle de Acesso

### Visão Geral

Esta área representa a camada fundamental de segurança do sistema HelpDesk, englobando todos os mecanismos de autenticação e autorização. As histórias deste grupo definem quem pode entrar no sistema, o que cada tipo de usuário pode fazer e como seus acessos são gerenciados ao longo do tempo.

O agrupamento forma uma unidade coesa que implementa autenticação (login, recuperação de senha, sessões), gestão de perfil pessoal (preferências, configurações individuais) e todo o sistema de controle de acesso baseado em papéis (RBAC) com permissões granulares. Esta é a fundação sobre a qual todas as outras funcionalidades do sistema se apoiam.

---

## User Stories

### US001 - Login no Sistema
**Como** usuário registrado
**Eu quero** fazer login com email e senha
**Para que** eu possa acessar as funcionalidades do sistema conforme meu perfil

**Critérios de Sucesso:**
- [ ] Tela de login com campos email e senha
- [ ] Validação de credenciais em tempo real
- [ ] Redirecionamento baseado no papel do usuário
- [ ] Mensagem de erro clara para credenciais inválidas
- [ ] Bloqueio temporário após 5 tentativas falhadas
- [ ] Link para recuperação de senha
- [ ] Opção "Lembrar-me" para sessões persistentes

**Tabelas Relacionadas:** `TBusuario`, `TBusuario_papel`, `TBpapel`

---

### US002 - Recuperação de Senha
**Como** usuário que esqueceu a senha
**Eu quero** solicitar uma nova senha via email
**Para que** eu possa recuperar o acesso ao sistema

**Critérios de Sucesso:**
- [ ] Formulário com campo de email
- [ ] Envio de token de recuperação por email
- [ ] Link seguro com expiração de 24 horas
- [ ] Formulário para definir nova senha
- [ ] Validação de força da senha
- [ ] Confirmação de alteração bem-sucedida

**Tabelas Relacionadas:** `TBusuario`, `TBtemplate_email`

---

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
- **TBpapel**: Definição de papéis de acesso
- **TBpermissao**: Catálogo de permissões disponíveis
- **TBusuario_papel**: Associação N:N entre usuários e papéis
- **TBpapel_permissao**: Associação N:N entre papéis e permissões
- **TBusuario_permissao**: Permissões individuais por usuário (overrides)
- **TBtemplate_email**: Templates para emails de recuperação de senha

### View
- **PERMITIDO**: View que calcula permissões efetivas considerando papéis e overrides individuais

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Autenticação:**
- OSD001 a OSD007: Sistema de login, recuperação de senha, bloqueio de contas

**Controle de Acesso:**
- OSD008 a OSD015: RBAC, papéis fixos, permissões granulares, overrides individuais

**Segurança de Dados:**
- OSD016 a OSD022: Hash de senhas, proteção contra brute force, auditoria, validação de entrada

**Gestão de Usuários:**
- OSD023 a OSD036: Cadastro, perfil, gestão de papéis e permissões

---

## Resumo

**Total de User Stories:** 6
**Personas Envolvidas:** Usuários do sistema, Administradores
**Complexidade:** Alta (camada de segurança crítica)
**Prioridade:** Crítica (deve ser implementada primeiro)
**Dependências:** Nenhuma (fundação do sistema)
