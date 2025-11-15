# Integração de Módulos - SSR Content

## Como Módulos Usam Infraestrutura SSR

Este documento explica como módulos (Website Estático, Website Dinâmico) integram com a infraestrutura SSR da plataforma.

---

## Ciclo de Vida do Módulo SSR

### 1. Registro de Rotas SSR

Quando módulo é ativado, registra rotas que precisam SSR.

**Interface:**
```typescript
interface SSRRouteRegistration {
  route: string;                    // "/blog/:slug"
  moduleId: string;                 // "website-estatico"
  renderMode: "cached" | "dynamic";
  template: React.ComponentType;    // Componente React
  dataFetcher: (params) => Promise; // Função que busca dados
  cacheStrategy?: {
    ttl?: number;                   // TTL (se dynamic)
    versionKey?: string | Function; // Chave de versão (se cached)
  };
}
```

**Exemplo - Módulo Website Estático:**
```typescript
// src/modules/website-estatico/ssr-routes.ts

import { BlogPostTemplate } from './templates/BlogPost';

export const ssrRoutes = [
  {
    route: "/blog/:slug",
    moduleId: "website-estatico",
    renderMode: "cached",
    template: BlogPostTemplate,
    dataFetcher: async (params) => {
      const post = await jqel.query({
        schema: "website",
        select: "post",
        where: { slug: { $eq: params.slug } }
      });
      return post;
    },
    cacheStrategy: {
      versionKey: (params) => `blog_post:${params.slug}`
    }
  }
];
```

---

### 2. Templates React

Módulos fornecem componentes React que serão renderizados server-side.

**Requisitos:**
- Componente React puro (sem hooks de navegação)
- Props vêm do `dataFetcher`
- Pode usar componentes da plataforma (Button, Card, etc)

**Exemplo:**
```typescript
// src/modules/website-estatico/templates/BlogPost.tsx

interface BlogPostProps {
  title: string;
  content: string;
  author: string;
  publishedAt: Date;
}

export function BlogPostTemplate({ title, content, author, publishedAt }: BlogPostProps) {
  return (
    <article>
      <h1>{title}</h1>
      <p className="text-muted-foreground">
        Por {author} em {publishedAt.toLocaleDateString()}
      </p>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}

// Meta tags para SEO
BlogPostTemplate.generateMetadata = (data) => ({
  title: data.title,
  description: data.excerpt,
  openGraph: {
    title: data.title,
    image: data.featuredImage,
    type: "article"
  }
});
```

---

### 3. Data Fetchers

Funções que buscam dados necessários para renderização.

**Regras:**
- Devem ser assíncronas
- Recebem `params` da rota
- Retornam objeto com dados
- Podem usar JQEL

**Exemplo:**
```typescript
async function fetchBlogPost(params: { slug: string }) {
  // Buscar post
  const post = await jqel.query({
    schema: "website",
    select: "post",
    where: { slug: { $eq: params.slug } }
  });

  // Buscar autor
  const author = await jqel.query({
    schema: "system",
    select: "user",
    where: { id: { $eq: post.authorId } }
  });

  // Buscar posts relacionados
  const related = await jqel.query({
    schema: "website",
    select: "post",
    where: { category: { $eq: post.category } },
    options: { limit: 3 }
  });

  return { post, author, related };
}
```

---

### 4. Versionamento

Módulos controlam quando cache deve ser invalidado.

#### Abordagem 1: Versionamento Automático

Plataforma incrementa versão quando recurso muda via JQEL.

```typescript
// Módulo apenas define chave de versão
cacheStrategy: {
  versionKey: (params) => `blog_post:${params.slug}`
}

// Backend automaticamente:
// - Ao criar post: versão = 1
// - Ao editar post: versão++
```

#### Abordagem 2: Versionamento Manual

Módulo controla versão explicitamente.

```typescript
// Módulo define lógica de versão
cacheStrategy: {
  versionKey: async (params) => {
    const post = await getPost(params.slug);
    return `blog_post:${params.slug}:${post.updatedAt.getTime()}`;
  }
}
```

---

## Exemplos de Módulos

