# STORY-module-helpdesk-experience.md

## Área Temática: Experiência do Cliente e Comunicação

### Visão Geral

Esta área agrupa todas as funcionalidades que **conectam o sistema com o mundo externo**. As histórias deste grupo definem a "face externa" do HelpDesk - tudo que clientes veem e usam, toda a comunicação multicanal, e todas as integrações com sistemas externos e dispositivos móveis.

O agrupamento forma uma unidade coesa que implementa o portal dedicado ao cliente (autoatendimento web), sistema de notificações multicanal (email, push, WhatsApp), APIs e webhooks para integração com outros sistemas, e aplicativos móveis. Esta área é essencial para a experiência do usuário final e para a extensibilidade do sistema.

Com 8 User Stories focadas em experiência e comunicação, esta área reflete a importância de interfaces amigáveis e integração omnichannel.

---

## User Stories - Portal do Cliente

### US041 - Dashboard do Cliente
**Como** contato de cliente
**Eu quero** visualizar um dashboard dos meus chamados
**Para que** eu possa acompanhar o status das solicitações

**Critérios de Sucesso:**
- [ ] Resumo de chamados por status
- [ ] Chamados recentes
- [ ] Indicadores de SLA
- [ ] Atalhos para ações frequentes
- [ ] Notificações importantes
- [ ] Gráfico de chamados por período
- [ ] Acesso rápido a criar novo chamado

**Tabelas Relacionadas:** `TBchamado`, `TBcontato`

---

### US042 - Meus Chamados (Portal)
**Como** contato de cliente
**Eu quero** visualizar meus chamados
**Para que** eu possa acompanhar o progresso

**Critérios de Sucesso:**
- [ ] Lista filtrada por status
- [ ] Busca por protocolo ou título
- [ ] Ordenação por data/prioridade
- [ ] Indicadores visuais de urgência
- [ ] Acesso aos detalhes de cada chamado
- [ ] Histórico completo de interações
- [ ] Download de anexos

**Tabelas Relacionadas:** `TBchamado`, `TBchamado_historico`, `TBchamado_anexo`

---

### US043 - Acompanhamento de Chamado (Portal)
**Como** contato de cliente
**Eu quero** acompanhar um chamado específico
**Para que** eu possa ver o progresso e interagir

**Critérios de Sucesso:**
- [ ] Timeline de atividades
- [ ] Status atual e histórico
- [ ] Comentários públicos
- [ ] Possibilidade de adicionar comentários
- [ ] Upload de anexos adicionais
- [ ] Informações de SLA
- [ ] Avaliação do atendimento (quando fechado)

**Tabelas Relacionadas:** `TBchamado`, `TBchamado_comentario`, `TBchamado_anexo`

---

## User Stories - Notificações

### US044 - Central de Notificações
**Como** usuário do sistema
**Eu quero** visualizar minhas notificações
**Para que** eu possa me manter informado sobre atualizações importantes

**Critérios de Sucesso:**
- [ ] Lista de notificações não lidas
- [ ] Marcação como lida/não lida
- [ ] Filtros por tipo de notificação
- [ ] Ações diretas das notificações
- [ ] Configuração de preferências
- [ ] Histórico de notificações
- [ ] Limpeza em lote

**Tabelas Relacionadas:** `TBnotificacao`, `TBtipo_notificacao`

---

### US045 - Configuração de Notificações
**Como** usuário
**Eu quero** configurar minhas preferências de notificação
**Para que** eu receba apenas as informações relevantes

**Critérios de Sucesso:**
- [ ] Configuração por tipo de evento
- [ ] Escolha de canais (email, push, sistema)
- [ ] Horários para recebimento
- [ ] Frequência de notificações
- [ ] Filtros por prioridade
- [ ] Teste de configurações
- [ ] Salvamento automático

**Tabelas Relacionadas:** `TBusuario`, `TBtipo_canal_notificacao`

---

## User Stories - Integrações

### US048 - API para Integrações
**Como** desenvolvedor
**Eu quero** acessar APIs do sistema
**Para que** eu possa integrar com outros sistemas

**Critérios de Sucesso:**
- [ ] Documentação completa da API
- [ ] Autenticação via token
- [ ] Endpoints para todas as entidades principais
- [ ] Rate limiting e controle de acesso
- [ ] Webhooks para eventos importantes
- [ ] SDKs em linguagens populares
- [ ] Ambiente de sandbox para testes

**Tabelas Relacionadas:** Todas (via API)

---

### US049 - Integração com Email
**Como** administrador
**Eu quero** integrar o sistema com email
**Para que** chamados possam ser criados via email

**Critérios de Sucesso:**
- [ ] Configuração de contas de email
- [ ] Parsing automático de emails
- [ ] Criação de chamados a partir de emails
- [ ] Resposta via email atualiza chamados
- [ ] Tratamento de anexos
- [ ] Filtros anti-spam
- [ ] Log de processamento

