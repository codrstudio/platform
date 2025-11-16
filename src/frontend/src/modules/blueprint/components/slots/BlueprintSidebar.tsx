import { ThemeToggleCompact } from '@/components/theme/ThemeToggle';
import { Separator } from '@/components/ui/separator';
import { BrandLogo } from '../BrandLogo';
import { MainMenu } from '../MainMenu';
import { UserMenu } from '../UserMenu';

/**
 * BlueprintSidebar Slot Component
 *
 * Layout vertical para sidebar:
 * ┌─────────────────┐
 * │ Ícone + Brand   │ ← header (fixed top)
 * ├─────────────────┤
 * │ Menu Items      │ ← content (scrollable)
 * │ (overflow)      │
 * ├─────────────────┤
 * │ Theme Switch    │ ← footer (fixed bottom)
 * │ Avatar ▼        │
 * └─────────────────┘
 */
export function BlueprintSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        {/* Header: Logo + Brand (fixed top) */}
        <div className="flex h-14 items-center border-b px-4">
          <BrandLogo variant="full" />
        </div>

        {/* Content: Menu Items (scrollable) */}
        <div className="flex-1 overflow-y-auto p-4">
          <MainMenu orientation="vertical" />
        </div>

        {/* Footer: Theme + User (fixed bottom) */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between gap-2">
            <ThemeToggleCompact />
            <Separator orientation="vertical" className="h-6" />
            <UserMenu />
          </div>
        </div>
      </div>
    </aside>
  );
}
