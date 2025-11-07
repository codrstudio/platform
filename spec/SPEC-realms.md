# SPEC-realms.md

## Especificação: Sistema de Reinos

### Escopo
Este documento define os requisitos do sistema de Reinos, que permite agrupar portais para compartilhar configurações comuns como tema, brand colors e outras propriedades.

### Referências
- **SPEC-concepts.md**: Definição conceitual de Reino
- **SPEC-theming.md**: Hierarquia de configuração de tema
- **SPEC-module-setup.md**: Interface de gerenciamento

---

## 1. Definição

### Conceito

**SPEC-RM-CO-001:** Reino é um agrupamento lógico de portais

**SPEC-RM-CO-002:** Reino armazena configurações compartilháveis

**SPEC-RM-CO-003:** Portais pertencem a um Reino e herdam suas configurações

**SPEC-RM-CO-004:** Portais PODEM sobrescrever configurações herdadas

### Propósito

**SPEC-RM-CO-005:** Facilitar gerenciamento de múltiplos portais com tema consistente

**SPEC-RM-CO-006:** Reduzir duplicação de configurações

**SPEC-RM-CO-007:** Permitir customização granular (Reino ou Portal)

**SPEC-RM-CO-008:** Escalar para dezenas ou centenas de portais

---

## 2. Estrutura

### Identificação

**SPEC-RM-ST-001:** Todo Reino DEVE ter um `realmId` único

**SPEC-RM-ST-002:** O `realmId` DEVE ser alfanumérico sem espaços ou caracteres especiais

**SPEC-RM-ST-003:** O `realmId` DEVE ser imutável após criação

**SPEC-RM-ST-004:** Convenção: usar kebab-case (ex: `"corporativo"`, `"parceiros-externos"`)

### Metadados

**SPEC-RM-ST-005:** Todo Reino DEVE ter um `name` (nome exibido)

**SPEC-RM-ST-006:** O `name` PODE conter espaços e acentuação

**SPEC-RM-ST-007:** O `name` PODE ser editado após criação

**SPEC-RM-ST-008:** Reino PODE ter `description` (opcional)

### Remoção

**SPEC-RM-ST-009:** Todo Reino DEVE ter propriedade `removable` (boolean)

**SPEC-RM-ST-010:** Reino com `removable=false` NÃO PODE ser removido

**SPEC-RM-ST-011:** Reino com `removable=true` PODE ser removido

**SPEC-RM-ST-012:** Remoção DEVE reatribuir portais ao Reino "default"

### Configurações

**SPEC-RM-ST-013:** Reino DEVE ter objeto `config` com propriedades compartilháveis

**SPEC-RM-ST-014:** Configurações DEVEM ser opcionais (valores vazios = usar default do sistema)

**SPEC-RM-ST-015:** Estrutura do `config`:
```typescript
{
  theme?: {
    mode?: "light" | "dark" | "system";
    brandColor?: string;  // HSL format
    radius?: string;      // CSS value (ex: "0.5rem")
  }
  // Expansível para outras propriedades no futuro
}
```

---

## 3. Reino Default

### Obrigatoriedade

**SPEC-RM-DF-001:** Plataforma DEVE inicializar com Reino "default"

**SPEC-RM-DF-002:** Reino "default" DEVE ter `removable=false`

**SPEC-RM-DF-003:** Reino "default" NÃO PODE ser renomeado

**SPEC-RM-DF-004:** Reino "default" NÃO PODE ter `realmId` alterado

### Configuração Inicial

**SPEC-RM-DF-005:** Reino "default" DEVE ter configurações mínimas:
```json
{
  "realmId": "default",
  "name": "Padrão",
  "removable": false,
  "config": {
    "theme": {
      "mode": "system"
    }
  }
}
```

**SPEC-RM-DF-006:** Brand color do Reino "default" DEVE usar default do sistema

**SPEC-RM-DF-007:** Portais sem `realmId` explícito DEVEM pertencer ao Reino "default"

### Comportamento como Fallback

**SPEC-RM-DF-008:** Remoção de qualquer Reino DEVE reatribuir seus portais ao "default"

**SPEC-RM-DF-009:** "default" é o destino seguro para portais órfãos

---

## 4. Hierarquia de Configuração

### Três Níveis

**SPEC-RM-HC-001:** Configuração DEVE seguir hierarquia de 3 níveis

**SPEC-RM-HC-002:** Nível 1 (Sistema): Valores hardcoded na aplicação

**SPEC-RM-HC-003:** Nível 2 (Reino): Valores em `config/realms.json`

**SPEC-RM-HC-004:** Nível 3 (Portal): Overrides específicos do portal

### Resolução de Valores

