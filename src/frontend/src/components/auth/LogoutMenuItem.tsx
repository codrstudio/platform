import { LogOut } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LogoutMenuItemProps {
  onLogoutComplete?: () => void;
}

/**
 * LogoutMenuItem Component
 *
 * Dropdown menu item for logging out the current user.
 * Calls the global AuthContext logout function.
 *
 * Part of the global platform infrastructure (not from auth module).
 */
export function LogoutMenuItem({ onLogoutComplete }: LogoutMenuItemProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      onLogoutComplete?.();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <DropdownMenuItem onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      <span>Sair</span>
    </DropdownMenuItem>
  );
}