**Tabelas Relacionadas:** `TBchamado`, `TBchamado_anexo`, `TBcontato`

---

## User Stories - Mobile

### US050 - App Mobile para Atendentes
**Como** atendente
**Eu quero** acessar o sistema via mobile
**Para que** eu possa trabalhar mesmo fora do escritório

**Critérios de Sucesso:**
- [ ] Login seguro
- [ ] Lista de chamados otimizada para mobile
- [ ] Visualização de detalhes do chamado
- [ ] Adição de comentários
- [ ] Mudança de status
- [ ] Notificações push
- [ ] Modo offline básico
- [ ] Sincronização automática

**Tabelas Relacionadas:** `TBchamado`, `TBchamado_comentario`, `TBnotificacao`

---

## Schema do Banco de Dados

### Tabelas de Notificações
- **TBnotificacao**: Notificações enviadas/recebidas
  - Usuário destinatário
  - Tipo de notificação
  - Canal de envio
  - Status (lida/não lida)
  - Data de envio
  - Conteúdo/payload
- **TBtipo_notificacao**: Tipos de notificação
  - Novo chamado, atualização, comentário, etc.
  - Descrição
- **TBtipo_canal_notificacao**: Canais disponíveis
  - Email, push, sistema, WhatsApp, SMS

### Tabelas de Dados (Acesso via Portal/API)
- **TBchamado**: Chamados visíveis ao cliente
- **TBchamado_historico**: Timeline de atividades
- **TBchamado_comentario**: Comentários (filtrados por visibilidade)
- **TBchamado_anexo**: Anexos para download
- **TBcontato**: Dados do contato logado
- **TBusuario**: Preferências de notificação

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Portal do Cliente:**
- OSD184 a OSD197: Interface responsiva, dashboard, visualização, abertura, comentários, anexos

**Sistema de Notificações:**
- OSD170 a OSD183: Multicanal, preferências, templates, agrupamento, retry, central unificada

**APIs e Integrações:**
- OSD198 a OSD218: API REST, autenticação, webhooks, documentação, email, CRM, SSO, telefonia, chat

**Mobile:**
- OSD219 a OSD225: App nativo/PWA, funcionalidades principais, push, offline, sincronização, biometria

---

## Portal do Cliente - Estrutura

### Rotas Principais
```
/portal
├── /dashboard          (US041)
├── /chamados          (US042)
│   ├── /novo          (US015 - duplicada em operations)
│   └── /:protocolo    (US043)
├── /perfil
└── /notificacoes      (US044)
```

### Restrições de Segurança
- Cliente vê apenas seus próprios chamados
- Não pode ver comentários internos
- Não pode editar campos protegidos
- Não pode atribuir ou alterar status (exceto reabrir)
- Não pode ver dados de outros clientes

### Experiência Responsiva
- Design mobile-first
- Touch-friendly para tablets
- Progressive Web App (PWA)
- Funciona offline (cache básico)
- Notificações push no navegador

---

## Sistema de Notificações

### Canais Suportados

#### 1. Email
- Servidor SMTP configurável
- Templates HTML personalizados
- Variáveis dinâmicas
- Anexos opcionais
- Tracking de abertura/clique (opcional)

#### 2. Push (Navegador)
- Web Push API
- Funciona mesmo com navegador fechado
- Ícone, título, corpo e ações
- Click abre chamado diretamente

#### 3. Sistema (In-App)
- Central de notificações no sistema
- Badge com contador de não lidas
- Som/vibração configurável
- Ações diretas (marcar como lida, ir para chamado)

#### 4. WhatsApp (Integração)
- Via API do WhatsApp Business
- Templates pré-aprovados
- Confirmação de leitura
- Link para acompanhamento

#### 5. SMS (Opcional)
- Para notificações críticas
- Via gateway SMS
- Custo por envio

### Tipos de Notificação

**Para Clientes:**
- Novo chamado criado
- Chamado atribuído a atendente
- Novo comentário público
- Mudança de status
- Chamado resolvido
- Pesquisa de satisfação

**Para Atendentes:**
- Chamado atribuído a mim
- Menção em comentário (@usuario)
- SLA próximo do vencimento
- Cliente respondeu
- Chamado escalado
- Mudança de prioridade

**Para Supervisores/Gestores:**
- SLA violado
- Volume anormal de chamados
- Satisfação baixa
- Atendente inativo
- Relatório agendado pronto

### Preferências de Notificação (Exemplo)
```javascript
{
  usuario_id: "user-123",
  preferencias: {
    novo_chamado: {
      email: true,
      push: true,
      sistema: true,
      whatsapp: false
    },
    comentario_novo: {
      email: false,
      push: true,
      sistema: true,
      whatsapp: false
    },
    sla_vencendo: {
      email: true,
      push: true,
      sistema: true,
      whatsapp: true
    },
    horario_silencioso: {
      inicio: "22:00",
      fim: "08:00",
      dias: [0, 6] // Dom e Sáb
    },
    frequencia: "imediato" // imediato, agrupado-15min, agrupado-1h, diario
  }
}
```

