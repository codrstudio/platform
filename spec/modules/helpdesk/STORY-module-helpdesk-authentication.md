# STORY-module-helpdesk-authentication.md

## Área Temática: Autenticação e Sessões

### Visão Geral

Esta área representa a **camada de entrada** do sistema HelpDesk, englobando todos os mecanismos que controlam como usuários acessam o sistema. As histórias deste grupo definem o processo de login, recuperação de credenciais perdidas e gestão de sessões de usuário.

O agrupamento forma uma unidade coesa que implementa autenticação segura (login com email/senha), recuperação de acesso (reset de senha via email) e controle de sessões (bloqueio por tentativas falhadas, sessões persistentes). Esta é a primeira barreira de segurança do sistema, garantindo que apenas usuários legítimos possam acessar as funcionalidades.

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

## Schema do Banco de Dados

### Tabelas Principais
- **TBusuario**: Dados dos usuários do sistema
  - Armazenamento seguro de senha (hash bcrypt)
  - Registro de tentativas de login
  - Data/hora de último acesso
  - IP de último acesso
- **TBusuario_papel**: Associação N:N entre usuários e papéis
- **TBpapel**: Definição de papéis de acesso
- **TBtemplate_email**: Templates para emails de recuperação de senha

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Autenticação:**
- SPEC-MH-AUTH-001 a SPEC-MH-AUTH-007: Login, recuperação de senha, bloqueio de contas, sessões

**Segurança:**
- SPEC-MH-SEC-001: Hash de senhas (bcrypt)
- SPEC-MH-SEC-002: Proteção contra brute force

---

## Fluxo de Login

```
1. Usuário acessa tela de login
   ↓
2. Preenche email e senha
   ↓
3. Sistema valida credenciais
   ↓
4. Se válido: registra login e redireciona
   Se inválido: incrementa contador de tentativas
   ↓
5. Após 5 tentativas: bloqueia conta temporariamente
```

---

## Fluxo de Recuperação de Senha

```
1. Usuário clica em "Esqueci minha senha"
   ↓
2. Informa email cadastrado
   ↓
3. Sistema gera token único com validade de 24h
   ↓
4. Envia email com link de recuperação
   ↓
5. Usuário clica no link
   ↓
6. Define nova senha (com validação de força)
   ↓
7. Sistema invalida token e confirma alteração
```

---

## Resumo

**Total de User Stories:** 2
**Personas Envolvidas:** Todos os usuários do sistema
**Complexidade:** Média (segurança crítica)
**Prioridade:** Crítica (deve ser implementada primeiro)
**Dependências:** Nenhuma (porta de entrada do sistema)
