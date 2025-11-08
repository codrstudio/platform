<div align="center">
  <img src="assets/brand.svg" alt="Platform Logo" width="300" />
  
  **Uma plataforma modular para construir aplicações web reutilizáveis e escaláveis**
  
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  
  ---
  
  ### 🚧 Status: Fase de Especificação
  
  **33 especificações completas** • **13 workflows n8n prontos** • **Implementação em progresso**
  
  Este projeto possui arquitetura e especificações completas. A implementação de frontend e backend está seguindo o plano em `src/PLAN.md`.
  
  ---
</div>

---

## 🚀 Sobre o Platform

Platform é uma solução inovadora que transforma a forma como desenvolvemos aplicações web. Através de uma arquitetura modular, permite criar sub-aplicações isoladas (Portais), funcionalidades ativáveis (Módulos) e instâncias configuráveis que podem ser reutilizadas em múltiplos projetos.

### Por que Platform?

- **🔄 Reutilização Real**: Módulos desenvolvidos uma vez, utilizados sempre
- **🛡️ Isolamento Completo**: Portais independentes sem interferência mútua
- **📈 Conhecimento Acumulativo**: Melhorias beneficiam todos os projetos
- **⚡ Desenvolvimento Acelerado**: Pare de reinventar a roda

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────┐
│  FRONTEND (React 19 + Vite)                 │
│  - UI rendering, routing, state management  │
└─────────────────────────────────────────────┘ 
                    ↓