---

## API REST

### Autenticação
```http
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "***"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "...",
  "expires_in": 3600
}
```

### Endpoints Principais

**Chamados:**
```http
GET    /api/chamados              # Listar
POST   /api/chamados              # Criar
GET    /api/chamados/:id          # Detalhes
PUT    /api/chamados/:id          # Atualizar
DELETE /api/chamados/:id          # Deletar

POST   /api/chamados/:id/comentarios    # Adicionar comentário
POST   /api/chamados/:id/anexos         # Upload anexo
PUT    /api/chamados/:id/status         # Mudar status
PUT    /api/chamados/:id/atribuir       # Atribuir atendente
```

**Clientes:**
```http
GET    /api/clientes              # Listar
POST   /api/clientes              # Criar
GET    /api/clientes/:id          # Detalhes
PUT    /api/clientes/:id          # Atualizar
```

**Contatos:**
```http
GET    /api/contatos              # Listar
POST   /api/contatos              # Criar
GET    /api/contatos/:id          # Detalhes
PUT    /api/contatos/:id          # Atualizar
```

### Webhooks

**Eventos Disponíveis:**
- `chamado.criado`
- `chamado.atualizado`
- `chamado.status_alterado`
- `chamado.comentario_novo`
- `chamado.fechado`
- `chamado.reaberto`
- `chamado.sla_vencendo`
- `chamado.sla_violado`
- `satisfacao.respondida`

**Configuração de Webhook:**
```javascript
{
  url: "https://meu-sistema.com/webhook/helpdesk",
  eventos: ["chamado.criado", "chamado.fechado"],
  ativo: true,
  secret: "***", // Para validação HMAC
  retry_tentativas: 3,
  retry_intervalo_segundos: 60
}
```

**Payload Exemplo:**
```json
{
  "evento": "chamado.criado",
  "timestamp": "2025-01-15T14:30:00Z",
  "dados": {
    "chamado_id": "chamado-789",
    "protocolo": "2025-00123",
    "titulo": "Problema com impressora",
    "cliente_id": "cliente-456",
    "cliente_nome": "Empresa XYZ",
    "contato_id": "contato-789",
    "contato_nome": "João Silva",
    "prioridade": "media",
    "departamento": "suporte-tecnico"
  }
}
```

---

## Integração com Email

### Fluxo de Criação via Email
```
1. Email chega na caixa helpdesk@empresa.com
   ↓
2. Sistema processa email
   - Identifica remetente (contato existente?)
   - Extrai assunto → título do chamado
   - Extrai corpo → descrição
   - Processa anexos
   ↓
3. Cria chamado automaticamente
   - Protocolo gerado
   - Departamento definido por regras
   - Categoria auto-detectada (IA opcional)
   ↓
4. Envia confirmação ao remetente
   - "Seu chamado #2025-00123 foi criado"
```

### Fluxo de Resposta via Email
```
1. Atendente responde no sistema
   ↓
2. Sistema envia email ao cliente
   - From: helpdesk@empresa.com
   - To: cliente@empresa.com
   - Subject: Re: [#2025-00123] Problema com impressora
   - Body: Resposta do atendente
   ↓
3. Cliente responde o email
   ↓
4. Sistema detecta protocolo no subject
   ↓
5. Adiciona resposta como comentário no chamado
```

### Detecção de Protocolo
- `[#2025-00123]` no subject
- Header customizado: `X-Helpdesk-Protocolo: 2025-00123`
- In-Reply-To/References headers

---

## App Mobile

### Plataformas
- **iOS**: Swift / SwiftUI
- **Android**: Kotlin / Jetpack Compose
- **PWA**: Alternativa multiplataforma

### Funcionalidades Offline
- Cache de chamados visualizados recentemente
- Rascunho de comentários (sincroniza quando online)
- Visualização de anexos baixados
- Notificações push mesmo offline

### Sincronização
- Background sync quando app abre
- Sync incremental (apenas mudanças)
- Conflict resolution (last-write-wins)
- Indicador visual de sincronização

---

## Resumo

**Total de User Stories:** 8 (16% do total do sistema)
**Personas Envolvidas:** Clientes, Atendentes, Desenvolvedores, Administradores
**Complexidade:** Alta (múltiplos canais e plataformas)
**Prioridade:** Alta (experiência do cliente é crítica)
**Dependências:**
- STORY-module-helpdesk-identity (autenticação, permissões)
- STORY-module-helpdesk-operations (chamados, comentários)
- STORY-module-helpdesk-administration (templates, configurações)

**Impacto:** Esta área define como o mundo externo interage com o HelpDesk - é a interface entre a organização e seus clientes.
