# ARCH-module-helpdesk-domain.md

## Arquitetura: Módulo HelpDesk - Domínio

### Escopo

Este documento descreve as **funcionalidades de gestão de chamados, atendimento online e organização** do módulo HelpDesk. Inclui o ciclo de vida completo de chamados, chat em tempo real, sistema de tags e categorização.

### Relacionamento com Outros Documentos

```
STORY-module-helpdesk-*.md (User Stories)
   ↓ implementadas por
SPEC-module-helpdesk-operations.md + intelligence.md (Requisitos)
   ↓ usando design de
ARCH-module-helpdesk-domain.md (Arquitetura - ESTE DOCUMENTO)
```

---

## 3. Núcleo de Gestão de Chamados

### FN007: Ciclo de Vida Completo

**Descrição:**
O sistema gerencia todo o ciclo de vida dos chamados, desde a abertura inicial até o fechamento e avaliação. Cada chamado recebe um protocolo único e é automaticamente categorizado e priorizado. O workflow de status é configurável, permitindo que organizações adaptem o fluxo de trabalho às suas necessidades específicas.

**Workflow Padrão:**
```
NOVO
  ↓ (atribuição)
 EM ATENDIMENTO
  ↓ (trabalho)
AGUARDANDO CLIENTE
  ↓ (resposta)
EM ATENDIMENTO
  ↓ (resolução)
RESOLVIDO
  ↓ (confirmação cliente)
FECHADO
```

**Características do Protocolo:**
- Formato: `AAAA-NNNNN` (ex: `2025-00123`)
- Sequencial por ano
- Único e imutável
- Usado em todas as comunicações

**Cálculos Automáticos:**
- SLA baseado em regras configuradas
- Tempo de primeira resposta
- Tempo total de resolução
- Tempo em cada status
- Alertas de vencimento

**Decisões de Design:**
- Workflow configurável por administrador
- Estados customizáveis além dos padrão
- Transições validadas por regras
- Histórico imutável de mudanças
- Reabertura possível com auditoria

**Implementa Requisitos:** SPEC-MH-TKT-001 a SPEC-MH-TKT-007, SPEC-MH-WF-001 a SPEC-MH-WF-007
**Relacionado a User Stories:** US013, US015, US016, US017, US018, US021, US022

---

### FN008: Sistema de Atribuição Inteligente

**Descrição:**
A funcionalidade de atribuição combina regras automáticas com controle manual, permitindo distribuição eficiente de trabalho. O sistema pode automaticamente atribuir chamados baseado em critérios como departamento, categoria, carga de trabalho atual dos atendentes e especialidades.

**Modos de Atribuição:**

**1. Manual:**
- Supervisor seleciona atendente específico
- Validação de departamento/competência
- Notificação imediata ao atendente
- Histórico de atribuição

**2. Automática (Round Robin):**
- Distribuição circular entre atendentes
- Considera disponibilidade
- Balanceamento de carga

**3. Automática (Carga de Trabalho):**
- Atribui ao atendente com menor carga
- Métricas: chamados ativos, SLA próximo vencimento
- Priorização inteligente

**4. Automática (Especialidade):**
- Baseada em categoria/tag do chamado
- Matching com skills do atendente
- Fallback para round robin se não encontrar

**Regras de Validação:**
- Atendente deve pertencer ao departamento do chamado
- Atendente deve estar ativo
- Carga de trabalho não pode exceder limite configurado
- Respeitam feriados e horário de funcionamento

**Decisões de Design:**
- Fila de atribuição assíncrona (não bloqueia abertura)
- Regras configuráveis por departamento/categoria
- Reatribuição preserva histórico
- Notificações multicanal ao atribuir

**Implementa Requisitos:** SPEC-MH-ASSIGN-001 a SPEC-MH-ASSIGN-007
**Relacionado a User Stories:** US019

---

### FN009: Comunicação Contextual

**Descrição:**
O sistema de comentários suporta comunicação rica entre todas as partes envolvidas. Comentários internos permitem colaboração entre atendentes sem exposição ao cliente, enquanto comentários externos mantêm o cliente informado sobre o progresso.

**Tipos de Comentários:**

**Interno:**
- Visível apenas para atendentes
- Colaboração entre equipe
- Notas técnicas
- Observações sobre o cliente

**Externo:**
- Visível para cliente e atendentes
- Atualizações de status
- Solicitações de informação
- Resoluções

**Características:**
- Editor de texto rico (Markdown ou WYSIWYG)
- Anexos em comentários
- Menções a outros usuários (@usuario)
- Notificações automáticas
- Edição com histórico de versões
- Templates de respostas rápidas

**Fluxo de Notificação:**
```
Atendente adiciona comentário externo
  ↓
Sistema identifica tipo
  ↓
Se externo: notifica cliente + mencões
Se interno: notifica apenas mencões
  ↓
Cliente/Usuário recebe notificação (email/push/sistema)
```

