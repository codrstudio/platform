import { ThemeToggleCompact } from '@/components/theme/ThemeToggle';
import { Separator } from '@/components/ui/separator';
import { BrandLogo } from '../BrandLogo';
import { MainMenu } from '../MainMenu';
import { UserMenu } from '../UserMenu';

/**
 * BlueprintHeader Slot Component
 *
 * Layout horizontal para navbar:
 * [Logo + Brand] ─── [Menu Items] ─── [Theme Switch | Avatar ▼]
 */
export function BlueprintHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Left: Logo + Brand */}
        <div className="mr-4 flex">
          <BrandLogo variant="full" />
        </div>

        {/* Middle: Menu */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <MainMenu orientation="horizontal" />
          </div>

          {/* Right: Theme Switch + User Menu */}
          <nav className="flex items-center gap-2">
            <ThemeToggleCompact />
            <Separator orientation="vertical" className="h-6" />
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}