### Módulo: Website Estático

**Funcionalidades:**
- Blog
- Landing pages
- Páginas institucionais

**Rotas SSR:**
```typescript
[
  {
    route: "/blog/:slug",
    renderMode: "cached",
    template: BlogPostTemplate,
    dataFetcher: fetchBlogPost,
    cacheStrategy: { versionKey: "blog_post:slug" }
  },
  {
    route: "/landing/:slug",
    renderMode: "cached",
    template: LandingPageTemplate,
    dataFetcher: fetchLandingPage,
    cacheStrategy: { versionKey: "landing_page:slug" }
  },
  {
    route: "/sobre",
    renderMode: "cached",
    template: AboutPageTemplate,
    dataFetcher: fetchAboutPage,
    cacheStrategy: { versionKey: "about_page" }
  }
]
```

**Editor Visual:**
- Interface SPA para criar/editar conteúdo
- WYSIWYG editor (TipTap)
- Galeria de imagens
- SEO settings (meta tags, Open Graph)

---

### Módulo: Website Dinâmico

**Funcionalidades:**
- E-commerce (produtos, checkout)
- Fórum
- Feed de notícias

**Rotas SSR:**
```typescript
[
  {
    route: "/produto/:id",
    renderMode: "dynamic",
    template: ProductPageTemplate,
    dataFetcher: fetchProduct,
    cacheStrategy: { ttl: 300 }  // 5 minutos
  },
  {
    route: "/forum/topico/:id",
    renderMode: "dynamic",
    template: ForumTopicTemplate,
    dataFetcher: fetchForumTopic,
    cacheStrategy: { ttl: 60 }  // 1 minuto
  },
  {
    route: "/noticias",
    renderMode: "dynamic",
    template: NewsListTemplate,
    dataFetcher: fetchNews,
    cacheStrategy: { ttl: 120 }  // 2 minutos
  }
]
```

**Interatividade:**
- Páginas SSR podem ter componentes React interativos (hydration)
- Formulários, carrinho, comentários funcionam normalmente

---

## Layouts e Composição

Módulos podem definir layouts compartilhados.

### Layout Padrão

```typescript
// src/modules/website-estatico/layouts/DefaultLayout.tsx

export function DefaultLayout({ children, menu, footer }) {
  return (
    <div>
      <header>
        <Navigation items={menu} />
      </header>
      <main>{children}</main>
      <footer>
        <Footer content={footer} />
      </footer>
    </div>
  );
}
```

### Template Usando Layout

```typescript
BlogPostTemplate.layout = DefaultLayout;
BlogPostTemplate.layoutData = async (params) => {
  const menu = await fetchMenu();
  const footer = await fetchFooter();
  return { menu, footer };
};
```

---

## Meta Tags e SEO

Templates podem gerar meta tags dinamicamente.

### Interface

```typescript
template.generateMetadata = (data) => ({
  title: string;
  description: string;
  keywords?: string[];
  openGraph?: {
    title: string;
    description: string;
    image: string;
    type: "website" | "article" | "product";
  };
  twitter?: {
    card: "summary" | "summary_large_image";
    title: string;
    image: string;
  };
  schema?: object;  // Schema.org JSON-LD
});
```

### Exemplo

```typescript
BlogPostTemplate.generateMetadata = (data) => ({
  title: data.title,
  description: data.excerpt,
  keywords: data.tags,
  openGraph: {
    title: data.title,
    description: data.excerpt,
    image: data.featuredImage,
    type: "article"
  },
  twitter: {
    card: "summary_large_image",
    title: data.title,
    image: data.featuredImage
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": data.title,
    "author": { "@type": "Person", "name": data.author },
    "datePublished": data.publishedAt,
    "image": data.featuredImage
  }
});
```

---

## Hydration (Interatividade)

Páginas SSR podem ter componentes React interativos.

### Como Funciona

1. Backend renderiza HTML completo (SSR)
2. HTML contém dados iniciais: `<script>window.__DATA__ = {...}</script>`
3. Browser carrega JavaScript React
4. React "hydrate" HTML existente (não re-renderiza)
5. Componentes interativos funcionam