**Decisões de Design:**
- Separação clara interno/externo (segurança)
- Markdown para formatação (simplicidade + poder)
- Versionamento de edições (auditoria)
- Templates com variáveis dinâmicas
- Rate limiting para prevenir spam

**Implementa Requisitos:** SPEC-MH-COMM-001 a SPEC-MH-COMM-007
**Relacionado a User Stories:** US020

---

### FN010: Gestão de Anexos e Documentos

**Descrição:**
A funcionalidade de anexos permite que usuários incluam documentos, imagens e outros arquivos relevantes tanto na abertura quanto durante o acompanhamento de chamados. O sistema mantém controle de versões, registra quem fez cada upload e preserva a integridade dos arquivos ao longo do tempo.

**Características:**
- Upload múltiplo (até 5 arquivos por chamado)
- Tamanho máximo: 10MB por arquivo
- Tipos permitidos: documentos, imagens, vídeos, logs
- Validação de tipo MIME (segurança)
- Scan antivírus (opcional)
- Armazenamento em objeto storage (S3-compatible)

**Estrutura de Metadados:**
```
Anexo
├── id (UUID)
├── chamado_id (FK)
├── comentario_id (FK, nullable)
├── nome_original
├── nome_armazenamento (hash)
├── tipo_mime
├── tamanho_bytes
├── checksum_md5
├── enviado_por (FK usuario)
├── enviado_em (timestamp)
└── url_download (signed, expira 1h)
```

**Segurança:**
- Nome randomizado no storage (previne path traversal)
- URLs assinadas com expiração
- Validação de propriedade ao baixar
- Registro de downloads (auditoria)

**Decisões de Design:**
- Armazenamento separado do banco (performance)
- CDN para downloads (escalabilidade)
- Checksum para integridade
- Soft delete (retenção para compliance)

**Implementa Requisitos:** SPEC-MH-TKT-006, SPEC-MH-COMM-003
**Relacionado a User Stories:** US015, US016, US017, US020

---

## 4. Atendimento em Tempo Real

### FN011: Plataforma de Chat Integrada

**Descrição:**
O módulo de atendimento online oferece uma solução completa de chat em tempo real que pode ser incorporada em qualquer website. O widget de chat é altamente customizável e se adapta ao design do site cliente.

**Componentes:**

**1. Widget (Frontend):**
```javascript
<script src="https://helpdesk.empresa.com/widget.js"></script>
<script>
  HelpDeskWidget.init({
    apiKey: 'xxx',
    departamento: 'suporte',
    posicao: 'bottom-right',
    tema: 'light',
    idioma: 'pt-BR'
  });
</script>
```

**2. Console de Atendimento:**
- Interface para atendentes
- Múltiplas conversas simultâneas
- Informações contextuais do visitante
- Templates de respostas rápidas

**3. Backend em Tempo Real:**
- WebSocket para comunicação bidirecional
- Escalável horizontalmente (Redis Pub/Sub)
- Fallback para long-polling

**Informações Capturadas:**
- Nome e email do visitante
- Página de origem (URL)
- Localização geográfica (GeoIP)
- User agent (navegador, OS)
- Idioma preferido
- Referrer

**Decisões de Design:**
- WebSocket como transporte principal
- Redis para coordenação entre servidores
- Persistência de mensagens em banco
- Reconexão automática (offline/online)

**Implementa Requisitos:** SPEC-MH-CHAT-001 a SPEC-MH-CHAT-007
**Relacionado a User Stories:** US023, US024

---

### FN012: Sistema de Filas Inteligente

**Descrição:**
A funcionalidade de filas distribui visitantes entre atendentes disponíveis baseado em critérios configuráveis como departamento, especialidade e carga atual de trabalho. O sistema mantém visitantes informados sobre tempo de espera estimado e posição na fila.

**Algoritmo de Distribuição:**
```
1. Visitante inicia chat e seleciona departamento
   ↓
2. Sistema busca atendentes disponíveis:
   - Pertencem ao departamento
   - Status = "disponível" ou "ocupado" (se < max simultâneos)
   - Dentro do horário de funcionamento
   ↓
3. Ordena atendentes por critério configurado:
   - Tempo desde último atendimento (round robin)
   - Carga atual (menor primeiro)
   - Especialidade/skills
   ↓
4. Atribui ao primeiro da fila
   ↓
5. Se nenhum disponível: adiciona à fila de espera
```

**Características da Fila:**
- Posição em tempo real
- Tempo estimado de espera (baseado em histórico)
- Priorização VIP (clientes premium)
- Timeout de espera configurável
- Opção de deixar mensagem offline

