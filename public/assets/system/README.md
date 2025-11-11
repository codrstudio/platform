# Ícones Padrão do Sistema

Este diretório contém os ícones padrão utilizados quando não há customização em nível de Realm ou Portal.

## Arquivos Necessários

Adicione os seguintes arquivos neste diretório:

1. **favicon.ico** - Favicon multi-size (16x16, 32x32, 48x48)
2. **pwa-192x192.png** - Ícone PWA pequeno (192x192px)
3. **pwa-512x512.png** - Ícone PWA grande (512x512px)
4. **apple-touch-icon.png** - Ícone Apple (180x180px)

## Especificações

### favicon.ico
- Formato: ICO multi-size
- Tamanhos: 16x16, 32x32, 48x48 pixels
- Profundidade de cor: 32-bit com alpha

### pwa-192x192.png
- Formato: PNG
- Tamanho: 192x192 pixels
- Uso: PWA icon pequeno, atalhos

### pwa-512x512.png
- Formato: PNG
- Tamanho: 512x512 pixels
- Uso: PWA icon grande, splash screens

### apple-touch-icon.png
- Formato: PNG
- Tamanho: 180x180 pixels
- Uso: iOS home screen icon

## Hierarquia de Resolução

O sistema resolve ícones na seguinte ordem:

1. **Portal**: `/public/assets/portals/{portalId}/`
2. **Realm**: `/public/assets/realms/{realmId}/`
3. **System**: `/public/assets/system/` (este diretório)

Se um ícone não for encontrado em nível de Portal, o sistema busca no Realm. Se não encontrar no Realm, utiliza o ícone do System.

## Geração de Ícones

Você pode gerar ícones a partir de uma imagem SVG ou PNG usando ferramentas online:

- [RealFaviconGenerator](https://realfavicongenerator.net/) - Gerador completo
- [Favicon.io](https://favicon.io/) - Conversor simples
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) - CLI tool

Ou use o ImageMagick localmente:

```bash
# Gerar PNG a partir de SVG
convert -background none -resize 192x192 source.svg pwa-192x192.png
convert -background none -resize 512x512 source.svg pwa-512x512.png
convert -background none -resize 180x180 source.svg apple-touch-icon.png

# Gerar ICO multi-size
convert source.png -define icon:auto-resize=48,32,16 favicon.ico
```