### Exemplo

```typescript
// Template SSR
export function ProductPageTemplate({ product, reviews }) {
  return (
    <div>
      <ProductInfo product={product} />
      {/* Componente interativo */}
      <ReviewForm productId={product.id} />
    </div>
  );
}
```

**HTML gerado:**
```html
<div>
  <!-- HTML estático -->
  <div class="product-info">...</div>

  <!-- Componente interativo (hydratado) -->
  <div id="review-form" data-product-id="123">
    <form>...</form>
  </div>
</div>

<script>
  window.__DATA__ = { product: {...}, reviews: [...] };
</script>
<script src="/assets/product-page.js"></script>
```

**JavaScript no browser:**
```typescript
import { hydrateRoot } from 'react-dom/client';

const data = window.__DATA__;
hydrateRoot(
  document.getElementById('root'),
  <ProductPageTemplate {...data} />
);
```

---

## Integração com Editor Visual

Módulos fornecem interface SPA para criar conteúdo que será renderizado SSR.

### Fluxo

```
1. Admin acessa /admin/website/blog/new (SPA)
2. Preenche formulário (título, conteúdo, imagens)
3. Clica "Publicar"
4. POST /api/jqel (insert blog_post)
5. Backend cria post, versão = 1
6. Próximo acesso: /blog/meu-post → SSR renderiza
```

### Campos do Editor

**Mínimos:**
- Título
- Conteúdo (rich text)
- Slug (URL)

**SEO:**
- Meta description
- Featured image
- Keywords/tags

**Avançados:**
- Layout/template
- Custom CSS/JS
- Configurações Open Graph específicas

---

## Multi-Tenant (SAAS)

Cada cliente tem conteúdo isolado.

### Isolamento de Dados

```typescript
dataFetcher: async (params, context) => {
  const post = await jqel.query({
    schema: "website",
    select: "post",
    where: {
      slug: { $eq: params.slug },
      tenantId: { $eq: context.tenantId }  // ← Isolamento
    }
  });
  return post;
}
```

### Isolamento de Cache

```
ssr:cached:tenant-123:/blog/post:v1
ssr:cached:tenant-456:/blog/post:v1
```

Mesmo slug, clientes diferentes = caches diferentes.

---

## Temas e Personalização

Módulos podem usar sistema de temas da plataforma.

### Tema por Portal

```typescript
template.useTheme = true;  // Usa tema do portal

// Template aplica classes Tailwind que respondem ao tema
<div className="bg-background text-foreground">
  <h1 className="text-primary">{title}</h1>
</div>
```

### CSS Customizado por Cliente

```typescript
// Cliente pode adicionar CSS custom
BlogPostTemplate.customCSS = (tenantConfig) => {
  return tenantConfig.blogCustomCSS || "";
};
```

---

## Limitações e Restrições

### O que Módulos NÃO Podem Fazer

❌ Modificar middleware de roteamento da plataforma
❌ Acessar cache diretamente (usam API)
❌ Sobrescrever rotas de outros módulos
❌ Renderizar sem usar SSR Engine da plataforma

### O que Módulos DEVEM Fazer

✅ Registrar rotas via API oficial
✅ Usar componentes da plataforma quando possível
✅ Seguir convenções de naming
✅ Documentar templates e data fetchers
✅ Testar meta tags geradas

---

## Checklist de Desenvolvimento

Ao criar módulo que usa SSR:

- [ ] Definir rotas SSR (cached ou dynamic)
- [ ] Criar templates React
- [ ] Implementar data fetchers
- [ ] Configurar versionamento (se cached)
- [ ] Implementar generateMetadata
- [ ] Criar editor visual (SPA)
- [ ] Testar cache hit/miss
- [ ] Validar meta tags (Google, Facebook, Twitter)
- [ ] Testar multi-tenant (isolamento)
- [ ] Documentar uso do módulo

---

## Próximos Passos

1. Criar módulo Website Estático (primeiro caso real)
2. Testar todas as funcionalidades
3. Documentar padrões descobertos
4. Criar módulo Website Dinâmico
5. Evoluir API baseada em feedback
