# 2025-11-07: Sistema de Reinos para Agrupamento de Portais

## Especificações Modificadas

### SPEC-concepts.md
- **Seção 1 (Portal)**: Atualizado requisitos de configuração
  - SPEC-C-P-015 a P-018: Substituído `settings-key` por `realmId`
  - Portais agora pertencem a um Reino
  - Portais podem sobrescrever configurações do Reino
- **Nova seção 2 (Reino)**: Conceito de Reino adicionado
  - 21 requisitos (SPEC-C-R-001 a R-021)
  - Definição: agrupamento lógico de portais
  - Hierarquia de 3 níveis: Sistema → Reino → Portal
  - Reino "default" obrigatório e não-removível
- **Seção 5 (Relacionamentos)**: Atualizada hierarquia
  - SPEC-C-REL-001 a REL-013: Hierarquia agora inclui Reino
  - Ordem: Plataforma → Reino → Portal → Módulo → Instância
  - Remoção de Reino reatribui portais ao "default"
- **Seção 6 (Estado Inicial)**: Requisitos de instalação expandidos
  - SPEC-C-S-001 a S-010: Plataforma inicia com Reino "default"
  - Portais "main" e "setup" pertencem ao Reino "default"
  - Funcionamento mínimo inclui Reino "default"

### SPEC-theming.md
- **Seção 1 (Conceitos Fundamentais)**: Temas configuráveis por Reino
  - SPEC-TH-CO-002: Temas configuráveis por Reino (não mais por portal)
  - SPEC-TH-CO-003: Portais podem sobrescrever tema do Reino
- **Seção 2 completamente reescrita**: Hierarquia de Configuração
  - Substituiu seção "Settings Key"
  - 27 requisitos (SPEC-TH-HC-001 a HC-027)
  - Três níveis: Sistema → Reino → Portal
  - Resolução em cascata: Portal → Reino → Sistema
  - Defaults do Sistema: theme mode "system", brand color azul
  - Configuração de Reino em `config/realms.json`
  - Chaves localStorage hierárquicas:
    - Reino: `{realmId}:{config}` (ex: `default:theme`)
    - Portal: `{realmId}:{portalId}:{config}` (ex: `default:main:theme`)
  - Sincronização via storage events
- **Seção 3 (Tema Claro e Escuro)**: Armazenamento atualizado
  - SPEC-TH-LD-009: Chave agora segue hierarquia (referência a SPEC-TH-HC)
- **Seção 4 (Brand Color)**: Armazenamento atualizado
  - SPEC-TH-BC-010: Chave agora segue hierarquia (referência a SPEC-TH-HC)

## Especificações Criadas

### SPEC-realms.md (NOVO)
Especificação completa do sistema de Reinos:
- **Seção 1**: Definição e propósito (8 requisitos)
- **Seção 2**: Estrutura de Reino (identificação, metadados, config) (15 requisitos)
- **Seção 3**: Reino "default" obrigatório (9 requisitos)
- **Seção 4**: Hierarquia de configuração em 3 níveis (11 requisitos)
- **Seção 5**: CRUD de Reinos - listar, buscar, criar, atualizar, deletar (25 requisitos)
- **Seção 6**: Relacionamento com Portais (15 requisitos)
- **Seção 7**: Persistência - backend (realms.json), frontend (localStorage), JQEL (13 requisitos)
- **Seção 8**: Interface de Gerenciamento no módulo Setup (23 requisitos)
- **Seção 9**: Sincronização e Eventos SSE (12 requisitos)
- **Seção 10**: Migração de settings-key para realmId (8 requisitos)
- **Seção 11**: Validações de negócio e formato (12 requisitos)
- **Seção 12**: Casos de uso práticos (multi-departamento, B2B, ambientes)
- **Total**: 151 requisitos especificados

## Contexto

Sistema de Reinos aprimora o conceito de `settings-key` para permitir agrupamento lógico de portais que compartilham configurações. Introduz hierarquia de 3 níveis: Sistema → Reino → Portal.