**SPEC-RM-HC-005:** Algoritmo de resolução:
```
1. Portal tem override para a propriedade? → Usar valor do Portal
2. Senão, Reino tem configuração? → Usar valor do Reino
3. Senão → Usar default do Sistema
```

**SPEC-RM-HC-006:** Resolução DEVE ser por propriedade individual

**SPEC-RM-HC-007:** Portal PODE sobrescrever `theme.mode` mas herdar `theme.brandColor`

**SPEC-RM-HC-008:** Herança NÃO é em bloco (propriedades independentes)

### Defaults do Sistema (Nível 1)

**SPEC-RM-HC-009:** Sistema DEVE definir valores padrão para todas as propriedades

**SPEC-RM-HC-010:** Defaults hardcoded:
```typescript
{
  theme: {
    mode: "system",
    brandColor: "221 83% 53%",  // Azul shadcn/ui
    radius: "0.5rem"
  }
}
```

**SPEC-RM-HC-011:** Defaults NÃO são armazenados, apenas aplicados

---

## 5. CRUD de Reinos

### Listar Reinos

**SPEC-RM-CR-001:** DEVE existir operação `GET /api/realms`

**SPEC-RM-CR-002:** Resposta DEVE listar todos os Reinos

**SPEC-RM-CR-003:** Cada item DEVE incluir: `realmId`, `name`, `removable`, `config`

**SPEC-RM-CR-004:** Ordem DEVE ser: "default" primeiro, depois alfabética

### Buscar Reino por ID

**SPEC-RM-CR-005:** DEVE existir operação `GET /api/realms/:realmId`

**SPEC-RM-CR-006:** Se Reino não existe, retornar 404

**SPEC-RM-CR-007:** Resposta DEVE incluir contagem de portais associados

### Criar Reino

**SPEC-RM-CR-008:** DEVE existir operação `POST /api/realms`

**SPEC-RM-CR-009:** Campos obrigatórios: `realmId`, `name`

**SPEC-RM-CR-010:** Campos opcionais: `description`, `config`

**SPEC-RM-CR-011:** DEVE validar unicidade de `realmId`

**SPEC-RM-CR-012:** DEVE validar formato de `realmId` (alfanumérico, kebab-case)

**SPEC-RM-CR-013:** `removable` DEVE ser `true` por padrão

**SPEC-RM-CR-014:** NÃO DEVE permitir criar Reino com `realmId="default"`

### Atualizar Reino

**SPEC-RM-CR-015:** DEVE existir operação `PATCH /api/realms/:realmId`

**SPEC-RM-CR-016:** DEVE permitir atualizar: `name`, `description`, `config`

**SPEC-RM-CR-017:** NÃO DEVE permitir atualizar: `realmId`, `removable`

**SPEC-RM-CR-018:** NÃO DEVE permitir renomear Reino "default"

**SPEC-RM-CR-019:** Mudança em `config` DEVE propagar para portais do Reino

### Deletar Reino

**SPEC-RM-CR-020:** DEVE existir operação `DELETE /api/realms/:realmId`

**SPEC-RM-CR-021:** NÃO DEVE permitir deletar Reino com `removable=false`

**SPEC-RM-CR-022:** NÃO DEVE permitir deletar Reino "default"

**SPEC-RM-CR-023:** DEVE reatribuir portais do Reino para "default"

**SPEC-RM-CR-024:** DEVE remover configurações do Reino de localStorage

**SPEC-RM-CR-025:** DEVE retornar lista de portais reatribuídos na resposta

---

## 6. Relacionamento com Portais

### Atribuição

**SPEC-RM-PR-001:** Todo Portal DEVE ter propriedade `realmId`

**SPEC-RM-PR-002:** Valor padrão DEVE ser `"default"`

**SPEC-RM-PR-003:** `realmId` DEVE referenciar Reino existente

**SPEC-RM-PR-004:** Validação DEVE impedir `realmId` inexistente

### Mudança de Reino

**SPEC-RM-PR-005:** Portal PODE ter `realmId` alterado

**SPEC-RM-PR-006:** Mudança DEVE aplicar imediatamente (sem reload)

**SPEC-RM-PR-007:** Overrides do Portal DEVEM ser preservados

**SPEC-RM-PR-008:** Propriedades herdadas DEVEM atualizar para novo Reino

### Herança de Configuração

**SPEC-RM-PR-009:** Portal herda configurações do Reino por padrão

**SPEC-RM-PR-010:** Herança é por propriedade, não em bloco

**SPEC-RM-PR-011:** Portal SEM override → usa valor do Reino

**SPEC-RM-PR-012:** Portal COM override → ignora valor do Reino

### Contagem de Portais

