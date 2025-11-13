# STORY-module-helpdesk-customer-portal.md

## Área Temática: Portal do Cliente (Autoatendimento)

### Visão Geral

Esta área representa a **interface dedicada aos clientes** do sistema HelpDesk. As histórias deste grupo definem como contatos de clientes acessam o portal de autoatendimento para visualizar seus chamados, abrir novas solicitações, acompanhar status, adicionar comentários e acessar a base de conhecimento.

O agrupamento forma uma unidade coesa que implementa dashboard específico para clientes, lista de chamados próprios com filtros, abertura de novos chamados, acompanhamento detalhado com timeline, sistema de comentários públicos e acesso à base de conhecimento para resolução de dúvidas comuns. Esta área é essencial para autonomia do cliente e redução de carga no atendimento.

---

## User Stories

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

### US045 - Base de Conhecimento
**Como** contato de cliente
**Eu quero** acessar artigos de ajuda
**Para que** eu possa resolver problemas comuns sozinho

**Critérios de Sucesso:**
- [ ] Busca de artigos por palavra-chave
- [ ] Categorização por tópicos
- [ ] Artigos relacionados sugeridos
- [ ] Avaliação de utilidade do artigo
- [ ] Opção "Isso não resolveu" → abrir chamado
- [ ] Artigos populares em destaque
- [ ] Histórico de artigos visualizados

**Tabelas Relacionadas:** `TBartigo_conhecimento`, `TBcategoria_conhecimento`

---

## Schema do Banco de Dados

### Tabelas do Portal
- **TBchamado**: Chamados visíveis ao cliente (apenas próprios)
- **TBchamado_historico**: Timeline de atividades
- **TBchamado_comentario**: Comentários (filtrados - apenas públicos)
- **TBchamado_anexo**: Anexos para download
- **TBcontato**: Dados do contato logado
- **TBcliente**: Informações do cliente
- **TBusuario**: Preferências e configurações

### Tabelas de Base de Conhecimento
- **TBartigo_conhecimento**: Artigos de ajuda
  - Título
  - Conteúdo (HTML)
  - Categoria
  - Tags
  - Visualizações
  - Avaliações (útil/não útil)
  - Data publicação
  - Ativo/inativo
- **TBcategoria_conhecimento**: Categorias de artigos
- **TBartigo_avaliacao**: Avaliações de usuários

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Portal:**
- SPEC-MH-PORTAL-001 a SPEC-MH-PORTAL-007: Interface responsiva, dashboard, visualização, abertura, comentários
- SPEC-MH-PORTALFUNC-001 a SPEC-MH-PORTALFUNC-007: Busca, filtros, histórico, download, avaliação, multilíngue

---

## Estrutura do Portal

### Rotas Principais
```
/portal (acesso com login de contato)
├── /dashboard          (US041)
├── /chamados          (US042)
│   ├── /novo          (US043 - abertura)
│   └── /:protocolo    (US043 - acompanhamento)
├── /base-conhecimento (US045)
│   ├── /categorias
│   ├── /busca
│   └── /artigo/:id
├── /perfil
└── /notificacoes
```

### Restrições de Segurança
- Cliente vê apenas seus próprios chamados
- Não pode ver comentários internos
- Não pode editar campos protegidos (atendente, departamento)
- Pode adicionar comentários e anexos
- Pode reabrir chamados fechados (dentro do prazo)

---

## Dashboard do Cliente

```
┌──────────────────────────────────────────────────────┐
│ BEM-VINDO, JOÃO SILVA                      [Sair]    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  MEUS CHAMADOS                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │  ABERTOS   │ │ EM ATEND.  │ │ RESOLVIDOS │      │
│  │     3      │ │     2      │ │     12     │      │
│  └────────────┘ └────────────┘ └────────────┘      │
│                                                      │
│  CHAMADOS RECENTES                                   │
│  ┌────────────────────────────────────────────────┐ │
│  │ #2025-00123  Impressora não funciona           │ │
│  │ Em Atendimento - Atribuído a Maria Santos      │ │
│  │ Prazo: 2 horas  ██████░░░░ 60%                 │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │ #2025-00089  Dúvida sobre faturamento          │ │
│  │ Aguardando Cliente - Nova mensagem             │ │
│  │ Prazo: 5 dias  ████████░░ 80%                  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  [+ NOVO CHAMADO]  [VER TODOS]  [BASE DE CONHEC.]  │
└──────────────────────────────────────────────────────┘
```

