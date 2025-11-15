# Otimização SEO - SSR Content

## Objetivo

Garantir que conteúdo renderizado SSR seja perfeitamente indexado por:
- Motores de busca (Google, Bing, Yandex)
- Redes sociais (Facebook, LinkedIn, Twitter, Instagram)
- IAs (ChatGPT, Claude, Perplexity, Gemini)

---

## Meta Tags Essenciais

### 1. SEO Básico (Google, Bing)

**Obrigatório em toda página SSR:**

```html
<title>Título da Página (50-60 caracteres)</title>
<meta name="description" content="Descrição clara e atraente (150-160 caracteres)">
<meta name="keywords" content="palavra-chave, seo, otimização">
<link rel="canonical" href="https://seusite.com/url-canonica">
```

**Geração automática pelo SSR Engine:**
```typescript
const metadata = template.generateMetadata(data);

const htmlHead = `
  <title>${metadata.title}</title>
  <meta name="description" content="${metadata.description}">
  ${metadata.keywords ? `<meta name="keywords" content="${metadata.keywords.join(', ')}">` : ''}
  <link rel="canonical" href="${currentUrl}">
`;
```

---

### 2. Open Graph (Facebook, LinkedIn, WhatsApp)

**Meta tags para compartilhamento social:**

```html
<meta property="og:title" content="Título atraente">
<meta property="og:description" content="Descrição envolvente">
<meta property="og:image" content="https://seusite.com/imagem.jpg">
<meta property="og:url" content="https://seusite.com/pagina">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Nome do Site">
<meta property="og:locale" content="pt_BR">
```

**Tipos de conteúdo:**
- `website` - Página institucional
- `article` - Post de blog
- `product` - Produto e-commerce
- `video.movie` - Vídeo

**Geração automática:**
```typescript
if (metadata.openGraph) {
  htmlHead += `
    <meta property="og:title" content="${metadata.openGraph.title}">
    <meta property="og:description" content="${metadata.openGraph.description}">
    <meta property="og:image" content="${metadata.openGraph.image}">
    <meta property="og:type" content="${metadata.openGraph.type}">
  `;
}
```

---

### 3. Twitter Cards

**Meta tags para compartilhamento no Twitter/X:**

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Título para Twitter">
<meta name="twitter:description" content="Descrição para Twitter">
<meta name="twitter:image" content="https://seusite.com/imagem-twitter.jpg">
<meta name="twitter:site" content="@usuario">
<meta name="twitter:creator" content="@autor">
```

**Tipos de cards:**
- `summary` - Card simples (imagem pequena)
- `summary_large_image` - Card com imagem grande
- `player` - Para vídeos/áudio
- `app` - Para aplicativos

---

### 4. Schema.org (Dados Estruturados para IA)

**JSON-LD para IAs entenderem conteúdo:**

#### Blog Post

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "10 Dicas de SEO",
  "description": "Aprenda a otimizar seu site",
  "image": "https://seusite.com/imagem.jpg",
  "author": {
    "@type": "Person",
    "name": "João Silva",
    "url": "https://seusite.com/autor/joao"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Meu Site",
    "logo": {
      "@type": "ImageObject",
      "url": "https://seusite.com/logo.png"
    }
  },
  "datePublished": "2025-01-15T08:00:00Z",
  "dateModified": "2025-01-16T10:30:00Z",
  "mainEntityOfPage": "https://seusite.com/blog/dicas-seo"
}
</script>
```

#### Produto E-commerce

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Tênis Running Pro",
  "description": "Tênis profissional para corrida",
  "image": "https://loja.com/tenis.jpg",
  "brand": {
    "@type": "Brand",
    "name": "Nike"
  },
  "offers": {
    "@type": "Offer",
    "price": "299.90",
    "priceCurrency": "BRL",
    "availability": "https://schema.org/InStock",
    "url": "https://loja.com/tenis-running-pro"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "127"
  }
}
</script>
```

#### Organização

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Minha Empresa",
  "url": "https://minhaempresa.com",
  "logo": "https://minhaempresa.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+55-11-1234-5678",
    "contactType": "Customer Service"
  },
  "sameAs": [
    "https://facebook.com/minhaempresa",
    "https://twitter.com/minhaempresa",
    "https://linkedin.com/company/minhaempresa"
  ]
}
</script>
```

---

## Otimização para IAs (LLMs)

### O que ChatGPT, Claude, Perplexity buscam:

1. **Estrutura semântica clara**
   ```html
   <article>
     <h1>Título Principal</h1>
     <p>Introdução clara do conteúdo</p>

     <h2>Seção 1</h2>
     <p>Conteúdo detalhado...</p>

     <h2>Seção 2</h2>
     <p>Mais conteúdo...</p>
   </article>
   ```

2. **Dados estruturados (Schema.org)**
   - IAs entendem contexto melhor
   - Podem extrair informações específicas
   - Melhor para citação e referência

3. **Conteúdo de qualidade**
   - Parágrafos bem escritos
   - Informação factual
   - Fontes citadas