┌─────────────────────────────────────────────┐
│  BACKEND (Express + Node.js)                │
│  - Proxy, validation, authentication        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  BACKBONE (n8n - Already Implemented)       │
│  - Business logic, workflows, data          │
└─────────────────────────────────────────────┘
```

## 🛠️ Stack Tecnológica

### Frontend
- **React 19** - UI Library de última geração
- **Vite 6** - Build tool ultrarrápida
- **TypeScript 5** - Type safety em todo o projeto
- **Tailwind CSS 3** - Estilização utility-first
- **shadcn/ui** - Componentes acessíveis e customizáveis
- **React Router 6** - Roteamento declarativo
- **TanStack Query 5** - Gerenciamento de estado do servidor
- **React Hook Form 7** - Formulários performáticos
- **Zod 3** - Validação de schemas
- **Lucide React** - Ícones modernos

### Backend
- **Node.js 18+** - Runtime JavaScript
- **Express 5** - Framework web minimalista
- **TypeScript 5** - Type safety no servidor
- **Redis (ioredis)** - Cache e sessões
- **Winston** - Sistema de logging robusto

### Backbone
- **n8n** - Automação de workflows (em `workflows/`)

## 📁 Estrutura do Projeto

```
platform/
├── assets/                 # Recursos visuais e marca
│   └── brand.svg          # Logo oficial do Platform
├── src/
│   ├── frontend/          # Aplicação React + Vite
│   └── backend/           # Servidor Express API
├── workflows/             # Workflows n8n (Backbone)
├── spec/                  # Especificações formais (30+ arquivos)
├── docs/                  # Documentação adicional
├── MANIFESTO.md          # Filosofia do Platform
├── CLAUDE.md             # Instruções para desenvolvimento
└── README.md             # Este arquivo
```

## 🚀 Como Começar

### Para Desenvolvedores

Este projeto está em fase de **implementação ativa**. Para contribuir:

1. **Leia a documentação essencial:**
   - [`CLAUDE.md`](CLAUDE.md) - Guia completo do projeto
   - [`src/PLAN.md`](src/PLAN.md) - Roadmap de implementação
   - [`MANIFESTO.md`](MANIFESTO.md) - Filosofia do projeto

2. **Explore as especificações:**
   - [`spec/SPEC-concepts.md`](spec/SPEC-concepts.md) - Portal, Módulo, Instância
   - [`spec/SPEC-architecture.md`](spec/SPEC-architecture.md) - Arquitetura de 3 camadas
   - [`spec/STACK.md`](spec/STACK.md) - Stack tecnológica obrigatória

3. **Verifique o que já existe:**
   - ✅ 33 especificações formais em `spec/`
   - ✅ 10 especificações de UI/UX em `spec/ui/`
   - ✅ 13 workflows n8n em `workflows/`
   - ✅ Plano de implementação estruturado

### Pré-requisitos para Desenvolvimento

Quando a implementação estiver pronta, você precisará:

- Node.js 18+ instalado
- Redis server (para funcionalidades de produção)
- Instância n8n (já configurada em `workflows/`)

### Roadmap de Implementação

Confira [`src/PLAN.md`](src/PLAN.md) para ver:
- **7 Initiatives** organizadas por valor de negócio
- **Epics e Stories** detalhadas
- **Ordem de prioridade** para desenvolvimento

## 🔑 Conceitos Fundamentais

### Portal
Sub-aplicação isolada dentro da plataforma. Cada portal tem seu próprio contexto, roteamento e estado, sem interferir com outros portais.

### Módulo
Funcionalidade encapsulada e reutilizável. Módulos podem ser ativados/desativados e configurados independentemente em cada portal.

### Instância
Configuração específica de um módulo dentro de um portal. Permite múltiplas versões do mesmo módulo com configurações diferentes.

## 🔧 Configuração

Variáveis de ambiente serão necessárias quando a implementação estiver pronta. As configurações seguirão o padrão definido em `spec/SPEC-configuration.md`.

## 📚 Documentação

### Documentação Principal
- **[MANIFESTO.md](MANIFESTO.md)** - Filosofia e visão do Platform
- **[CLAUDE.md](CLAUDE.md)** - Guia completo para desenvolvimento
- **[src/PLAN.md](src/PLAN.md)** - Roadmap de implementação

### Especificações Técnicas
- **[spec/](spec/)** - 33 arquivos de especificação formal
- **[spec/ui/](spec/ui/)** - 10 especificações de interface
- **[spec/STACK.md](spec/STACK.md)** - Stack tecnológica obrigatória
- **[workflows/](workflows/)** - 13 workflows n8n (Backbone)

### Especificações Essenciais
- **[SPEC-concepts.md](spec/SPEC-concepts.md)** - Conceitos fundamentais
- **[SPEC-architecture.md](spec/SPEC-architecture.md)** - Arquitetura de 3 camadas
- **[SPEC-modules.md](spec/SPEC-modules.md)** - Sistema de módulos
- **[SPEC-jqel-syntax.md](spec/SPEC-jqel-syntax.md)** - Linguagem de query JQEL

## 📊 Status do Projeto

### ✅ Fase 1: Especificação - COMPLETO
- ✅ 33 especificações técnicas formais
- ✅ 10 especificações de UI/UX com wireframes
- ✅ 13 workflows n8n (Backbone) implementados
- ✅ Plano de implementação estruturado
- ✅ Stack tecnológica definida

### 🚧 Fase 2: Implementação - EM PROGRESSO
- 🔄 Setup inicial do projeto
- 🔄 Implementação do Backend
- 🔄 Implementação do Frontend
- ⏳ Sistema de Portais
- ⏳ Sistema de Módulos
- ⏳ Sistema JQEL

Veja o progresso detalhado em [`src/PLAN.md`](src/PLAN.md).

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Leia [`CLAUDE.md`](CLAUDE.md) para entender o projeto
2. Verifique [`src/PLAN.md`](src/PLAN.md) para tarefas pendentes
3. Consulte as especificações relevantes em `spec/`
4. Siga o stack tecnológico obrigatório em `spec/STACK.md`
5. Todas as mudanças devem seguir as especificações existentes

## 📄 Licença

Este projeto está licenciado sob a licença ISC - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<div align="center">
  <p>Desenvolvido com ❤️ pela equipe CODR Studio</p>
  <p><strong>🚧 Projeto em desenvolvimento ativo - Especificações completas, implementação em progresso</strong></p>
</div>