---

## Base de Conhecimento

### Estrutura de Artigos

```
Base de Conhecimento
│
├── Primeiros Passos
│   ├── Como criar uma conta
│   ├── Como recuperar senha
│   └── Como abrir um chamado
│
├── Hardware
│   ├── Problemas com impressora
│   ├── Computador lento
│   └── Teclado não funciona
│
├── Software
│   ├── Como instalar o Office
│   ├── Configurar email no Outlook
│   └── Acessar sistema remotamente
│
├── Rede e Conectividade
│   ├── Problemas com Wi-Fi
│   ├── VPN não conecta
│   └── Email não sincroniza
│
└── FAQ
    ├── Qual o prazo de atendimento?
    ├── Como alterar minha senha?
    └── Horário de funcionamento
```

### Exemplo de Artigo

```markdown
# Como resolver problemas com impressora

**Categoria:** Hardware > Impressoras
**Última atualização:** 10/01/2025
**Visualizações:** 145
**Útil:** 87%

## Sintomas Comuns
- Impressora não aparece nos dispositivos
- Documentos ficam presos na fila
- Páginas saem em branco

## Soluções Rápidas

### 1. Verificar Conexões
- Certifique-se que o cabo USB está conectado
- Verifique se a impressora está ligada
- Teste outro cabo USB se disponível

### 2. Limpar Fila de Impressão
1. Abra "Dispositivos e Impressoras"
2. Clique com botão direito na impressora
3. Selecione "Ver o que está sendo impresso"
4. Clique em "Impressora" > "Cancelar Todos os Documentos"

### 3. Reiniciar Serviço de Impressão
[Instruções detalhadas...]

## Ainda não resolveu?
[ABRIR CHAMADO]

---
Este artigo foi útil?  [SIM] [NÃO]
```

---

## Acompanhamento de Chamado

### Visualização Detalhada

```
┌──────────────────────────────────────────────────────┐
│ CHAMADO #2025-00123                                  │
│ Impressora não funciona                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Status: EM ATENDIMENTO                               │
│ Prioridade: Média                                    │
│ Departamento: Suporte Técnico                        │
│ Atendente: Maria Santos                              │
│ Aberto em: 15/01/2025 14:30                         │
│ Prazo: 18/01/2025 08:30 (2h restantes) ████░ 80%   │
│                                                      │
├──────────────────────────────────────────────────────┤
│ TIMELINE                                             │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 15/01 14:30 - Você abriu o chamado                  │
│ "Impressora não está imprimindo documentos. Já      │
│  tentei reiniciar mas continua igual."              │
│  📎 foto-erro.jpg                                   │
│                                                      │
│ 15/01 14:45 - Atribuído a Maria Santos              │
│                                                      │
│ 15/01 15:00 - Maria Santos comentou:                │
│ "Olá João! Vou verificar o problema. Você consegue │
│  me informar o modelo da impressora?"               │
│                                                      │
│ 15/01 15:10 - Você comentou:                        │
│ "É uma HP LaserJet Pro M404"                        │
│                                                      │
│ 15/01 15:30 - Maria Santos comentou:                │
│ "Identifiquei que o driver está desatualizado.     │
│  Vou te enviar o link para download."              │
│  📎 driver-hp-m404.exe                             │
│                                                      │
│ [Adicionar Comentário]                              │
│ ┌────────────────────────────────────────────────┐  │
│ │                                                │  │
│ │                                                │  │
│ └────────────────────────────────────────────────┘  │
│ [📎 Anexar Arquivo]    [Enviar]                     │
└──────────────────────────────────────────────────────┘
```

---

## Resumo

**Total de User Stories:** 4
**Personas Envolvidas:** Contatos de Clientes
**Complexidade:** Média
**Prioridade:** Alta (experiência do cliente é crítica)
**Dependências:**
- STORY-module-helpdesk-authentication (login de contatos)
- STORY-module-helpdesk-contact-management (vinculação usuário-contato)
- STORY-module-helpdesk-ticket-management (visualização e interação com chamados)
