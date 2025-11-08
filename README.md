<div align="center">
  <img src="assets/brand.svg" alt="Platform Logo" width="300" />
  
  **Uma plataforma modular para construir aplicações web reutilizáveis e escaláveis**
  
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
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

## 🚀 Começando

### Pré-requisitos

- Node.js 18+ instalado
- Redis server rodando (para funcionalidades de produção)
- Instância n8n rodando (para integração backend)

### Instalação

#### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/platform.git
cd platform
```

#### 2. Configure o Frontend
```bash
cd src/frontend
npm install
cp .env.example .env
npm run dev
```
Frontend disponível em: http://localhost:5173

#### 3. Configure o Backend
```bash
cd src/backend
npm install
cp .env.example .env
npm run dev
```
Backend disponível em: http://localhost:3000

## 💻 Desenvolvimento

### Frontend
```bash
cd src/frontend
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
npm run lint         # Linting do código
```

### Backend
```bash
cd src/backend
npm run dev          # Desenvolvimento com hot-reload
npm run build        # Compilar TypeScript
npm start            # Executar código compilado
npm run lint         # Linting do código
```

## 🔑 Conceitos Fundamentais

### Portal
Sub-aplicação isolada dentro da plataforma. Cada portal tem seu próprio contexto, roteamento e estado, sem interferir com outros portais.

### Módulo
Funcionalidade encapsulada e reutilizável. Módulos podem ser ativados/desativados e configurados independentemente em cada portal.

### Instância
Configuração específica de um módulo dentro de um portal. Permite múltiplas versões do mesmo módulo com configurações diferentes.

## 🔧 Variáveis de Ambiente

Veja os arquivos de exemplo:
- `src/frontend/.env.example` - Configuração do Frontend
- `src/backend/.env.example` - Configuração do Backend

## 📚 Documentação

- **[MANIFESTO.md](MANIFESTO.md)** - Filosofia e visão do Platform
- **[CLAUDE.md](CLAUDE.md)** - Instruções completas do projeto
- **[spec/](spec/)** - 30+ arquivos de especificação formal
- **[REALM-SYSTEM-IMPLEMENTATION.md](REALM-SYSTEM-IMPLEMENTATION.md)** - Sistema de Realms

## 📊 Status do Projeto

### ✅ Wave 1: Base do Projeto - COMPLETO
- Estrutura Frontend criada (React 19 + Vite)
- Estrutura Backend criada (Express + Node.js)
- Tailwind CSS configurado
- shadcn/ui configurado
- Servidores de desenvolvimento funcionando

Contribuições são bem-vindas! Por favor, leia nosso guia de contribuição antes de submeter PRs.

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

Contribuições são bem-vindas! Por favor, leia nosso guia de contribuição antes de submeter PRs.

## 📄 Licença

Este projeto está licenciado sob a licença ISC - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<div align="center">
  <p>Desenvolvido com ❤️ pela equipe CODR Studio</p>
  <p>
    <a href="https://github.com/codrstudio/platform">GitHub</a>
    •
    <a href="https://platform.codr.studio/">• Website</a>
    •
    <a href="https://platform.codr.studio/docs">• Documentação</a>
  </p>
</div>
