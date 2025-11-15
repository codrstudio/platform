# SSR/SSG Content Rendering - Decisão Arquitetural

## Contexto

A plataforma é uma SPA (Single Page Application) React, mas alguns módulos precisam gerar conteúdo indexável por crawlers (Google, redes sociais, IAs).

**Casos de uso:**
- Módulo Website Estático: blogs, landing pages, sites institucionais
- Módulo Website Dinâmico: e-commerce, fóruns, conteúdo real-time

**Restrição crítica:** Plataforma é SAAS multi-tenant. Não pode usar `npm run build` para cada cliente.

---

## Decisão

Implementar **Server-Side Rendering (SSR) com sistema de cache versionado**.

### Duas Estratégias de Renderização

#### 1. SSR com Cache (Website Estático)
- Renderiza HTML no primeiro acesso
- Armazena em cache com chave de versão
- Reutiliza cache enquanto versão não mudar
- Invalida cache quando conteúdo é editado

**Analogia:** Como gerar um PDF e guardar. Só regenera se documento mudar.

#### 2. SSR Dinâmico (Website Dinâmico)
- Renderiza HTML em cada acesso
- Sem cache ou cache curto (segundos/minutos)
- Sempre conteúdo fresh

**Analogia:** Como PHP tradicional, renderiza toda vez.

---

## Benefícios

### Para a Plataforma
- ✅ Sem build global (compatível com SAAS)
- ✅ Infraestrutura unificada (mesmo código SSR para ambos)
- ✅ Escalável (cada cliente independente)
- ✅ Integra com React Router existente

### Para SEO
- ✅ HTML completo para crawlers
- ✅ Meta tags dinâmicas por página
- ✅ Open Graph, Twitter Cards, Schema.org
- ✅ Otimizado para IA (ChatGPT, Claude, Perplexity)

### Para Performance
- ✅ Website Estático: rápido (serve cache)
- ✅ Website Dinâmico: conteúdo sempre atual
- ✅ CDN-friendly (HTML cacheado pode ir pra CDN)

---

## Infraestrutura Requerida na Plataforma

A plataforma deve prover (desativado até módulo ativar):

1. **Roteamento Híbrido** - Detecta rotas SSR vs SPA
2. **Renderizador React SSR** - `renderToString()` reutilizável
3. **Sistema de Cache Versionado** - Redis com chaves versionadas
4. **Invalidação de Cache** - Webhooks, eventos, automações n8n

---

## Responsabilidades

### Plataforma (Core)
- Sistema de roteamento
- Renderizador SSR
- Cache e invalidação
- Middleware de detecção de rotas

### Módulos (Website Estático/Dinâmico)
- Templates React (BlogPost, ProductPage, etc)
- Editor visual
- Schema de dados
- Registro de rotas SSR
- Lógica de versionamento

---

## Arquivos desta Decisão

- `README.md` - Este arquivo (visão geral)
- `architecture.md` - Arquitetura detalhada do sistema SSR
- `caching-strategy.md` - Estratégia de cache e versionamento
- `module-integration.md` - Como módulos usam infraestrutura SSR
- `seo-optimization.md` - Otimizações para crawlers e IA

---

## Status

**Status:** Decisão Pendente - Aguardando aprovação

**Próximos passos:**
1. Revisar e aprovar decisão
2. Criar especificações formais (SPEC-SSR-*.md)
3. Implementar infraestrutura na plataforma
4. Criar módulos Website Estático e Website Dinâmico

---

## Referências

- SPEC-A-L-004: Frontend DEVE ser SPA
- SPEC-R-LD-*: Lazy loading de módulos
- SPEC-A-PWA-*: PWA e estratégias de cache
