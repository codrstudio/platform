// Brand Color Selector Component
// Seleção entre cor do tema ou cor customizada

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import type { BrandColor } from '@/types/theme';
import { hslToHex } from '@/lib/theme';
import { ThemeColorPicker } from './ThemeColorPicker';

interface BrandColorSelectorProps {
  /** Se true, usa cor do tema */
  useThemeColor: boolean;

  /** Cor do tema atual (para exibição) */
  themeColor: BrandColor;

  /** Cor customizada (override) */
  customColor: BrandColor | null;

  /** Callback quando seleção muda */
  onModeChange: (useTheme: boolean) => void;

  /** Callback quando cor customizada muda */
  onCustomColorChange: (color: BrandColor) => void;

  /** Desabilita edição */
  disabled?: boolean;
}

/**
 * Seletor de brand color para login
 * Permite escolher entre usar cor do tema ou cor customizada
 */
export function BrandColorSelector({
  useThemeColor,
  themeColor,
  customColor,
  onModeChange,
  onCustomColorChange,
  disabled = false,
}: BrandColorSelectorProps) {
  const themeColorHex = hslToHex(themeColor);
  const customColorHex = customColor ? hslToHex(customColor) : themeColorHex;

  return (
    <div className="space-y-4">
      <RadioGroup
        value={useThemeColor ? 'theme' : 'custom'}
        onValueChange={(value) => onModeChange(value === 'theme')}
        disabled={disabled}
      >
        {/* Opção 1: Usar cor do tema */}
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="theme" id="color-theme" />
          <Label htmlFor="color-theme" className="flex-1 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Usar cor do tema do ambiente</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cor atual: {themeColorHex}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-md border-2 border-border"
                style={{ backgroundColor: themeColorHex }}
              />
            </div>
          </Label>
        </div>

        {/* Opção 2: Cor customizada */}
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="color-custom" />
          <Label htmlFor="color-custom" className="flex-1 cursor-pointer">
            <p className="font-medium">Usar cor customizada para login</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Escolha uma cor diferente apenas para a página de login
            </p>
          </Label>
        </div>
      </RadioGroup>

      {/* Color Picker (mostra apenas se custom selecionado) */}
      {!useThemeColor && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <ThemeColorPicker
              value={customColorHex}
              onChange={(hex) => {
                // Converte HEX para HSL e notifica
                const hsl = hexToHSL(hex);
                onCustomColorChange(hsl);
              }}
              label="Cor do Login"
              disabled={disabled}
              showPalette={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper: converte HEX para HSL
function hexToHSL(hex: string): BrandColor {
  // Remove # se presente
  hex = hex.replace(/^#/, '');

  // Parse RGB
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    hue: Math.round(h * 360),
    saturation: Math.round(s * 100),
    lightness: Math.round(l * 100),
  };
}
