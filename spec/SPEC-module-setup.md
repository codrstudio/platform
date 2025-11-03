# SPEC-module-setup.md

## Especificação: Módulo Setup

### Escopo
Este documento consolida e define os requisitos do módulo Setup, o configurador visual da plataforma para gerenciar portais, módulos e instâncias. Este merge integra o conteúdo previamente dividido entre `SPEC-module-setup.md` e `SPEC-module-setup-2.md`.

---

## 1. Definição e Propósito

### Conceito

**SPEC-MS-DE-001:** Módulo Setup é o configurador visual da plataforma

**SPEC-MS-DE-002:** Módulo Setup gerencia portais, módulos e instâncias

**SPEC-MS-DE-003:** Módulo Setup é um módulo como qualquer outro

**SPEC-MS-DE-004:** Módulo Setup NÃO é obrigatório para funcionamento da plataforma

### Alternativas

**SPEC-MS-DE-005:** Configuração PODE ser feita via arquivos JSON no servidor

**SPEC-MS-DE-006:** Módulo Setup facilita configuração mas não é essencial

**SPEC-MS-DE-007:** Produção PODE remover módulo Setup após configuração

**SPEC-MS-DE-008:** Módulo Setup PODE ser reativado via arquivo de configuração quando necessário

---

## 2. Instalação Inicial

### Estado Padrão

**SPEC-MS-IN-001:** Na instalação, módulo Setup DEVE estar pré-ativado no portal "setup"

**SPEC-MS-IN-002:** Portal "setup" DEVE ter rota `/setup`

**SPEC-MS-IN-003:** Portal "setup" DEVE ser removível

**SPEC-MS-IN-004:** Módulo Setup DEVE ter uma instância pré-criada no portal "setup"

### Exemplo de configuração inicial
```json
{
  "portalId": "setup",
  "route": "/setup",
  "removable": true,
  "modules": ["setup"],
  "instances": [
    { "instanceId": "configurator", "moduleId": "setup", "config": {} }
  ]
}
```

### Acesso Inicial

**SPEC-MS-IN-005:** Portal Main DEVE ter link para `/setup` na página inicial (padrão)

**SPEC-MS-IN-006:** Link PODE ser removido após configuração

**SPEC-MS-IN-007:** Rota `/setup` DEVE estar acessível diretamente via URL

---

## 3. Funcionalidades Principais

### Gerenciamento de Portais

**SPEC-MS-FU-001:** DEVE permitir listar todos os portais

**SPEC-MS-FU-002:** DEVE permitir criar novo portal

**SPEC-MS-FU-003:** DEVE permitir editar portal existente

**SPEC-MS-FU-004:** DEVE permitir remover portal (exceto "main")

**SPEC-MS-FU-005:** DEVE validar que portal "main" não pode ser removido

Detalhes adicionais da listagem e criação/edição:
- DEVE exibir para cada portal: `portalId`, `route`, `removable`, status (ativo/inativo), número de módulos ativos
- Criação DEVE solicitar: `portalId` (alfanumérico, sem espaços), `route` (formato de rota válido), `removable` (boolean), `settings-key` (opcional, default: "default")
- DEVE validar unicidade de `portalId` e `route`
- Edição DEVE permitir alterar `route` (exceto para portal "main") e `settings-key`
- Edição NÃO DEVE permitir alterar `portalId` e `removable` (imutáveis após criação)

### Gerenciamento de Módulos

**SPEC-MS-FU-006:** DEVE permitir listar módulos disponíveis

**SPEC-MS-FU-007:** DEVE permitir ativar módulo em portal

**SPEC-MS-FU-008:** DEVE permitir desativar módulo de portal

**SPEC-MS-FU-009:** DEVE mostrar dependências de módulos

**SPEC-MS-FU-010:** DEVE ativar dependências automaticamente (exibir lista do que será ativado)

**SPEC-MS-FU-011:** DEVE validar dependências ao desativar módulo

**SPEC-MS-FU-012:** DEVE listar módulos dependentes ao tentar desativar (e impedir quando houver dependentes)