**SPEC-RM-PR-013:** Reino DEVE rastrear quantos portais possui

**SPEC-RM-PR-014:** Contagem DEVE ser calculada dinamicamente

**SPEC-RM-PR-015:** API de listagem DEVE incluir contagem

---

## 7. Persistência

### Armazenamento Backend

**SPEC-RM-PS-001:** Reinos DEVEM ser armazenados em `config/realms.json`

**SPEC-RM-PS-002:** Estrutura do arquivo:
```json
{
  "realms": {
    "default": {
      "realmId": "default",
      "name": "Padrão",
      "removable": false,
      "config": {
        "theme": {
          "mode": "system"
        }
      }
    },
    "corporativo": {
      "realmId": "corporativo",
      "name": "Corporativo",
      "removable": true,
      "description": "Tema corporativo da empresa",
      "config": {
        "theme": {
          "mode": "light",
          "brandColor": "210 40% 50%",
          "radius": "0.25rem"
        }
      }
    }
  }
}
```

**SPEC-RM-PS-003:** Arquivo DEVE ser criado automaticamente se não existir

**SPEC-RM-PS-004:** Criação automática DEVE incluir Reino "default"

### Armazenamento Frontend

**SPEC-RM-PS-005:** Frontend DEVE armazenar configurações em localStorage

**SPEC-RM-PS-006:** Chaves de Reino: `realm:{realmId}:{property}` (ex: `realm:default:theme`)

**SPEC-RM-PS-007:** Chaves de Portal: `portal:{portalId}:{property}` (ex: `portal:main:theme`)

**SPEC-RM-PS-008:** Configurações customizadas por Portal DEVEM permanecer com ele mesmo se mudar de Reino

**SPEC-RM-PS-009:** Chave de Portal NÃO inclui realmId, pois o portal mantém suas customizações independente do Reino

**SPEC-RM-PS-010:** Sincronização via storage events entre abas

### Acesso via JQEL

**SPEC-RM-PS-011:** Reinos DEVEM ser acessíveis via JQEL

**SPEC-RM-PS-012:** Schema: `backend` ou `system`

**SPEC-RM-PS-013:** Entity: `realm`

**SPEC-RM-PS-014:** Operações: `select`, `insert`, `update`, `delete`

**SPEC-RM-PS-015:** Exemplo:
```json
{
  "schema": "backend",
  "select": "realm",
  "where": { "realmId": { "$eq": "default" } }
}
```

---

## 8. Interface de Gerenciamento

### Módulo Setup

**SPEC-RM-UI-001:** Módulo Setup DEVE ter página "Reinos"

**SPEC-RM-UI-002:** Página DEVE listar todos os Reinos

**SPEC-RM-UI-003:** Lista DEVE mostrar: nome, quantidade de portais, ações

**SPEC-RM-UI-004:** Reino "default" DEVE estar visível mas sem opção de deletar

### Criar Reino

**SPEC-RM-UI-005:** DEVE ter botão "Criar Reino"

**SPEC-RM-UI-006:** Formulário DEVE pedir: `realmId`, `name`, `description`

**SPEC-RM-UI-007:** Formulário DEVE permitir configurar tema

**SPEC-RM-UI-008:** Preview DEVE mostrar tema ao vivo

**SPEC-RM-UI-009:** Validação em tempo real de `realmId`

### Editar Reino

**SPEC-RM-UI-010:** DEVE ter ação "Editar" em cada Reino

**SPEC-RM-UI-011:** Formulário DEVE permitir editar: `name`, `description`, `config`

**SPEC-RM-UI-012:** NÃO DEVE permitir editar `realmId`

**SPEC-RM-UI-013:** Mudança DEVE avisar quantos portais serão afetados

### Deletar Reino

**SPEC-RM-UI-014:** DEVE ter ação "Deletar" em Reinos `removable=true`

**SPEC-RM-UI-015:** Confirmação DEVE avisar sobre reatribuição de portais

**SPEC-RM-UI-016:** Confirmação DEVE listar portais que serão reatribuídos

**SPEC-RM-UI-017:** Reino "default" NÃO DEVE ter botão de deletar

### Página de Portais

**SPEC-RM-UI-018:** Formulário de Portal DEVE ter campo "Reino"

**SPEC-RM-UI-019:** Campo DEVE ser dropdown com Reinos disponíveis

**SPEC-RM-UI-020:** DEVE mostrar configurações herdadas do Reino

**SPEC-RM-UI-021:** DEVE ter toggle "Customizar tema deste portal"

**SPEC-RM-UI-022:** Se toggle ativo, mostrar controles de tema

**SPEC-RM-UI-023:** Se toggle inativo, mostrar "Herdando de Reino [nome]"

