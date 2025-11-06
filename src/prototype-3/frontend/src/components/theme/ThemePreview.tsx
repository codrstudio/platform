/**
 * Theme Preview Component
 *
 * Shows live preview of theme with buttons and text samples.
 *
 * References:
 * - SPEC-theming.md (SPEC-TH-MS-002, SPEC-TH-MS-005)
 * - SPEC-module-setup.md (SPEC-MS-TE-004, SPEC-MS-TE-005)
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import type { BrandColorHSL } from '@/types/theme';

interface ThemePreviewProps {
  brandColor: BrandColorHSL | null;
  theme: 'light' | 'dark';
  className?: string;
}

/**
 * Theme Preview Component
 * SPEC-TH-MS-004: Show preview in real time
 * SPEC-TH-MS-005: Show preview in both modes
 */
export function ThemePreview({ theme, className }: ThemePreviewProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Preview - {theme === 'light' ? 'Light' : 'Dark'} Mode
        </CardTitle>
        <CardDescription className="text-xs">
          See how your theme will look
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary button samples */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Primary Buttons</p>
          <div className="flex flex-wrap gap-2">
            <Button>Button</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="secondary">Secondary</Button>
          </div>
        </div>

        {/* Semantic color buttons */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Semantic Colors</p>
          <div className="grid grid-cols-2 gap-2">
            {/* Success */}
            <div className="flex items-center gap-2 p-2 rounded-md bg-success/10 text-success border border-success/20">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Success</span>
            </div>

            {/* Warning */}
            <div className="flex items-center gap-2 p-2 rounded-md bg-warning/10 text-warning border border-warning/20">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Warning</span>
            </div>

            {/* Error */}
            <div className="flex items-center gap-2 p-2 rounded-md bg-error/10 text-error border border-error/20">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Error</span>
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 p-2 rounded-md bg-info/10 text-info border border-info/20">
              <Info className="w-4 h-4" />
              <span className="text-xs font-medium">Info</span>
            </div>
          </div>
        </div>

        {/* Text samples with contrast validation */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Text Contrast</p>
          <div className="space-y-1 p-3 rounded-md bg-background border">
            <p className="text-sm font-semibold text-foreground">
              Heading Text (Foreground)
            </p>
            <p className="text-sm text-muted-foreground">
              Muted text for descriptions and secondary content
            </p>
            <p className="text-xs text-muted-foreground">
              Small text should still be readable
            </p>
          </div>
        </div>

        {/* Card sample */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Card Example</p>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Sample Card</CardTitle>
              <CardDescription className="text-xs">
                This is how cards will look with your theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Card content goes here with proper spacing and typography.
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