Detalhes adicionais da listagem:
- DEVE mostrar para cada módulo: `moduleId`, nome legível, descrição, tipo (componentes/funcionalidade), dependências, status em cada portal

### Gerenciamento de Instâncias

**SPEC-MS-FU-013:** DEVE permitir listar instâncias de um módulo

**SPEC-MS-FU-014:** DEVE permitir criar nova instância

**SPEC-MS-FU-015:** DEVE permitir editar instância existente

**SPEC-MS-FU-016:** DEVE permitir remover instância

**SPEC-MS-FU-017:** DEVE validar configuração conforme schema do módulo

Fluxo de criação:
1) Selecionar portal; 2) Selecionar módulo ativo naquele portal; 3) Definir `instanceId` (único no portal); 4) Configurar parâmetros específicos do módulo

---

## 4. Interface de Usuário

### Navegação

**SPEC-MS-UI-001:** DEVE ter navegação clara entre seções: Portais, Módulos, Instâncias

**SPEC-MS-UI-002:** DEVE mostrar breadcrumb da navegação atual

**SPEC-MS-UI-003:** DEVE permitir retornar à página anterior

### Lista de Portais

**SPEC-MS-UI-004:** DEVE mostrar cards ou tabela com todos os portais

**SPEC-MS-UI-005:** DEVE mostrar: nome, rota, removível, módulos ativos

**SPEC-MS-UI-006:** DEVE indicar visualmente portal "main" (não removível)

**SPEC-MS-UI-007:** DEVE ter botão "Novo Portal"

**SPEC-MS-UI-008:** DEVE ter ações: Editar, Remover (se removível), Configurar Módulos

Listagens e formulários (detalhes adicionais):
- Listas DEVEM ser roláveis e ter busca/filtro; PODEM ter ordenação por coluna
- Listas DEVEM ter ações rápidas (ativar, editar, remover)
- Formulários DEVEM ter validação client-side com erros exibidos inline
- Formulários DEVEM ter botões claros (Salvar, Cancelar) e alertar sobre mudanças não salvas

### Formulário de Portal

**SPEC-MS-UI-009:** DEVE ter campos: Portal ID, Nome, Rota, Settings Key

**SPEC-MS-UI-010:** DEVE validar Portal ID (alfanumérico, sem espaços)

**SPEC-MS-UI-011:** DEVE validar Rota (começar com `/`)

**SPEC-MS-UI-012:** DEVE explicar conceito de Settings Key

**SPEC-MS-UI-013:** DEVE mostrar quais portais compartilham Settings Key

**SPEC-MS-UI-014:** DEVE ter toggle para definir se portal é removível (desabilitado para "main")

**SPEC-MS-UI-015:** DEVE ter preview da rota final

### Lista de Módulos (por Portal)

**SPEC-MS-UI-016:** DEVE mostrar módulos disponíveis

**SPEC-MS-UI-017:** DEVE separar: Ativos, Disponíveis

**SPEC-MS-UI-018:** DEVE mostrar: Nome, Tipo, Versão, Dependências

**SPEC-MS-UI-019:** DEVE indicar visualmente dependências

**SPEC-MS-UI-020:** DEVE ter toggle para ativar/desativar módulo

**SPEC-MS-UI-021:** DEVE mostrar alerta ao desativar módulo com dependentes

### Lista de Instâncias (por Módulo)

**SPEC-MS-UI-022:** DEVE mostrar instâncias do módulo no portal

**SPEC-MS-UI-023:** DEVE mostrar: Nome, ID, Status, Configuração (resumo)

**SPEC-MS-UI-024:** DEVE ter botão "Nova Instância"

**SPEC-MS-UI-025:** DEVE ter ações: Editar, Remover

**SPEC-MS-UI-026:** DEVE permitir duplicar instância (copiar configuração)

### Formulário de Instância

**SPEC-MS-UI-027:** DEVE gerar formulário baseado no schema do módulo

**SPEC-MS-UI-028:** DEVE usar React Hook Form + Zod

**SPEC-MS-UI-029:** DEVE validar campos conforme schema

**SPEC-MS-UI-030:** DEVE mostrar erros de validação inline

