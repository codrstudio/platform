/**
 * OptimizedImage Component
 *
 * Componente para renderizar imagens com otimizações de performance:
 * - Lazy loading nativo
 * - Responsive images com srcset
 * - WebP format com fallback
 * - Aspect ratio preservation
 *
 * Specs:
 * - SPEC-M-HP-PERF-005: Lazy loading de imagens
 * - SPEC-M-HP-PERF-006: Usar srcset para responsive images
 * - SPEC-M-HP-PERF-007: WebP format com fallback
 *
 * @see spec/SPEC-module-homepage.md - Performance
 */

import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'sizes'> {
  /**
   * URL base da imagem (sem extensão se usar WebP)
   */
  src: string;

  /**
   * Texto alternativo (obrigatório para acessibilidade)
   */
  alt: string;

  /**
   * Larguras para gerar srcset
   * @default [640, 768, 1024, 1280, 1536]
   */
  widths?: number[];

  /**
   * Se true, usa WebP com fallback para formato original
   * @default true
   */
  useWebP?: boolean;

  /**
   * Aspect ratio para prevenir CLS (ex: '16/9', '4/3', '1/1')
   */
  aspectRatio?: string;

  /**
   * Loading strategy
   * @default 'lazy'
   */
  loading?: 'lazy' | 'eager';

  /**
   * Classe adicional para o wrapper
   */
  wrapperClassName?: string;
}

/**
 * Componente de imagem otimizada com lazy loading e responsive images
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/images/hero-bg.jpg"
 *   alt="Hero background"
 *   aspectRatio="16/9"
 *   widths={[640, 1024, 1920]}
 *   useWebP
 * />
 * ```
 */
export function OptimizedImage({
  src,
  alt,
  widths = [640, 768, 1024, 1280, 1536],
  useWebP = true,
  aspectRatio,
  loading = 'lazy',
  className,
  wrapperClassName,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);

  // Gera srcset para responsive images
  const generateSrcSet = (baseSrc: string, extension?: string) => {
    return widths
      .map((width) => {
        const ext = extension || baseSrc.split('.').pop();
        const baseWithoutExt = baseSrc.replace(/\.[^/.]+$/, '');
        return `${baseWithoutExt}-${width}w.${ext} ${width}w`;
      })
      .join(', ');
  };

  // Gera sizes attribute para responsive loading
  const sizesAttr = widths
    .map((width, index) => {
      if (index === widths.length - 1) {
        return `${width}px`;
      }
      return `(max-width: ${width}px) ${width}px`;
    })
    .join(', ');

  const imgStyle = aspectRatio
    ? { aspectRatio, objectFit: 'cover' as const }
    : undefined;

  const imgElement = (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      className={cn('w-full h-auto', className)}
      style={imgStyle}
      onError={() => setError(true)}
      {...props}
    />
  );

  // Se WebP habilitado e sem erro, usa picture element com fallback
  if (useWebP && !error) {
    return (
      <div className={wrapperClassName} style={aspectRatio ? { aspectRatio } : undefined}>
        <picture>
          {/* WebP source */}
          <source
            type="image/webp"
            srcSet={generateSrcSet(src, 'webp')}
            sizes={sizesAttr}
          />

          {/* Fallback para formato original */}
          <source
            srcSet={generateSrcSet(src)}
            sizes={sizesAttr}
          />

          {imgElement}
        </picture>
      </div>
    );
  }

  // Imagem simples com srcset
  return (
    <div className={wrapperClassName} style={aspectRatio ? { aspectRatio } : undefined}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        srcSet={generateSrcSet(src)}
        sizes={sizesAttr}
        className={cn('w-full h-auto', className)}
        style={imgStyle}
        onError={() => setError(true)}
        {...props}
      />
    </div>
  );
}
