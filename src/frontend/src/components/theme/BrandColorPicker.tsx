// Brand Color Picker Component
// Based on SPEC-theming.md

import { useState } from 'react'
import { Palette } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { hslToString } from '@/lib/theme'

/**
 * BrandColorPicker Component
 *
 * Allows administrator to customize brand color
 * SPEC-TH-BC-*, SPEC-TH-AC-005 to SPEC-TH-AC-008
 */
export function BrandColorPicker() {
  const { brandColor, setBrandColorFromHex } = useTheme()
  const [localColor, setLocalColor] = useState(hslToString(brandColor))
  const [showPicker, setShowPicker] = useState(false)

  // Convert HSL to HEX for color input
  const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100
    l /= 100

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2

    let r = 0,
      g = 0,
      b = 0

    if (0 <= h && h < 60) {
      r = c
      g = x
      b = 0
    } else if (60 <= h && h < 120) {
      r = x
      g = c
      b = 0
    } else if (120 <= h && h < 180) {
      r = 0
      g = c
      b = x
    } else if (180 <= h && h < 240) {
      r = 0
      g = x
      b = c
    } else if (240 <= h && h < 300) {
      r = x
      g = 0
      b = c
    } else if (300 <= h && h < 360) {
      r = c
      g = 0
      b = x
    }

    const rHex = Math.round((r + m) * 255)
      .toString(16)
      .padStart(2, '0')
    const gHex = Math.round((g + m) * 255)
      .toString(16)
      .padStart(2, '0')
    const bHex = Math.round((b + m) * 255)
      .toString(16)
      .padStart(2, '0')

    return `#${rHex}${gHex}${bHex}`
  }

  const currentColorHex = hslToHex(brandColor.hue, brandColor.saturation, brandColor.lightness)

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    setLocalColor(hex)
  }

  const handleApply = () => {
    setBrandColorFromHex(localColor)
    setShowPicker(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Personalizar cor da marca"
      >
        <Palette className="h-5 w-5" />
        <span className="text-sm font-medium">Cor da marca</span>
        <div
          className="w-6 h-6 rounded border border-border"
          style={{ backgroundColor: currentColorHex }}
          aria-hidden="true"
        />
      </button>

      {showPicker && (
        <div className="absolute top-full mt-2 right-0 p-4 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[280px]">
          <div className="space-y-4">
            <div>
              <label htmlFor="color-picker" className="block text-sm font-medium mb-2">
                Escolha a cor principal da aplicação
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="color-picker"
                  type="color"
                  value={localColor}
                  onChange={handleColorChange}
                  className="w-16 h-16 rounded border border-border cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={localColor}
                    onChange={handleColorChange}
                    className="w-full px-3 py-2 rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="#rrggbb"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    HSL: {hslToString(brandColor)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApply}
                className="flex-1 px-3 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Aplicar
              </button>
              <button
                onClick={() => setShowPicker(false)}
                className="flex-1 px-3 py-2 rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