**SPEC-MS-UI-031:** DEVE ter preview quando aplicável

**SPEC-MS-UI-032:** DEVE salvar via JQEL mutation

---

## 5. Configuração de Tema

### Interface

**SPEC-MS-TE-001:** DEVE ter seção "Tema" para cada portal

**SPEC-MS-TE-002:** DEVE permitir selecionar tema: light, dark, system

**SPEC-MS-TE-003:** DEVE ter color picker para brand color

**SPEC-MS-TE-004:** DEVE mostrar preview em tempo real

**SPEC-MS-TE-005:** DEVE mostrar preview em ambos os modos (claro e escuro)

### Settings Key

**SPEC-MS-TE-006:** DEVE permitir configurar Settings Key do portal

**SPEC-MS-TE-007:** DEVE explicar que portais com mesmo Settings Key compartilham tema

**SPEC-MS-TE-008:** DEVE mostrar lista de portais que compartilham Settings Key

**SPEC-MS-TE-009:** DEVE permitir criar novo Settings Key (tema independente)

### Validação de Contraste

**SPEC-MS-TE-010:** DEVE validar contraste ao escolher brand color

**SPEC-MS-TE-011:** DEVE avisar se contraste insuficiente (< WCAG AA)

**SPEC-MS-TE-012:** DEVE sugerir ajuste automático de lightness

**SPEC-MS-TE-013:** DEVE permitir usuário aceitar ou rejeitar ajuste

**SPEC-MS-TE-014:** DEVE mostrar valores de contraste calculados

---

## 6. Platform Settings (Visualização)

### Aba Read-Only

**SPEC-MS-PS-001:** DEVE ter aba "Platform Settings"

**SPEC-MS-PS-002:** Aba DEVE ser read-only (não editável)

**SPEC-MS-PS-003:** DEVE exibir mensagem clara sobre como editar

**SPEC-MS-PS-004:** Mensagem: "Estas configurações são definidas no arquivo `.env` no servidor. Alterações requerem edição manual do arquivo e restart da aplicação."

### Informações Exibidas

**SPEC-MS-PS-005:** DEVE mostrar `N8N_BASE_URL`

**SPEC-MS-PS-006:** DEVE mostrar `REDIS_URL` (mascarar senha se presente)

**SPEC-MS-PS-007:** DEVE mostrar `NODE_ENV`

**SPEC-MS-PS-008:** DEVE mostrar `BACKEND_URL`

**SPEC-MS-PS-009:** NÃO DEVE mostrar secrets (`JWT_SECRET`, `N8N_SHARED_SECRET`, etc)

### Health Checks

**SPEC-MS-PS-010:** DEVE incluir indicadores de saúde

**SPEC-MS-PS-011:** Indicador n8n: conectado/desconectado

**SPEC-MS-PS-012:** Indicador Redis: conectado/desconectado

**SPEC-MS-PS-013:** Indicador Backend: funcionando/erro

**SPEC-MS-PS-014:** Health checks DEVEM ser via requisições ao Backend

**SPEC-MS-PS-015:** Health checks DEVEM ser atualizados periodicamente

**SPEC-MS-PS-016:** DEVE mostrar timestamp da última verificação

---

## 7. Persistência de Configurações

### Salvamento

**SPEC-MS-PE-001:** Configurações DEVEM ser salvas via JQEL

**SPEC-MS-PE-002:** Para entidades de configuração da plataforma (portais, módulos, instâncias) o schema DEVE ser `platform`. Para settings globais, o schema PODE ser `backend` ou `system` conforme escopo.

**SPEC-MS-PE-003:** Operação DEVE ser `mutate` com action apropriada

**SPEC-MS-PE-004:** Salvamento DEVE ser via TanStack Query mutation

### Validação

**SPEC-MS-PE-005:** DEVE validar no frontend antes de salvar

**SPEC-MS-PE-006:** DEVE validar no backend antes de persistir

**SPEC-MS-PE-007:** Erros DEVEM ser exibidos claramente

**SPEC-MS-PE-008:** Sucesso DEVE mostrar feedback visual

### Carregamento

**SPEC-MS-PE-009:** Configurações DEVEM ser carregadas via JQEL