**Métricas Calculadas:**
- Tempo médio de espera
- Taxa de abandono
- Taxa de conversão (espera → atendimento)
- Peak hours

**Decisões de Design:**
- Fila distribuída (Redis Sorted Set)
- Prioridade via score
- Heartbeat para detectar atendentes offline
- Rebalanceamento dinâmico

**Implementa Requisitos:** SPEC-MH-CHAT-003
**Relacionado a User Stories:** US024

---

### FN013: Transferência e Escalação

**Descrição:**
O sistema suporta transferência suave de atendimentos entre atendentes, preservando todo o histórico de conversação. Atendentes podem transferir conversas com contexto adicional, explicando o motivo da transferência e fornecendo informações relevantes ao próximo atendente.

**Tipos de Transferência:**

**1. Transferência Direta:**
- Atendente seleciona destinatário específico
- Adiciona nota de contexto (privada)
- Destinatário aceita ou rejeita

**2. Transferência para Departamento:**
- Entra na fila do departamento alvo
- Próximo atendente disponível aceita
- Preserva prioridade original

**3. Escalação Automática:**
- Baseada em tempo sem resposta
- Baseada em palavras-chave (urgente, crítico)
- Vai para supervisor/gerente

**Fluxo de Transferência:**
```
Atendente A: "Preciso transferir para TI"
  ↓
Sistema: Modal de transferência
  - Selecionar departamento/atendente
  - Campo de observações (obrigatório)
  ↓
Visitante vê: "Transferindo para especialista..."
  ↓
Atendente B recebe notificação
  - Vê histórico completo
  - Vê observações do Atendente A
  ↓
Atendente B aceita
  ↓
Visitante vê: "Olá, sou João do TI. Vou ajudar você."
```

**Decisões de Design:**
- Histórico completo sempre visível
- Observações privadas entre atendentes
- Notificação ao visitante transparente
- SLA pausado durante transferência (opcional)
- Limite de transferências (prevenir ping-pong)

**Implementa Requisitos:** SPEC-MH-CHATMGMT-001, SPEC-MH-CHATMGMT-002
**Relacionado a User Stories:** US025

---

### FN014: Conversão para Chamados

**Descrição:**
Uma funcionalidade única permite converter atendimentos de chat em chamados formais quando a questão requer acompanhamento prolongado. O sistema preserva todo o histórico da conversa como contexto inicial do chamado, garantindo continuidade no atendimento.

**Cenários de Conversão:**
- Problema complexo que requer análise
- Necessita envolvimento de outros departamentos
- Cliente solicita protocolo para rastreamento
- Resolução requer tempo > 30 minutos
- Atendente identifica bug que precisa investigação

**Fluxo de Conversão:**
```
Durante atendimento de chat:
  ↓
Atendente clica "Converter em Chamado"
  ↓
Sistema abre formulário pré-preenchido:
  - Cliente/Contato (auto-detectado)
  - Título (sugerido do chat)
  - Descrição (transcrição do chat)
  - Categoria (sugerida por IA/regras)
  - Prioridade (padrão: média)
  ↓
Atendente revisa e confirma
  ↓
Sistema cria chamado
  ↓
Envia mensagem no chat:
  "Criei chamado #2025-00123 para você.
   Pode acompanhar em: [link]"
  ↓
Finaliza atendimento de chat
```

**Conteúdo Preservado:**
- Transcrição completa das mensagens
- Metadados: IP, localização, página de origem
- Anexos enviados no chat
- Timestamp de início e fim
- Atendente(s) que participaram

**Decisões de Design:**
- Preservação imutável da transcrição
- Link bidirecional chat ↔ chamado
- Cliente recebe protocolo automaticamente
- SLA do chamado inicia no momento da conversão
- Pesquisa de satisfação apenas no chamado

**Implementa Requisitos:** SPEC-MH-CHATMGMT-004
**Relacionado a User Stories:** US026

---

## 5. Sistema de Organização e Categorização

### FN015: Tags Contextuais

**Descrição:**
O sistema de tags oferece uma camada adicional de organização que vai além das categorias tradicionais. Tags podem ser aplicadas a diferentes tipos de entidades (chamados, clientes, contatos) e são específicas por tipo, garantindo relevância contextual.

**Características:**
- Tags específicas por tipo de entidade
- Cores semânticas (visual coding)
- Ícones opcionais
- Peso/prioridade para ordenação
- Ativação/desativação (soft delete)

**Tipos de Entidade:**
```
- chamado
- cliente
- contato
- atendimento
- artigo_kb (futuro)
```

**Estrutura de Tag:**
```
Tag
├── id
├── nome
├── tipo_entidade (enum)
├── cor_hex (#3498db)
├── icone (opcional)
├── peso (1-10, ordenação)
├── ativa (boolean)
├── uso_count (denormalized)
└── criada_por (FK usuario)
```

