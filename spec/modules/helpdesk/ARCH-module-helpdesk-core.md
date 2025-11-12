# ARCH-module-helpdesk-core.md

## Arquitetura: Módulo HelpDesk - Núcleo (Core)

### Escopo

Este documento descreve as **funcionalidades de identidade, controle de acesso e relacionamentos** do módulo HelpDesk. Inclui autenticação, RBAC, gestão de usuários, clientes e contatos.

### Relacionamento com Outros Documentos

```
STORY-module-helpdesk-*.md (User Stories)
   ↓ implementadas por
SPEC-module-helpdesk-identity.md + relationships.md (Requisitos)
   ↓ usando design de
ARCH-module-helpdesk-core.md (Arquitetura - ESTE DOCUMENTO)
```

---

## 1. Gestão de Identidade e Acesso

### FN001: Autenticação Unificada

**Descrição:**
O sistema implementa uma plataforma centralizada de autenticação que serve como ponto único de entrada para todos os tipos de usuários. A funcionalidade de login suporta diferentes perfis de acesso, desde técnicos administrativos até contatos de clientes, cada um com interfaces e permissões específicas.

**Características Principais:**
- Ponto único de entrada (Single Sign-On interno)
- Suporte a múltiplos perfis de usuário
- Mecanismo de recuperação de senha com tokens seguros
- Expiração automática de tokens (24 horas)
- Bloqueio de conta após tentativas falhadas
- Sessões persistentes ("Lembrar-me")

**Decisões de Design:**
- Tokens JWT para sessões stateless
- Refresh tokens para renovação de sessão
- Hash bcrypt para armazenamento de senhas
- Registro de IP e timestamp para auditoria
- Redirecionamento baseado em papel após login

**Implementa Requisitos:** SPEC-MH-AUTH-001 a SPEC-MH-AUTH-007
**Relacionado a User Stories:** US001, US002

---

### FN002: Sistema de Papéis Hierárquicos

**Descrição:**
A arquitetura de papéis estabelece três níveis fundamentais de acesso. O papel **ESPECTADOR** permite navegação e visualização básica do sistema, ideal para usuários que precisam consultar informações sem realizar alterações. O papel **GERENTE** adiciona capacidades de modificação de dados, permitindo gestão operacional completa de chamados e atendimentos. O papel **ADMINISTRADOR** concede acesso total ao sistema, incluindo configurações avançadas e gestão de outros usuários.

**Hierarquia de Papéis:**
```
ADMINISTRADOR (nível 3)
    ↓ herda de
GERENTE (nível 2)
    ↓ herda de
ESPECTADOR (nível 1)
```

**Papéis Fixos (não removíveis):**
- ESPECTADOR: Visualização apenas
- ADMINISTRADOR: Controle total

**Papéis Customizáveis:**
- Organizações podem criar papéis adicionais
- Herdam permissões de papéis base
- Podem adicionar permissões específicas

**Decisões de Design:**
- Herança de permissões simplifica gestão
- Papéis fixos garantem baseline funcional
- Múltiplos papéis por usuário (N:N)
- Prevenção de remoção do último admin

**Implementa Requisitos:** SPEC-MH-RBAC-001 a SPEC-MH-RBAC-008
**Relacionado a User Stories:** US004, US005

---

### FN003: Controle de Permissões Granular

**Descrição:**
Além dos papéis básicos, o sistema implementa um mecanismo sofisticado de permissões individuais que permite exceções e customizações específicas. Cada permissão pode ser definida como permitida, negada ou indefinida, com uma lógica de resolução que prioriza negações sobre permissões.

**Lógica de Resolução:**
```
1. Verificar permissão individual do usuário
   - Se NEGADO → Nega acesso (fim)
   - Se PERMITIDO → Permite acesso (fim)
   - Se INDEFINIDO → Continua para papéis

2. Verificar permissões de todos os papéis do usuário
   - Se qualquer papel NEGA → Nega acesso (fim)
   - Se qualquer papel PERMITE → Permite acesso (fim)
   - Se todos INDEFINIDOS → Nega acesso (padrão)
```

**Características:**
- Override de permissões por usuário
- Data de expiração para permissões temporárias
- Justificativa obrigatória para overrides
- Histórico completo de mudanças
- Alertas de expiração próxima

**Casos de Uso:**
- Acesso temporário para consultores
- Restrição específica para usuários sensíveis
- Permissões de emergência com expiração
- Exceções a políticas gerais

**Decisões de Design:**
- Negação tem prioridade (princípio de segurança)
- Permissões efetivas calculadas em tempo real
- Cache de permissões para performance
- Auditoria completa de mudanças

**Implementa Requisitos:** SPEC-MH-RBAC-005, SPEC-MH-RBAC-006, SPEC-MH-RBAC-007, SPEC-MH-PERM-001 a SPEC-MH-PERM-007
**Relacionado a User Stories:** US006

---

## 2. Gestão de Relacionamentos

### FN004: Hierarquia de Clientes

**Descrição:**
O sistema reconhece que organizações modernas frequentemente possuem estruturas complexas com matrizes, filiais e subsidiárias. A funcionalidade de hierarquia de clientes permite modelar essas relações, facilitando a gestão de contratos corporativos, aplicação de políticas específicas e consolidação de relatórios.

