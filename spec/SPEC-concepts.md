# SPEC-concepts.md

## Especificação: Conceitos Fundamentais

### Escopo
Este documento define formalmente os três conceitos fundamentais da plataforma: **Portal**, **Módulo** e **Instância**.

---

## 1. Portal

### Definição
Portal é uma sub-aplicação isolada dentro da plataforma, com suas próprias rotas, módulos e configurações.

### Requisitos de Identificação

**SPEC-C-P-001:** Todo portal DEVE ter um identificador único (`portalId`)

**SPEC-C-P-002:** O `portalId` DEVE ser uma string alfanumérica sem espaços, caracteres especiais ou acentuação

**SPEC-C-P-003:** O `portalId` DEVE ser imutável após criação do portal

### Requisitos de Roteamento

**SPEC-C-P-004:** O portal com `portalId="main"` DEVE usar a rota raiz (`/`)

**SPEC-C-P-005:** Todos os portais exceto "main" DEVEM usar rota `/:portalId/*`

**SPEC-C-P-006:** O portal "main" DEVE ter prioridade absoluta em conflitos de rota

**SPEC-C-P-007:** Portais NÃO DEVEM validar conflitos de rota automaticamente

**SPEC-C-P-008:** Conflitos de rota são responsabilidade do configurador

### Requisitos de Isolamento

**SPEC-C-P-009:** Portais DEVEM ser completamente isolados entre si

**SPEC-C-P-010:** Portais NÃO PODEM compartilhar estado de aplicação diretamente

**SPEC-C-P-011:** Portais NÃO PODEM acessar módulos de outros portais

**SPEC-C-P-012:** Portais PODEM criar links de navegação para outros portais

**SPEC-C-P-013:** Navegação entre portais DEVE comportar-se como navegação entre páginas (sem estado compartilhado)

### Requisitos de Configuração

**SPEC-C-P-014:** Cada portal DEVE declarar explicitamente quais módulos estão ativos

**SPEC-C-P-015:** Cada portal DEVE pertencer a um Ambiente (`realmId`)

**SPEC-C-P-016:** O `realmId` padrão DEVE ser `"default"`

**SPEC-C-P-017:** Portais com mesmo `realmId` DEVEM compartilhar configurações do Ambiente

**SPEC-C-P-018:** Portais PODEM sobrescrever configurações do Ambiente com configurações específicas

### Requisitos de Remoção

**SPEC-C-P-019:** Todo portal DEVE ter uma propriedade `removable` (boolean)

**SPEC-C-P-020:** O portal "main" DEVE ter `removable=false`

**SPEC-C-P-021:** Portais com `removable=false` NÃO PODEM ser removidos da plataforma

**SPEC-C-P-022:** Portais com `removable=true` PODEM ser removidos

**SPEC-C-P-023:** Remoção de portal DEVE desativar todos os seus módulos

**SPEC-C-P-024:** Remoção de portal DEVE remover todas as suas instâncias

### Portais Obrigatórios

**SPEC-C-P-025:** A plataforma DEVE inicializar com o portal "main"

**SPEC-C-P-026:** A plataforma DEVE inicializar com o portal "setup"

**SPEC-C-P-027:** O portal "main" DEVE ter `removable=false`

**SPEC-C-P-028:** O portal "setup" DEVE ter `removable=true`

---

## 2. Ambiente

### Definição
Ambiente é um agrupamento lógico de portais que compartilham configurações comuns, como tema, brand colors e outras propriedades compartilháveis.

### Requisitos de Identificação

**SPEC-C-R-001:** Todo Ambiente DEVE ter um identificador único (`realmId`)

**SPEC-C-R-002:** O `realmId` DEVE ser uma string alfanumérica sem espaços, caracteres especiais ou acentuação

**SPEC-C-R-003:** O `realmId` DEVE ser imutável após criação do Ambiente

### Requisitos de Configuração

**SPEC-C-R-004:** Cada Ambiente DEVE armazenar configurações compartilháveis

**SPEC-C-R-005:** Configurações de Ambiente DEVEM incluir tema (mode, brandColor)

**SPEC-C-R-006:** Configurações de Ambiente PODEM incluir outras propriedades (radius, fonts, etc)

**SPEC-C-R-007:** Portais que pertencem ao Ambiente DEVEM herdar suas configurações

**SPEC-C-R-008:** Portais PODEM sobrescrever configurações herdadas do Ambiente

### Requisitos de Hierarquia

**SPEC-C-R-009:** Sistema DEVE definir valores padrão (nível 1)

**SPEC-C-R-010:** Ambiente PODE sobrescrever valores do sistema (nível 2)

**SPEC-C-R-011:** Portal PODE sobrescrever valores do Ambiente (nível 3)

