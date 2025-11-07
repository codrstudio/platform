# PWA Icons

## Current State

Os ícones PWA atualmente estão em formato SVG copiados do logo da plataforma.

## Recommended Action

Para melhor compatibilidade com todos os dispositivos e browsers, é recomendado converter os ícones para PNG:

### Conversão Manual

Use uma ferramenta como Inkscape, GIMP ou um conversor online para criar:

1. **pwa-192x192.png** - Ícone 192x192 pixels
   - Fonte: assets/logo.svg
   - Formato: PNG com fundo transparente

2. **pwa-512x512.png** - Ícone 512x512 pixels
   - Fonte: assets/logo.svg
   - Formato: PNG com fundo transparente

3. **apple-touch-icon.png** - Ícone 180x180 pixels
   - Fonte: assets/logo.svg
   - Formato: PNG (pode ter fundo branco ou transparente)

### Via Command Line (se ImageMagick instalado)

```bash
# Converter logo.svg para PNG 192x192
magick convert -background none -resize 192x192 assets/logo.svg public/pwa-192x192.png

# Converter logo.svg para PNG 512x512
magick convert -background none -resize 512x512 assets/logo.svg public/pwa-512x512.png

# Converter logo.svg para PNG 180x180 (Apple)
magick convert -background none -resize 180x180 assets/logo.svg public/apple-touch-icon.png
```

## Browser Compatibility

- **SVG icons**: Funcionam em browsers modernos (Chrome 93+, Edge 93+, Firefox 90+)
- **PNG icons**: Compatibilidade universal, incluindo Safari e dispositivos iOS

## Current Files

- `pwa-192x192.svg` - Ícone pequeno (SVG temporário)
- `pwa-512x512.svg` - Ícone grande (SVG temporário)
- `favicon.ico` - Favicon do navegador
