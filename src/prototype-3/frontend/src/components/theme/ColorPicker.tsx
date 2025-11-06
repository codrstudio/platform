/**
 * Color Picker Component
 *
 * Visual color picker with hex input and preview.
 *
 * References:
 * - SPEC-theming.md (SPEC-TH-AP-012 to SPEC-TH-AP-016)
 */

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { hexToHSL, hslToHex } from '@/services/theme/paletteGenerator';
import type { BrandColorHSL } from '@/types/theme';

interface ColorPickerProps {
  value: BrandColorHSL | null;
  onChange: (color: BrandColorHSL) => void;
  label?: string;
  className?: string;
}

/**
 * Color Picker Component
 * SPEC-TH-BC-007: Accept HEX and convert to HSL
 */
export function ColorPicker({ value, onChange, label = 'Color', className }: ColorPickerProps) {
  // Convert HSL to HEX for display
  const [hexValue, setHexValue] = useState(() => {
    if (!value) return '#3b82f6'; // Default blue
    try {
      return hslToHex(value);
    } catch {
      return '#3b82f6';
    }
  });

  // Sync hex value when prop changes
  useEffect(() => {
    if (value) {
      try {
        setHexValue(hslToHex(value));
      } catch {
        // Ignore conversion errors
      }
    }
  }, [value]);

  const handleColorChange = (hex: string) => {
    setHexValue(hex);

    // Validate hex format
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      try {
        const hsl = hexToHSL(hex);
        onChange(hsl);
      } catch (error) {
        console.error('Failed to convert HEX to HSL:', error);
      }
    }
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let hex = e.target.value;

    // Auto-prepend # if missing
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }

    handleColorChange(hex);
  };

  return (
    <div className={className}>
      <Label className="mb-2 block">{label}</Label>
      <div className="flex gap-3 items-center">
        {/* Color input (native color picker) */}
        <div className="relative">
          <input
            type="color"
            value={hexValue}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-14 h-14 rounded-md cursor-pointer border-2 border-input"
            style={{ colorScheme: 'light dark' }}
          />
        </div>

        {/* Hex input field */}
        <div className="flex-1">
          <Input
            type="text"
            value={hexValue}
            onChange={handleHexInputChange}
            placeholder="#3b82f6"
            maxLength={7}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground mt-1">
            HEX color code
          </p>
        </div>

        {/* Color preview swatch */}
        <div
          className="w-14 h-14 rounded-md border-2 border-input"
          style={{ backgroundColor: hexValue }}
          title={`Preview: ${hexValue}`}
        />
      </div>
    </div>
  );
}
