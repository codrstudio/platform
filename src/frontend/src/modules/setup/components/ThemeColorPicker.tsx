// Reusable Theme Color Picker Component
// Extracted from ThemeConfig.tsx for reuse in Realm and Portal configurations
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Lock } from 'lucide-react';

export interface ThemeColorPickerProps {
  /** Current hex color value (e.g., "#0ea5e9") */
  value: string;

  /** Callback when color changes */
  onChange?: (hex: string) => void;

  /** Label for the color picker */
  label: string;

  /** Whether the picker is readonly (cannot be changed) */
  readonly?: boolean;

  /** Whether to show a lock icon indicating inherited/locked state */
  locked?: boolean;

  /** Whether to show the color palette preview */
  showPalette?: boolean;

  /** Optional description text below the label */
  description?: string;
}

export function ThemeColorPicker({
  value,
  onChange,
  label,
  readonly = false,
  locked = false,
  showPalette = true,
  description
}: ThemeColorPickerProps) {
  const handleColorChange = (newValue: string) => {
    if (!readonly && onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Color Input */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Label htmlFor={`color-input-${label}`}>{label}</Label>
            {locked && (
              <Lock className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <Input
            id={`color-input-${label}`}
            type="color"
            value={value}
            onChange={(e) => handleColorChange(e.target.value)}
            disabled={readonly}
            className="h-12 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Hex Input */}
        <div className="space-y-2 flex-1">
          <Label htmlFor={`hex-input-${label}`}>Valor Hexadecimal</Label>
          <Input
            id={`hex-input-${label}`}
            type="text"
            value={value}
            onChange={(e) => handleColorChange(e.target.value)}
            placeholder="#0ea5e9"
            pattern="^#[0-9A-Fa-f]{6}$"
            disabled={readonly}
            className="disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {showPalette && (
        <>
          <Separator />

          {/* Palette Preview */}
          <div className="space-y-2">
            <Label>Preview da Paleta</Label>
            <div className="grid grid-cols-5 gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="space-y-1">
                  <div
                    className="h-16 rounded border"
                    style={{
                      backgroundColor: value,
                      opacity: shade === 500 ? 1 : shade < 500 ? shade / 500 : (1000 - shade) / 500
                    }}
                  />
                  <p className="text-xs text-center text-muted-foreground">{shade}</p>
                </div>
              ))}
            </div>
            {!readonly && (
              <p className="text-sm text-muted-foreground mt-4">
                A paleta completa será gerada automaticamente com base na cor principal,
                garantindo contraste WCAG AA.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