**SPEC-MS-PE-010:** Carregamento DEVE ser via TanStack Query

**SPEC-MS-PE-011:** Cache DEVE ser gerenciado pelo TanStack Query

**SPEC-MS-PE-012:** Invalidação DEVE acontecer após salvamento

---

## 8. Validações

### Portais

**SPEC-MS-VA-001:** Portal ID DEVE ser único

**SPEC-MS-VA-002:** Portal ID DEVE ser alfanumérico (sem espaços, caracteres especiais)

**SPEC-MS-VA-003:** Rota DEVE começar com `/`

**SPEC-MS-VA-004:** Rota NÃO DEVE conflitar com rotas estáticas (`/health`, `/assets/*`)

**SPEC-MS-VA-005:** Portal "main" NÃO PODE ser removido e DEVE ter `route="/"`

**SPEC-MS-VA-006:** Settings Key DEVE ser alfanumérico

### Módulos

**SPEC-MS-VA-007:** Dependências DEVEM estar ativas antes de ativar módulo

**SPEC-MS-VA-008:** Módulos dependentes DEVEM ser desativados antes de desativar módulo

**SPEC-MS-VA-009:** NÃO permitir criar dependência circular

### Instâncias

**SPEC-MS-VA-010:** Instance ID DEVE ser único no portal

**SPEC-MS-VA-011:** Configuração DEVE seguir schema do módulo

**SPEC-MS-VA-012:** Campos obrigatórios DEVEM ser preenchidos

**SPEC-MS-VA-013:** Tipos de dados DEVEM ser respeitados

Validações adicionais:
- Não é possível ativar módulo sem suas dependências
- Não é possível desativar módulo se outros dependem dele
- Instância SÓ PODE ser criada de módulo ativo

---

## 9. Feedback e Confirmações

### Ações Destrutivas

**SPEC-MS-FB-001:** Remover portal DEVE pedir confirmação

**SPEC-MS-FB-002:** Desativar módulo com dependentes DEVE pedir confirmação

**SPEC-MS-FB-003:** Remover instância DEVE pedir confirmação

**SPEC-MS-FB-004:** Confirmação DEVE listar consequências (ex: "X instâncias serão removidas")

### Feedback de Sucesso

**SPEC-MS-FB-005:** Salvamento bem-sucedido DEVE mostrar toast/snackbar

**SPEC-MS-FB-006:** Feedback DEVE desaparecer automaticamente após 3-5 segundos

**SPEC-MS-FB-007:** Feedback DEVE incluir ação de desfazer quando possível

### Feedback de Erro

**SPEC-MS-FB-008:** Erros DEVEM ser exibidos claramente

**SPEC-MS-FB-009:** Erros DEVEM indicar campo específico quando aplicável

**SPEC-MS-FB-010:** Erros DEVEM sugerir solução quando possível

**SPEC-MS-FB-011:** Erros DEVEM permanecer visíveis até serem corrigidos

---

## 10. Estados de Loading

**SPEC-MS-LO-001:** Listagens DEVEM mostrar skeleton loader durante carregamento

**SPEC-MS-LO-002:** Formulários DEVEM desabilitar inputs durante salvamento

**SPEC-MS-LO-003:** Botões DEVEM mostrar spinner durante operação

**SPEC-MS-LO-004:** Health checks DEVEM mostrar indicador de carregamento

**SPEC-MS-LO-005:** Estados vazios DEVEM ter mensagem apropriada

**SPEC-MS-LO-006:** Exemplo: "Nenhum portal criado ainda. Clique em 'Novo Portal' para começar."

---

## 11. Responsividade

**SPEC-MS-RE-001:** Interface DEVE ser responsiva

**SPEC-MS-RE-002:** Mobile DEVE usar layout vertical/stacked

**SPEC-MS-RE-003:** Tablet PODE usar layout híbrido

**SPEC-MS-RE-004:** Desktop DEVE aproveitar espaço horizontal

**SPEC-MS-RE-005:** Navegação DEVE adaptar-se ao tamanho da tela

**SPEC-MS-RE-006:** Formulários DEVEM ter inputs apropriados para mobile

