// Login Branding Types
// Tipos para customização da página de login

import { z } from 'zod';
import type { BrandColor } from './theme';
import { DEFAULT_BRAND_COLOR } from './theme';

/**
 * Configuração de branding da página de login
 * Permite customizar aparência da tela de autenticação
 */
export interface LoginBrandingConfig {
  /** Se true, usa brand color do tema; se false, usa brandColorOverride */
  useBrandColorFromTheme: boolean;

  /** Brand color customizada apenas para login (override) */
  brandColorOverride: BrandColor | null;

  /** URL da logo customizada (ou null para usar padrão) */
  logoUrl: string | null;

  /** Altura da logo em pixels (40-120) */
  logoHeight: number;

  /** Textos customizáveis */
  texts: {
    /** Título principal (ex: "Bem-vindo de volta") */
    title: string;

    /** Subtítulo (ex: "Entre com suas credenciais") */
    subtitle: string;

    /** Rodapé (ex: "Plataforma Modular v1.0") */
    footer: string;
  };
}

/**
 * Valores padrão para configuração de branding
 */
export const DEFAULT_LOGIN_BRANDING: LoginBrandingConfig = {
  useBrandColorFromTheme: true,
  brandColorOverride: null,
  logoUrl: null,
  logoHeight: 64,
  texts: {
    title: 'Bem-vindo de volta',
    subtitle: 'Entre com suas credenciais',
    footer: 'Plataforma Modular v1.0',
  },
};

/**
 * Limites de validação
 */
export const LOGIN_BRANDING_LIMITS = {
  logoHeight: {
    min: 40,
    max: 120,
    step: 4,
  },
  logoFile: {
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
    allowedExtensions: ['.png', '.jpg', '.jpeg', '.svg'],
  },
  texts: {
    maxLength: 100,
  },
} as const;

/**
 * Zod Schema para validação de BrandColor
 */
const BrandColorSchema = z.object({
  hue: z.number().min(0).max(360),
  saturation: z.number().min(0).max(100),
  lightness: z.number().min(0).max(100),
});

/**
 * Zod Schema para validação de LoginBrandingConfig
 */
export const LoginBrandingConfigSchema = z.object({
  useBrandColorFromTheme: z.boolean(),
  brandColorOverride: BrandColorSchema.nullable(),
  logoUrl: z.string().url().nullable().or(z.null()),
  logoHeight: z
    .number()
    .min(LOGIN_BRANDING_LIMITS.logoHeight.min)
    .max(LOGIN_BRANDING_LIMITS.logoHeight.max),
  texts: z.object({
    title: z.string().max(LOGIN_BRANDING_LIMITS.texts.maxLength),
    subtitle: z.string().max(LOGIN_BRANDING_LIMITS.texts.maxLength),
    footer: z.string().max(LOGIN_BRANDING_LIMITS.texts.maxLength),
  }),
});

/**
 * Valida configuração de branding
 * @throws ZodError se configuração inválida
 */
export function validateLoginBranding(
  config: unknown
): LoginBrandingConfig {
  return LoginBrandingConfigSchema.parse(config);
}

/**
 * Valida configuração de branding (versão safe)
 * @returns { success: true, data } ou { success: false, error }
 */
export function safeValidateLoginBranding(config: unknown) {
  return LoginBrandingConfigSchema.safeParse(config);
}

/**
 * Valida arquivo de logo
 */
export function validateLogoFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Validar tipo
  if (!LOGIN_BRANDING_LIMITS.logoFile.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo inválido. Permitido: PNG, JPG, SVG`,
    };
  }

  // Validar tamanho
  if (file.size > LOGIN_BRANDING_LIMITS.logoFile.maxSizeBytes) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo: 2MB`,
    };
  }

  return { valid: true };
}

/**
 * Mescla configuração parcial com defaults
 */
export function mergeWithDefaults(
  partial: Partial<LoginBrandingConfig>
): LoginBrandingConfig {
  return {
    ...DEFAULT_LOGIN_BRANDING,
    ...partial,
    texts: {
      ...DEFAULT_LOGIN_BRANDING.texts,
      ...partial.texts,
    },
  };
}

/**
 * Verifica se configuração é igual aos defaults
 */
export function isDefaultConfig(config: LoginBrandingConfig): boolean {
  return (
    config.useBrandColorFromTheme ===
      DEFAULT_LOGIN_BRANDING.useBrandColorFromTheme &&
    config.brandColorOverride === null &&
    config.logoUrl === null &&
    config.logoHeight === DEFAULT_LOGIN_BRANDING.logoHeight &&
    config.texts.title === DEFAULT_LOGIN_BRANDING.texts.title &&
    config.texts.subtitle === DEFAULT_LOGIN_BRANDING.texts.subtitle &&
    config.texts.footer === DEFAULT_LOGIN_BRANDING.texts.footer
  );
}