**SPEC-C-R-012:** Resolução de configuração DEVE seguir ordem: Portal → Ambiente → Sistema

### Requisitos de Remoção

**SPEC-C-R-013:** Todo Ambiente DEVE ter uma propriedade `removable` (boolean)

**SPEC-C-R-014:** O Ambiente "default" DEVE ter `removable=false`

**SPEC-C-R-015:** Ambientes com `removable=false` NÃO PODEM ser removidos

**SPEC-C-R-016:** Ambientes com `removable=true` PODEM ser removidos

**SPEC-C-R-017:** Remoção de Ambiente DEVE reatribuir seus portais ao Ambiente "default"

**SPEC-C-R-018:** Remoção de Ambiente NÃO DEVE remover portais

### Ambiente Obrigatório

**SPEC-C-R-019:** A plataforma DEVE inicializar com o Ambiente "default"

**SPEC-C-R-020:** O Ambiente "default" DEVE ter `removable=false`

**SPEC-C-R-021:** O Ambiente "default" DEVE ter configurações mínimas (theme mode = "system")

---

## 3. Módulo

### Definição
Módulo é uma funcionalidade encapsulada e reutilizável que pode ser ativada em um ou mais portais.

### Requisitos de Identificação

**SPEC-C-M-001:** Todo módulo DEVE ter um identificador único (`moduleId`)

**SPEC-C-M-002:** O `moduleId` DEVE ser uma string alfanumérica sem espaços, caracteres especiais ou acentuação

**SPEC-C-M-003:** O `moduleId` DEVE ser imutável

### Requisitos de Ativação

**SPEC-C-M-004:** Módulos DEVEM ser explicitamente ativados em cada portal

**SPEC-C-M-005:** Um módulo PODE estar ativo em múltiplos portais simultaneamente

**SPEC-C-M-006:** Módulos inativos em um portal NÃO DEVEM ser carregados no frontend daquele portal

**SPEC-C-M-007:** Módulos ativos DEVEM ser carregados via lazy loading na abertura do portal

**SPEC-C-M-008:** Ativação de módulo em runtime DEVE disparar download imediato do módulo

**SPEC-C-M-009:** Desativação de módulo em runtime NÃO DEVE remover o módulo da memória até próximo refresh

**SPEC-C-M-010:** Após refresh, apenas módulos ativos DEVEM ser carregados

### Requisitos de Dependências

**SPEC-C-M-011:** Módulos PODEM declarar dependências de outros módulos

**SPEC-C-M-012:** Dependências DEVEM ser declaradas no manifesto do módulo

**SPEC-C-M-013:** Para ativar módulo B que depende de A, o módulo A DEVE estar ativo no mesmo portal

**SPEC-C-M-014:** Ativação de módulo DEVE ativar automaticamente suas dependências

**SPEC-C-M-015:** Para desativar módulo A, todos os módulos dependentes de A DEVEM ser desativados primeiro

**SPEC-C-M-016:** Dependências circulares NÃO DEVEM ser permitidas

### Requisitos de Tipos

**SPEC-C-M-017:** Módulos DEVEM ser classificados como "Componentes" ou "Funcionalidade"

**SPEC-C-M-018:** Módulos de Componentes fornecem bibliotecas e componentes especializados

**SPEC-C-M-019:** Módulos de Funcionalidade fornecem experiências completas ao usuário

**SPEC-C-M-020:** A classificação do módulo NÃO DEVE afetar seu comportamento técnico

### Requisitos de Exportação

**SPEC-C-M-021:** Módulos PODEM exportar definições de rotas

**SPEC-C-M-022:** Módulos PODEM exportar componentes React

**SPEC-C-M-023:** Módulos PODEM exportar widgets

**SPEC-C-M-024:** Módulos PODEM não exportar rotas (ex: módulo de componentes)

**SPEC-C-M-025:** Rotas exportadas por módulos DEVEM ser relativas (sem prefixo de portal)

**SPEC-C-M-026:** Módulos NÃO DEVEM registrar rotas diretamente no React Router

**SPEC-C-M-027:** Portais DEVEM injetar rotas dos módulos ativos no React Router

### Requisitos de Escopo

**SPEC-C-M-028:** Módulos ativos DEVEM estar disponíveis globalmente dentro do portal

**SPEC-C-M-029:** Módulos ativos em um portal NÃO DEVEM estar acessíveis em outros portais

**SPEC-C-M-030:** Uma vez carregado, o módulo DEVE estar disponível para todos os componentes do portal

---

## 4. Instância

### Definição
Instância é uma configuração específica de um módulo ativado em um portal.

### Requisitos de Criação

**SPEC-C-I-001:** Instâncias SÓ PODEM ser criadas de módulos ativos no portal