---

## 12. Acessibilidade

**SPEC-MS-AC-001:** Interface DEVE seguir WCAG 2.1 nível AA

**SPEC-MS-AC-002:** Navegação DEVE ser acessível via teclado

**SPEC-MS-AC-003:** Focus DEVE ser visível

**SPEC-MS-AC-004:** Botões DEVEM ter labels descritivos

**SPEC-MS-AC-005:** Formulários DEVEM ter labels e hints

**SPEC-MS-AC-006:** Erros DEVEM ser anunciados para leitores de tela

**SPEC-MS-AC-007:** Modais DEVEM prender foco (focus trap)

---

## 13. Segurança

### Autenticação

**SPEC-MS-SE-001:** Acesso ao módulo Setup PODE ser protegido

**SPEC-MS-SE-002:** Proteção via módulo de Auth (ativado no portal setup)

**SPEC-MS-SE-003:** Sem auth, qualquer um pode acessar `/setup`

**SPEC-MS-SE-004:** Em produção, RECOMENDA-SE proteger ou remover portal setup

### Autorização

**SPEC-MS-SE-005:** Operações de configuração PODEM requerer permissões específicas

**SPEC-MS-SE-006:** Validação via Canal de Autenticação (`/api/1/auth/authorize`)

**SPEC-MS-SE-007:** Usuário sem permissão DEVE ver mensagem apropriada

### Validação

**SPEC-MS-SE-008:** Toda entrada de usuário DEVE ser validada

**SPEC-MS-SE-009:** Validação no frontend E backend

**SPEC-MS-SE-010:** Sanitizar inputs para prevenir XSS

---

## 14. Rotas do Módulo

**SPEC-MS-RO-001:** Módulo Setup DEVE exportar rotas

**SPEC-MS-RO-002:** Rota principal: `/` (relativa ao portal)

**SPEC-MS-RO-003:** Sub-rotas:
- `/portals` - Lista de portais
- `/portals/new` - Criar portal
- `/portals/:portalId` - Editar portal
- `/portals/:portalId/modules` - Módulos do portal
- `/portals/:portalId/modules/:moduleId/instances` - Instâncias do módulo
- `/portals/:portalId/modules/:moduleId/instances/new` - Criar instância
- `/portals/:portalId/modules/:moduleId/instances/:instanceId` - Editar instância
- `/portals/:portalId/theme` - Configurar tema
- `/platform-settings` - Visualizar platform settings

**SPEC-MS-RO-004:** Rotas DEVEM usar React Router

**SPEC-MS-RO-005:** Navegação DEVE preservar estado quando possível

---

## 15. Integração com Sistema de Eventos

**SPEC-MS-EV-001:** Módulo Setup NÃO precisa escutar eventos SSE

**SPEC-MS-EV-002:** Configurações são carregadas sob demanda (via JQEL)

**SPEC-MS-EV-003:** Invalidação de cache acontece após salvamento (TanStack Query)

---

## 16. Documentação Interna

**SPEC-MS-DO-001:** Interface DEVE ter tooltips explicativos

**SPEC-MS-DO-002:** Conceitos complexos DEVEM ter help text

**SPEC-MS-DO-003:** PODE ter link para documentação externa

**SPEC-MS-DO-004:** Exemplos DEVEM ser fornecidos quando apropriado

---

## 17. Testes

**SPEC-MS-TE-001:** Componentes DEVEM ter testes unitários

**SPEC-MS-TE-002:** Formulários DEVEM ter testes de validação

**SPEC-MS-TE-003:** Fluxos principais DEVEM ter testes de integração

**SPEC-MS-TE-004:** Exemplo: "Criar portal → Ativar módulo → Criar instância"

---

## 18. Manifesto do Módulo

**SPEC-MS-MA-001:** Manifesto do módulo Setup:
```typescript
{
  id: "setup",
  name: "Setup",
  version: "1.0.0",
  type: "functionality",
  description: "Configurador visual de portais, módulos e instâncias",
  author: "Platform Team",
  dependencies: [],
  icon: "Settings",
  category: "system"
}
```

---

