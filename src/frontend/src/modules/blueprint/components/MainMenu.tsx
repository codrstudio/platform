import { Home, FileText, Settings, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MainMenuProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

const menuItems: MenuItem[] = [
  { id: 'home', label: 'Início', icon: Home, href: '#' },
  { id: 'docs', label: 'Documentação', icon: FileText, href: '#' },
  { id: 'settings', label: 'Configurações', icon: Settings, href: '#' },
  { id: 'about', label: 'Sobre', icon: Info, href: '#' },
];

export function MainMenu({ orientation = 'horizontal', className }: MainMenuProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <nav
      className={cn(
        'flex gap-1',
        isHorizontal ? 'flex-row items-center' : 'flex-col',
        className
      )}
    >
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.id}
            variant="ghost"
            size={isHorizontal ? 'sm' : 'default'}
            className={cn(
              'gap-2',
              isHorizontal
                ? 'px-3'
                : 'w-full justify-start px-3 py-2'
            )}
            asChild
          >
            <a href={item.href}>
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </a>
          </Button>
        );
      })}
    </nav>
  );
}
