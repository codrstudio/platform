/**
 * Section Validator
 *
 * Valida configurações de seções antes de renderizar.
 * Previne erros causados por dados inválidos ou incompletos.
 *
 * @module homepage/components/editor
 */

import type { SectionConfig } from '../../types'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Valida uma configuração de seção
 */
export function validateSection(section: SectionConfig): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validação básica
  if (!section) {
    errors.push('Seção é nula ou indefinida')
    return { isValid: false, errors, warnings }
  }

  if (!section.type) {
    errors.push('Tipo de seção não especificado')
  }

  if (!section.id) {
    warnings.push('ID de seção não especificado')
  }

  // Validação específica por tipo
  switch (section.type) {
    case 'hero':
      validateHeroSection(section as any, errors, warnings)
      break
    case 'cards':
    case 'features':
      validateCardsSection(section as any, errors, warnings)
      break
    case 'quickLinks':
      validateQuickLinksSection(section as any, errors, warnings)
      break
    case 'stats':
      validateStatsSection(section as any, errors, warnings)
      break
    case 'faq':
      validateFAQSection(section as any, errors, warnings)
      break
    case 'newsletter':
      validateNewsletterSection(section as any, errors, warnings)
      break
    case 'footer':
      validateFooterSection(section as any, errors, warnings)
      break
    case 'cta':
      validateCTASection(section as any, errors, warnings)
      break
    default:
      warnings.push(`Tipo de seção desconhecido: ${(section as any).type}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

function validateHeroSection(section: any, errors: string[], warnings: string[]) {
  if (!section.title && !section.subtitle) {
    warnings.push('Seção Hero sem título ou subtítulo')
  }
}

function validateCardsSection(section: any, errors: string[], warnings: string[]) {
  if (!section.items) {
    errors.push('Seção Cards sem array de items')
    return
  }

  if (!Array.isArray(section.items)) {
    errors.push('Items da seção Cards não é um array')
    return
  }

  if (section.items.length === 0) {
    warnings.push('Seção Cards sem items')
  }
}

function validateQuickLinksSection(section: any, errors: string[], warnings: string[]) {
  if (!section.items) {
    errors.push('Seção QuickLinks sem array de items')
    return
  }

  if (!Array.isArray(section.items)) {
    errors.push('Items da seção QuickLinks não é um array')
    return
  }

  if (section.items.length === 0) {
    warnings.push('Seção QuickLinks sem items')
  }

  // Validar cada item
  section.items.forEach((item: any, index: number) => {
    if (!item.label && !item.title) {
      warnings.push(`Item ${index + 1} de QuickLinks sem label ou title`)
    }
  })
}

function validateStatsSection(section: any, errors: string[], warnings: string[]) {
  if (!section.items) {
    errors.push('Seção Stats sem array de items')
    return
  }

  if (!Array.isArray(section.items)) {
    errors.push('Items da seção Stats não é um array')
    return
  }

  if (section.items.length === 0) {
    warnings.push('Seção Stats sem items')
  }
}

function validateFAQSection(section: any, errors: string[], warnings: string[]) {
  if (!section.items) {
    errors.push('Seção FAQ sem array de items')
    return
  }

  if (!Array.isArray(section.items)) {
    errors.push('Items da seção FAQ não é um array')
    return
  }

  if (section.items.length === 0) {
    warnings.push('Seção FAQ sem items')
  }
}

function validateNewsletterSection(section: any, errors: string[], warnings: string[]) {
  if (!section.title) {
    warnings.push('Seção Newsletter sem título')
  }
}

function validateFooterSection(section: any, errors: string[], warnings: string[]) {
  if (!section.columns) {
    warnings.push('Seção Footer sem colunas')
    return
  }

  if (!Array.isArray(section.columns)) {
    errors.push('Columns da seção Footer não é um array')
    return
  }

  if (section.columns.length === 0) {
    warnings.push('Seção Footer sem colunas')
  }
}

function validateCTASection(section: any, errors: string[], warnings: string[]) {
  if (!section.title) {
    warnings.push('Seção CTA sem título')
  }
}

/**
 * Tenta corrigir automaticamente uma seção inválida
 */
export function sanitizeSection(section: SectionConfig): SectionConfig {
  if (!section) {
    return {
      id: `section-${Date.now()}`,
      type: 'hero',
      enabled: false,
      title: 'Seção Inválida',
    } as SectionConfig
  }

  // Garantir campos básicos
  const sanitized = {
    ...section,
    id: section.id || `section-${Date.now()}`,
    enabled: section.enabled ?? true,
  }

  // Sanitização específica por tipo
  switch (section.type) {
    case 'cards':
    case 'features':
    case 'quickLinks':
    case 'stats':
    case 'faq':
      if (!(sanitized as any).items || !Array.isArray((sanitized as any).items)) {
        ;(sanitized as any).items = []
      }
      break

    case 'footer':
      if (!(sanitized as any).columns || !Array.isArray((sanitized as any).columns)) {
        ;(sanitized as any).columns = []
      }
      break
  }

  return sanitized
}