## 19. Remoção em Produção

**SPEC-MS-RM-001:** Portal setup PODE ser removido em produção

**SPEC-MS-RM-002:** Remoção via arquivo de configuração no servidor

**SPEC-MS-RM-003:** Após remoção, configurações permanecem (em arquivos JSON)

**SPEC-MS-RM-004:** Reativação PODE ser feita editando arquivo de configuração

**SPEC-MS-RM-005:** Reativação requer restart da aplicação

Processo e salvaguardas:
- Remoção DEVE exigir confirmação explícita e alertar sobre módulos/instâncias afetados
- Reativação DEVE validar integridade da configuração ao reabrir o portal "setup"

---

## 20. Integração com JQEL (detalhada)

### Schema e Entities

**SPEC-MS-JQ-001:** Usar `schema=platform` para gerenciar: `portal`, `module`, `instance`, e opcionalmente `module_dependency`

### Queries

Exemplos:
```typescript
{ schema: 'platform', operation: 'select', entity: 'portal' }
{ schema: 'platform', operation: 'select', entity: 'module' }
{ schema: 'platform', operation: 'select', entity: 'instance', where: { portalId: 'app' } }
```

### Mutations

Criar portal:
```typescript
{ schema: 'platform', operation: 'mutate', entity: 'portal', action: 'insert', values: { portalId: 'sac', route: '/sac', removable: true, settingsKey: 'default' } }
```

Ativar módulo:
```typescript
{ schema: 'platform', operation: 'mutate', entity: 'module', action: 'activate', values: { portalId: 'app', moduleId: 'chat' } }
```

Criar instância:
```typescript
{ schema: 'platform', operation: 'mutate', entity: 'instance', action: 'insert', values: { portalId: 'app', moduleId: 'chat', instanceId: 'support-chat', config: {} } }
```

Observações: Carregamento e salvamento DEVEM integrar com TanStack Query (cache e invalidação)

---

## 21. Componentes Exportados

### Obrigatórios

**SPEC-MS-EX-001:** Exportar:
- `<SetupDashboard />` - Interface principal
- `<PortalManager />` - Gerenciamento de portais
- `<ModuleManager />` - Gerenciamento de módulos
- `<InstanceManager />` - Gerenciamento de instâncias

### Opcionais

**SPEC-MS-EX-002:** PODE exportar:
- `<DependencyGraph />` - Visualização de dependências
- `<ConfigPreview />` - Preview da estrutura
- `<ConfigExporter />` - Export/Import
- `<ConfigValidator />` - Validação

---

## 22. Exemplos de Fluxo

### Criar Aplicação Completa
```
1. Criar portal "app" com route="/app"
2. Ativar módulo "auth" no portal "app" (dependências: nenhuma)
3. Criar instância "login-app" do módulo "auth"
4. Ativar módulo "dashboard" no portal "app" (dependências: App Components ativado automaticamente)
5. Criar instância "metrics" do módulo "dashboard"
6. Ativar módulo "menu" no portal "app"
7. Criar instância "main-menu" do módulo "menu"
```

### Remover Portal Completo
```
1. Usuário clica "Remover" no portal "sac"
2. Sistema alerta consequências (módulos e instâncias serão removidos)
3. Usuário confirma
4. Sistema remove instâncias, desativa módulos e remove o portal
5. Sistema exibe confirmação
```

---

## 23. Funcionalidades Opcionais

### Visualização de Dependências
- Exibir grafo visual de dependências entre módulos; destacar ativos vs inativos

### Preview de Configuração
- Exibir preview hierárquico da estrutura de Portais → Módulos → Instâncias

### Export/Import de Configuração
- Exportar configuração completa como JSON; Importar de arquivo JSON (com validação e opção de import parcial)

### Histórico de Mudanças
- Manter histórico com timestamp, usuário, tipo de mudança e snapshot; permitir rollback

### Validação de Configuração
- Validar estrutura completa (conflitos de rotas, dependências quebradas, instâncias órfãs, portais sem módulos)

### Templates de Configuração
- Oferecer templates predefinidos que criam portais, ativam módulos e instâncias automaticamente

