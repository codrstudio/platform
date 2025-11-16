/**
 * Menu Items Editor - Shared Types
 *
 * Types compartilhados entre os componentes do editor visual de menu items
 */

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  badge?: {
    text: string;
    variant: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  };
  onClick?: () => void;
  permission?: string;
  children?: MenuItem[];
  disabled?: boolean;
}

export interface MenuItemsEditorProps {
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
}

export interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  onUpdate: (updates: Partial<MenuItem>) => void;
  onRemove: () => void;
  onEdit: () => void;
}

export interface MenuItemDialogProps {
  item: MenuItem | null;
  open: boolean;
  onSave: (item: MenuItem) => void;
  onClose: () => void;
}

export interface SubmenuEditorProps {
  submenus: MenuItem[];
  onChange: (submenus: MenuItem[]) => void;
}
