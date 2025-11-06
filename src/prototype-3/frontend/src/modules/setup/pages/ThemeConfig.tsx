import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { ColorPicker } from '@/components/theme/ColorPicker';
import { ThemePreview } from '@/components/theme/ThemePreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Sun, Moon, Monitor, CheckCircle, AlertTriangle, RotateCcw, Info } from 'lucide-react';
import type { ThemeMode, BrandColorHSL } from '@/types/theme';

export default function ThemeConfig() {
  const { rawTheme, theme, brandColor, settingsKey, setTheme, setBrandColor, setSettingsKey, validateContrast } = useTheme();
  const [localTheme, setLocalTheme] = useState<ThemeMode>(rawTheme);
  const [localBrandColor, setLocalBrandColor] = useState<BrandColorHSL | null>(brandColor);
  const [localSettingsKey, setLocalSettingsKey] = useState(settingsKey);
  const [contrastWarning, setContrastWarning] = useState<string | null>(null);
  const hasChanges = localTheme !== rawTheme || localBrandColor !== brandColor || localSettingsKey !== settingsKey;
  const handleBrandColorChange = (color: BrandColorHSL) => {
    setLocalBrandColor(color);
    const background = theme === 'dark' ? '222 84% 5%' : '0 0% 100%';
    const validation = validateContrast(color, background);
    if (!validation.isValid && validation.suggested) {
      setContrastWarning(`Contrast ratio ${validation.ratio}:1 is below WCAG AA (4.5:1). Consider adjusting to improve accessibility.`);
    } else {
      setContrastWarning(null);
    }
  };
  const handleSave = () => {
    setTheme(localTheme);
    if (localBrandColor) setBrandColor(localBrandColor);
    setSettingsKey(localSettingsKey);
    setContrastWarning(null);
  };
  const handleReset = () => {
    setLocalTheme(rawTheme);
    setLocalBrandColor(brandColor);
    setLocalSettingsKey(settingsKey);
    setContrastWarning(null);
  };
  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Theme Configuration</h1>
        <p className="text-muted-foreground">Customize the visual appearance of your portal with theme modes, brand colors, and settings keys.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Theme Mode</CardTitle><CardDescription>Choose between light, dark, or system preference</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => setLocalTheme('light')} className={'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ' + (localTheme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                  <Sun className="w-6 h-6" /><span className="text-sm font-medium">Light</span>
                </button>
                <button onClick={() => setLocalTheme('dark')} className={'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ' + (localTheme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                  <Moon className="w-6 h-6" /><span className="text-sm font-medium">Dark</span>
                </button>
                <button onClick={() => setLocalTheme('system')} className={'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ' + (localTheme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                  <Monitor className="w-6 h-6" /><span className="text-sm font-medium">System</span>
                </button>
              </div>
              {localTheme === 'system' && (<Alert><Monitor className="h-4 w-4" /><AlertDescription className="text-xs">System mode follows your device theme preference. Currently: <strong>{theme}</strong></AlertDescription></Alert>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Brand Color</CardTitle><CardDescription>Customize your primary brand color</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <ColorPicker value={localBrandColor} onChange={handleBrandColorChange} label="Primary Color" />
              {contrastWarning && (<Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription className="text-xs">{contrastWarning}</AlertDescription></Alert>)}
              {localBrandColor && !contrastWarning && (<Alert><CheckCircle className="h-4 w-4 text-success" /><AlertDescription className="text-xs">Color meets WCAG AA accessibility standards</AlertDescription></Alert>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Settings Key</CardTitle><CardDescription>Share theme across portals with same key</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="settings-key">Settings Key</Label>
                <Input id="settings-key" value={localSettingsKey} onChange={(e) => setLocalSettingsKey(e.target.value)} placeholder="default" className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1.5">Portals with the same settings key will share theme preferences</p>
              </div>
              <Alert><Info className="h-4 w-4" /><AlertDescription className="text-xs">Storage keys: <code className="text-xs bg-muted px-1 py-0.5 rounded">{localSettingsKey}:theme</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">{localSettingsKey}:brand-color</code></AlertDescription></Alert>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={!hasChanges} className="flex-1"><CheckCircle className="w-4 h-4 mr-2" />Save Changes</Button>
            <Button onClick={handleReset} variant="outline" disabled={!hasChanges}><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
          </div>
          {hasChanges && (<Alert><AlertTriangle className="h-4 w-4" /><AlertDescription className="text-xs">You have unsaved changes. Click "Save Changes" to apply them.</AlertDescription></Alert>)}
        </div>
        <div className="space-y-6">
          <div className="sticky top-6 space-y-4">
            <h2 className="text-lg font-semibold">Live Preview</h2>
            <p className="text-sm text-muted-foreground">Preview shows how your theme will look in both modes</p>
            <ThemePreview brandColor={localBrandColor} theme="light" />
            <Separator />
            <ThemePreview brandColor={localBrandColor} theme="dark" />
          </div>
        </div>
      </div>
    </div>
  );
}