**Casos de Uso:**
- Categorização flexível sem hierarquia rígida
- Marcadores visuais rápidos
- Agrupamento ad-hoc
- Filtros dinâmicos
- Analytics por tag

**Decisões de Design:**
- Tags não hierárquicas (flat)
- Criação dinâmica permitida
- Auto-complete inteligente
- Fusão de tags duplicadas
- Relatório de uso para limpeza

**Implementa Requisitos:** SPEC-MH-TAG-001 a SPEC-MH-TAG-007
**Relacionado a User Stories:** US027, US028

---

### FN016: Categorização Hierárquica

**Descrição:**
As categorias formam uma estrutura hierárquica ilimitada que permite organização detalhada de tipos de chamados. Cada categoria pode ter configurações específicas de SLA, prioridade padrão e regras de atribuição.

**Estrutura de Dados:**
```
Categoria
├── id
├── categoria_pai_id (self-reference)
├── nome
├── ordem (para ordenação)
├── prioridade_padrao (FK)
├── sla_configuracao_id (FK, opcional)
├── departamento_padrao_id (FK, opcional)
└── ativa (boolean)
```

**Exemplo de Hierarquia:**
```
Hardware
├── 1. Computadores
│   ├── 1.1. Desktop
│   │   ├── 1.1.1. Monitor
│   │   └── 1.1.2. CPU
│   └── 1.2. Notebook
├── 2. Impressoras
│   ├── 2.1. Jato de Tinta
│   └── 2.2. Laser
└── 3. Rede
    ├── 3.1. Switch
    └── 3.2. Roteador

Software
├── 1. Sistemas Operacionais
└── 2. Aplicativos
```

**Características:**
- Profundidade ilimitada
- Numeração automática (1, 1.1, 1.1.1)
- Drag-and-drop para reordenação
- Herança de configurações (propagação)
- Fusão de categorias preserva histórico

**Decisões de Design:**
- Self-reference para árvore infinita
- Closure table para queries eficientes
- Soft delete (preserva histórico)
- Configurações específicas sobrescrevem herdadas
- Validação de ciclos

**Implementa Requisitos:** SPEC-MH-CAT-001 a SPEC-MH-CAT-007
**Relacionado a User Stories:** US036

---

### FN017: Filtros Avançados

**Descrição:**
A funcionalidade de filtros permite combinações complexas de critérios usando operadores lógicos. Usuários podem salvar filtros frequentemente utilizados como favoritos e compartilhar filtros úteis com colegas.

**Operadores Lógicos:**
```
AND: Todas as condições devem ser verdadeiras
OR: Pelo menos uma condição deve ser verdadeira
NOT: Inverte a condição
```

**Exemplo de Filtro Complexo:**
```json
{
  "nome": "Urgentes não atribuídos",
  "condicoes": {
    "AND": [
      { "prioridade": { "equals": "urgente" } },
      { "atendente_id": { "isNull": true } },
      { "OR": [
          { "departamento": { "equals": "suporte" } },
          { "departamento": { "equals": "ti" } }
        ]
      }
    ]
  }
}
```

**Tipos de Filtros:**
- Temporários (sessão)
- Salvos (persistidos)
- Favoritos (pinned)
- Compartilhados (equipe)
- Sistema (pré-definidos)

**Interface:**
- Construtor visual de filtros (query builder)
- Preview de resultados em tempo real
- Contadores por filtro
- Exportação de filtros (JSON)
- Importação de filtros

**Decisões de Design:**
- Armazenamento JSON (flexibilidade)
- Tradução para SQL dinâmico
- Cache de resultados frequentes
- Limites de complexidade (prevenir DoS)

**Implementa Requisitos:** SPEC-MH-TAGAPP-004, SPEC-MH-TAGAPP-005, SPEC-MH-TAGAPP-007
**Relacionado a User Stories:** US029

---

## Resumo de Funcionalidades

### Estatísticas
- **Total de Funcionalidades:** 11 (FN007-FN017)
- **Categorias:** 3 módulos (Chamados + Chat + Organização)
- **Requisitos Implementados:** 91 (SPEC-MH-TKT-*, ASSIGN-*, WF-*, COMM-*, CHAT-*, TAG-*, CAT-*)
- **User Stories Cobertas:** US013-US029, US036

### Princípios Arquiteturais
1. **Flexibilidade:** Workflows configuráveis, atribuição inteligente
2. **Tempo Real:** WebSocket para chat, notificações instantâneas
3. **Organização:** Tags + Categorias para máxima flexibilidade
4. **Comunicação:** Interno/externo com histórico completo

---

**Documento gerado a partir de:** `ARCH-module-helpdesk.md`
**Data de divisão:** 2025-01-12
**Versão:** 1.0