---

## 9. Sincronização e Eventos

### Mudança em Reino

**SPEC-RM-EV-001:** Mudança em Reino DEVE disparar evento SSE

**SPEC-RM-EV-002:** Evento DEVE ter tipo `realm-config-changed`

**SPEC-RM-EV-003:** Payload DEVE incluir `realmId` e propriedades alteradas

**SPEC-RM-EV-004:** Frontend DEVE atualizar localStorage de portais afetados

**SPEC-RM-EV-005:** Frontend DEVE aplicar novo tema imediatamente

### Mudança em Portal

**SPEC-RM-EV-006:** Override de Portal DEVE disparar evento SSE

**SPEC-RM-EV-007:** Evento DEVE ter tipo `portal-config-changed`

**SPEC-RM-EV-008:** Payload DEVE incluir `portalId` e propriedades alteradas

**SPEC-RM-EV-009:** Frontend DEVE atualizar apenas localStorage daquele portal

### Sincronização entre Abas

**SPEC-RM-EV-010:** Mudanças DEVEM sincronizar via storage events

**SPEC-RM-EV-011:** Abas abertas DEVEM detectar mudanças em tempo real

**SPEC-RM-EV-012:** Tema DEVE atualizar imediatamente em todas as abas

---

## 10. Migração

### De settings-key para realmId

**SPEC-RM-MG-001:** Implementação DEVE migrar `settings-key` existente

**SPEC-RM-MG-002:** Portais com `settingsKey="default"` → `realmId="default"`

**SPEC-RM-MG-003:** Portais com `settingsKey` custom → criar Reino correspondente

**SPEC-RM-MG-004:** Migração DEVE ser automática na primeira execução

### Retrocompatibilidade localStorage

**SPEC-RM-MG-005:** Frontend DEVE ler chaves antigas de localStorage

**SPEC-RM-MG-006:** Prioridade: chave nova → chave antiga → default

**SPEC-RM-MG-007:** Após ler chave antiga, DEVE migrar para formato novo

**SPEC-RM-MG-008:** Chaves antigas PODEM ser removidas após período de graça

---

## 11. Validações

### Regras de Negócio

**SPEC-RM-VL-001:** NÃO PODE deletar Reino com portais sem reatribuir

**SPEC-RM-VL-002:** NÃO PODE alterar `realmId` de Reino existente

**SPEC-RM-VL-003:** NÃO PODE criar dois Reinos com mesmo `realmId`

**SPEC-RM-VL-004:** NÃO PODE criar Reino com `realmId` reservado ("default", "system")

**SPEC-RM-VL-005:** NÃO PODE atribuir Portal a Reino inexistente

### Formato de realmId

**SPEC-RM-VL-006:** DEVE ser alfanumérico, hífen permitido

**SPEC-RM-VL-007:** DEVE ter entre 2 e 50 caracteres

**SPEC-RM-VL-008:** DEVE começar com letra

**SPEC-RM-VL-009:** Regex sugerido: `^[a-z][a-z0-9-]*$`

### Formato de Configuração

**SPEC-RM-VL-010:** `theme.mode` DEVE ser "light", "dark" ou "system"

**SPEC-RM-VL-011:** `theme.brandColor` DEVE ser HSL válido

**SPEC-RM-VL-012:** `theme.radius` DEVE ser CSS value válido

---

## 12. Casos de Uso

### Caso 1: Empresa com múltiplos departamentos

**Cenário**: Empresa quer tema corporativo padrão, mas marketing quer cores próprias

**Solução**:
1. Criar Reino "corporativo" com brand color azul
2. Atribuir maioria dos portais ao Reino "corporativo"
3. Portal "marketing" pertence ao Reino "corporativo" mas tem override de brandColor

**Benefício**: Marketing compartilha mode (light/dark/system) mas usa suas cores

### Caso 2: Multi-tenancy B2B

**Cenário**: SaaS com clientes que querem whitelabel

**Solução**:
1. Criar Reino para cada cliente (ex: "cliente-a", "cliente-b")
2. Configurar brand colors específicas por Reino
3. Portais do cliente pertencem ao Reino do cliente

**Benefício**: Cada cliente tem tema próprio, fácil gerenciar

### Caso 3: Ambientes (dev, staging, prod)

**Cenário**: Diferenciar visualmente ambientes

**Solução**:
1. Reino "development" com brand color laranja
2. Reino "staging" com brand color amarelo
3. Reino "production" com brand color azul

**Benefício**: Desenvolvedor identifica ambiente visualmente

---

*Esta especificação define o sistema de Reinos. Ver SPEC-concepts.md para definição conceitual e SPEC-theming.md para detalhes de tema.*
