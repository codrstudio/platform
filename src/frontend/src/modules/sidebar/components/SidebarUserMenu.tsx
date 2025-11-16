import * as React from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export interface SidebarUserMenuProps {
  avatarUrl?: string;
  showProfileLink?: boolean;
  profilePath?: string;
  customActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }>;
  className?: string;
}

export function SidebarUserMenu({
  avatarUrl,
  showProfileLink = true,
  profilePath = '/profile',
  customActions = [],
  className,
}: SidebarUserMenuProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const isCollapsed = state === 'collapsed';

  // Se não está autenticado, não renderiza nada
  if (!isAuthenticated || !user) {
    return null;
  }

  // Fallback para iniciais do nome
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    navigate(profilePath);
  };

  return (
    <SidebarMenuItem className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={avatarUrl || user.avatar} alt={user.name || 'User'} />
              <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            {/* Informações do usuário (apenas quando expandido) */}
            <div
              className={cn(
                'grid flex-1 text-left text-sm leading-tight transition-all duration-200',
                'group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0'
              )}
            >
              <span className="truncate font-semibold">{user.name || 'Usuário'}</span>
              <span className="truncate text-xs text-sidebar-foreground/70">
                {user.email || ''}
              </span>
            </div>
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-56"
          side={isCollapsed ? 'right' : 'bottom'}
          align="start"
          sideOffset={8}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatarUrl || user.avatar} alt={user.name || 'User'} />
                <AvatarFallback className="rounded-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name || 'Usuário'}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email || ''}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Link para perfil */}
          {showProfileLink && (
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
          )}

          {/* Ações customizadas */}
          {customActions.map((action, index) => (
            <DropdownMenuItem key={index} onClick={action.onClick}>
              {action.icon && <span className="mr-2">{action.icon}</span>}
              <span>{action.label}</span>
            </DropdownMenuItem>
          ))}

          {(showProfileLink || customActions.length > 0) && <DropdownMenuSeparator />}

          {/* Logout */}
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