**Estrutura de Dados:**
```
Cliente
├── id (UUID)
├── nome
├── cliente_pai_id (self-reference, nullable)
├── limite_chamados_mensal
├── configuracoes_sla (JSON)
└── campos_personalizados (JSON)
```

**Características:**
- Hierarquia ilimitada (árvore)
- Cliente raiz (cliente_pai_id = null)
- Herança de configurações (opcional)
- Consolidação de métricas por hierarquia
- Limites agregados vs. individuais

**Exemplos de Uso:**
```
Empresa XYZ (Matriz)
├── XYZ Filial SP
│   ├── Limite: 100 chamados/mês
│   └── SLA: 4h primeira resposta
├── XYZ Filial RJ
│   ├── Limite: 50 chamados/mês
│   └── SLA: herda da matriz
└── XYZ Filial MG
```

**Decisões de Design:**
- Self-reference para hierarquia infinita
- JSON para campos personalizados (flexibilidade)
- Configurações específicas sobrescrevem herdadas
- Validação de ciclos na hierarquia

**Implementa Requisitos:** SPEC-MH-CLI-001 a SPEC-MH-CLI-007
**Relacionado a User Stories:** US007, US008, US009

---

### FN005: Gestão Inteligente de Contatos

**Descrição:**
Os contatos representam os usuários finais que interagem com o sistema de suporte. A funcionalidade permite que cada cliente tenha múltiplos contatos, com a flexibilidade de definir contatos principais e configurar individualmente quais devem receber notificações.

**Estrutura de Dados:**
```
Contato
├── id (UUID)
├── cliente_id (FK)
├── usuario_id (FK, nullable, unique)
├── nome
├── email (unique)
├── telefone
├── cargo
├── departamento
├── principal (boolean)
├── recebe_notificacoes (boolean)
└── preferencias_notificacao (JSON)
```

**Características:**
- Múltiplos contatos por cliente
- Um contato principal por cliente
- Vinculação opcional com usuário (acesso ao portal)
- Configuração individual de notificações
- Histórico de chamados por contato

**Regras de Negócio:**
- Apenas um contato principal por cliente
- Email único no sistema (cross-cliente)
- Contato sem usuário = apenas referência
- Contato com usuário = acesso ao portal
- Desvinculação não remove contato nem usuário

**Decisões de Design:**
- Separação contato vs. usuário (flexibilidade)
- Restrição 1:1 usuário-contato (segurança)
- JSON para preferências (extensibilidade)
- Validação de email único global

**Implementa Requisitos:** SPEC-MH-CON-001 a SPEC-MH-CON-007
**Relacionado a User Stories:** US010, US011

---

### FN006: Integração com Sistema de Usuários

**Descrição:**
A vinculação entre contatos e usuários é uma funcionalidade crítica que permite que clientes acessem o portal de autoatendimento. O sistema garante que cada usuário pode estar vinculado a apenas um contato, mantendo a integridade dos dados e a segurança do acesso.

**Fluxo de Vinculação:**
```
1. Admin/Atendente cria contato
   ↓
2. Opcionalmente cria usuário (ou vincula existente)
   ↓
3. Sistema valida unicidade (1 usuário = 1 contato)
   ↓
4. Envia credenciais por email
   ↓
5. Contato pode acessar portal com credenciais
```

**Características:**
- Criação automática de usuário ao cadastrar contato
- Busca de usuário existente para vinculação
- Validação de unicidade rígida
- Envio de credenciais por email template
- Auditoria de vinculações/desvinculações

**Herança de Permissões:**
- Usuário vinculado a contato herda papel "CLIENTE"
- Acesso restrito a chamados do próprio cliente
- Visualização apenas de comentários externos
- Sem acesso a funcionalidades administrativas

**Decisões de Design:**
- Restrição 1:1 via constraint de banco
- Templates de email personalizáveis
- Link de primeiro acesso (definir senha)
- Auditoria completa de mudanças

**Implementa Requisitos:** SPEC-MH-CON-003, SPEC-MH-CON-005, SPEC-MH-CON-006, SPEC-MH-CON-007
**Relacionado a User Stories:** US012

---

## Resumo de Funcionalidades

### Estatísticas
- **Total de Funcionalidades:** 6 (FN001-FN006)
- **Categorias:** 2 módulos (Identidade + Relacionamentos)
- **Requisitos Implementados:** 50 (SPEC-MH-AUTH-*, RBAC-*, PERM-*, CLI-*, CON-*)
- **User Stories Cobertas:** US001-US012

### Princípios Arquiteturais
1. **Segurança:** Autenticação forte, controle de acesso granular
2. **Flexibilidade:** Papéis customizáveis, hierarquia de clientes
3. **Auditoria:** Registro completo de operações críticas
4. **Separação de Conceitos:** Usuário ≠ Contato (máxima flexibilidade)

---

**Documento gerado a partir de:** `ARCH-module-helpdesk.md`
**Data de divisão:** 2025-01-12
**Versão:** 1.0