**SPEC-C-I-002:** Cada instância DEVE ter um identificador único (`instanceId`) no contexto do portal

**SPEC-C-I-003:** O `instanceId` DEVE ser uma string alfanumérica sem espaços

**SPEC-C-I-004:** Instâncias de portais diferentes PODEM ter o mesmo `instanceId`

**SPEC-C-I-005:** Instâncias do mesmo portal NÃO PODEM ter `instanceId` duplicado

### Requisitos de Múltiplas Instâncias

**SPEC-C-I-006:** Um módulo PODE ter zero ou mais instâncias no mesmo portal

**SPEC-C-I-007:** Não há limite máximo de instâncias por módulo

**SPEC-C-I-008:** Cada instância DEVE ser configurada independentemente

**SPEC-C-I-009:** Instâncias do mesmo módulo PODEM ter configurações completamente diferentes

**SPEC-C-I-010:** Instâncias do mesmo módulo PODEM gerar rotas diferentes

### Requisitos de Configuração

**SPEC-C-I-011:** Cada instância DEVE armazenar suas configurações

**SPEC-C-I-012:** O módulo DEFINE a estrutura de configuração de suas instâncias

**SPEC-C-I-013:** A plataforma NÃO DEVE impor estrutura de configuração específica

**SPEC-C-I-014:** Configurações de instâncias DEVEM ser armazenadas via JQEL

**SPEC-C-I-015:** Configurações de instâncias DEVEM ser acessadas via JQEL

### Requisitos de Ciclo de Vida

**SPEC-C-I-016:** Instâncias DEVEM ser criadas após ativação do módulo

**SPEC-C-I-017:** Ativação de módulo NÃO cria instâncias automaticamente

**SPEC-C-I-018:** Desativação de módulo DEVE remover todas as suas instâncias no portal

**SPEC-C-I-019:** Remoção de portal DEVE remover todas as instâncias daquele portal

**SPEC-C-I-020:** Instâncias PODEM ser editadas sem desativar o módulo

**SPEC-C-I-021:** Instâncias PODEM ser removidas sem desativar o módulo

---

## 5. Relacionamentos

### Hierarquia

**SPEC-C-REL-001:** A hierarquia DEVE ser: Plataforma → Ambiente → Portal → Módulo → Instância

**SPEC-C-REL-002:** Um Ambiente pertence a uma Plataforma

**SPEC-C-REL-003:** Um Portal pertence a um Ambiente

**SPEC-C-REL-004:** Um Módulo ativo pertence a um ou mais Portais

**SPEC-C-REL-005:** Uma Instância pertence a um Módulo ativo em um Portal específico

### Dependências em Cascata

**SPEC-C-REL-006:** Remoção de Ambiente DEVE reatribuir portais ao Ambiente "default"

**SPEC-C-REL-007:** Remoção de Portal DEVE desativar todos os seus módulos

**SPEC-C-REL-008:** Desativação de Módulo DEVE remover todas as suas instâncias

**SPEC-C-REL-009:** Remoção de Instância NÃO DEVE afetar o módulo ou outras instâncias

### Independência

**SPEC-C-REL-010:** Ambientes DEVEM ser independentes entre si

**SPEC-C-REL-011:** Portais DEVEM ser independentes entre si (exceto herança de Ambiente)

**SPEC-C-REL-012:** Módulos DEVEM ser independentes entre si (exceto dependências declaradas)

**SPEC-C-REL-013:** Instâncias DEVEM ser independentes entre si

---

## 6. Estado Inicial

### Requisitos de Instalação

**SPEC-C-S-001:** A plataforma DEVE inicializar com exatamente 1 Ambiente: "default"

**SPEC-C-S-002:** A plataforma DEVE inicializar com exatamente 2 portais: "main" e "setup"

**SPEC-C-S-003:** Ambos os portais DEVEM pertencer ao Ambiente "default"

**SPEC-C-S-004:** O portal "main" DEVE estar vazio (sem módulos ativos)

**SPEC-C-S-005:** O portal "setup" DEVE ter o módulo "setup" pré-ativado

**SPEC-C-S-006:** O portal "setup" DEVE ter uma instância do módulo "setup" pré-criada

### Requisitos de Funcionamento Mínimo

**SPEC-C-S-007:** A plataforma DEVE funcionar com apenas o Ambiente "default"

**SPEC-C-S-008:** A plataforma DEVE funcionar com apenas o portal "main"

**SPEC-C-S-009:** A plataforma DEVE funcionar com zero módulos ativos

**SPEC-C-S-010:** A plataforma DEVE funcionar com zero instâncias criadas

---

*Esta especificação define formalmente os conceitos fundamentais. Implementação técnica em outras especificações.*