4. **Metadados ricos**
   - Data de publicação
   - Autor
   - Última atualização

---

## Otimização de Imagens

### Atributos Essenciais

```html
<img
  src="imagem.jpg"
  alt="Descrição clara da imagem"
  width="800"
  height="600"
  loading="lazy"
  decoding="async"
>
```

### Open Graph Image

**Dimensões recomendadas:**
- Facebook: 1200x630px
- Twitter: 1200x600px
- LinkedIn: 1200x627px

**Formato:** JPG ou PNG (WebP para performance)

**Peso:** Máximo 1MB

---

## Sitemap.xml

### Geração Dinâmica

Backend gera sitemap com todas as páginas SSR.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://seusite.com/</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://seusite.com/blog/post-1</loc>
    <lastmod>2025-01-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Endpoint

```
GET /sitemap.xml
→ Backend consulta todas as páginas SSR (JQEL)
→ Gera XML dinamicamente
→ Cacheia por 1 hora
```

### Registro no Google

```
robots.txt:
Sitemap: https://seusite.com/sitemap.xml
```

---

## robots.txt

### Configuração Recomendada

```txt
User-agent: *
Allow: /

# Bloquear áreas administrativas
Disallow: /admin/
Disallow: /api/

# Permitir crawlers de IA
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

# Sitemap
Sitemap: https://seusite.com/sitemap.xml
```

---

## Performance e Core Web Vitals

Google considera performance no ranking.

### Métricas Críticas

**LCP (Largest Contentful Paint):** <2.5s
- SSR melhora LCP (HTML já vem pronto)
- Imagens otimizadas
- Fonts carregadas corretamente

**FID (First Input Delay):** <100ms
- JavaScript mínimo na página SSR
- Hydration eficiente

**CLS (Cumulative Layout Shift):** <0.1
- Definir width/height de imagens
- Evitar conteúdo que "pula"

---

## Canonical URLs

Evitar conteúdo duplicado.

### Problema

```
https://seusite.com/blog/post
https://seusite.com/blog/post?utm_source=facebook
https://seusite.com/blog/post#secao
```

Google vê como 3 páginas diferentes.

### Solução

```html
<link rel="canonical" href="https://seusite.com/blog/post">
```

Todas apontam para URL canônica.

---

## Internacionalização (i18n)

### Hreflang

Indicar idiomas disponíveis.

```html
<link rel="alternate" hreflang="pt-BR" href="https://seusite.com/br/pagina">
<link rel="alternate" hreflang="en-US" href="https://seusite.com/en/page">
<link rel="alternate" hreflang="es-ES" href="https://seusite.com/es/pagina">
<link rel="alternate" hreflang="x-default" href="https://seusite.com/page">
```

---

## Ferramentas de Validação

### Google

**Search Console:**
- Testar indexação
- Ver erros de rastreamento
- Verificar Core Web Vitals

**Rich Results Test:**
- Validar Schema.org
- Ver como Google "entende" a página

**PageSpeed Insights:**
- Testar performance
- Sugestões de otimização

### Redes Sociais

**Facebook Sharing Debugger:**
- https://developers.facebook.com/tools/debug/
- Valida Open Graph tags

**Twitter Card Validator:**
- https://cards-dev.twitter.com/validator
- Valida Twitter Cards

**LinkedIn Post Inspector:**
- https://www.linkedin.com/post-inspector/
- Valida compartilhamento LinkedIn

---

## Checklist de SEO por Template

Ao criar template SSR:

- [ ] `<title>` único e descritivo (50-60 chars)
- [ ] `<meta name="description">` atraente (150-160 chars)
- [ ] Open Graph tags completas
- [ ] Twitter Card configurado
- [ ] Schema.org JSON-LD implementado
- [ ] Canonical URL definida
- [ ] Imagens com alt text
- [ ] Heading hierarchy correta (h1 → h2 → h3)
- [ ] Sitemap atualizado
- [ ] robots.txt permite crawler
- [ ] Core Web Vitals otimizados
- [ ] Testado no Google Search Console
- [ ] Testado no Facebook Sharing Debugger

---

## Monitoramento SEO

### Métricas a Acompanhar

**Indexação:**
- Páginas indexadas (Google Search Console)
- Erros de rastreamento
- Cobertura de sitemap

**Performance:**
- Core Web Vitals
- Tempo de carregamento
- Taxa de rejeição

**Engajamento Social:**
- Compartilhamentos (Facebook, Twitter, LinkedIn)
- Click-through rate (CTR) de meta tags

**IA:**
- Citações em ChatGPT/Claude (via analytics)
- Tráfego de Perplexity/Bing Chat

---

## Próximos Passos

1. Implementar geração automática de meta tags
2. Criar sistema de sitemap dinâmico
3. Configurar robots.txt
4. Integrar com Google Search Console
5. Validar templates com ferramentas Google/Facebook
6. Documentar padrões de Schema.org por tipo de conteúdo
7. Monitorar Core Web Vitals em produção
