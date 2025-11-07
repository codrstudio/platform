import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';
import { FileX, Inbox, Search, FolderOpen, MessageSquare } from 'lucide-react';

/**
 * Empty State Component
 *
 * SPEC-ERR-UI-022 a SPEC-ERR-UI-023: Estados vazios com ícone, título, descrição e ação
 * Para quando não há dados para exibir (não é erro, mas relacionado)
 */

export interface EmptyProps {
  icon?: LucideIcon;
  iconClassName?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: {
    container: 'py-6 px-4',
    icon: 'h-8 w-8',
    title: 'text-base',
    description: 'text-sm'
  },
  md: {
    container: 'py-8 px-6',
    icon: 'h-12 w-12',
    title: 'text-lg',
    description: 'text-sm'
  },
  lg: {
    container: 'py-12 px-8',
    icon: 'h-16 w-16',
    title: 'text-xl',
    description: 'text-base'
  }
};

export function Empty({
  icon: Icon = Inbox,
  iconClassName,
  title,
  description,
  action,
  className,
  size = 'md'
}: EmptyProps) {
  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        className
      )}
    >
      <Icon
        className={cn(
          'mb-4 text-muted-foreground/50',
          sizes.icon,
          iconClassName
        )}
        aria-hidden="true"
      />

      <h3 className={cn('font-medium text-foreground', sizes.title)}>
        {title}
      </h3>

      {description && (
        <p className={cn('mt-2 text-muted-foreground', sizes.description)}>
          {description}
        </p>
      )}

      {action && (
        <Button
          variant={action.variant || 'default'}
          onClick={action.onClick}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * Preset Empty States for common scenarios
 */

export function EmptySearch({
  onClear,
  className
}: {
  onClear?: () => void;
  className?: string;
}) {
  return (
    <Empty
      icon={Search}
      title="Nenhum resultado encontrado"
      description="Tente ajustar seus filtros ou termos de busca"
      action={
        onClear
          ? {
              label: 'Limpar busca',
              onClick: onClear,
              variant: 'outline'
            }
          : undefined
      }
      className={className}
    />
  );
}

export function EmptyData({
  onCreate,
  className,
  title = 'Nenhum item ainda',
  description = 'Comece criando seu primeiro item',
  createLabel = 'Criar item'
}: {
  onCreate?: () => void;
  className?: string;
  title?: string;
  description?: string;
  createLabel?: string;
}) {
  return (
    <Empty
      icon={FileX}
      title={title}
      description={description}
      action={
        onCreate
          ? {
              label: createLabel,
              onClick: onCreate
            }
          : undefined
      }
      className={className}
    />
  );
}

export function EmptyFolder({
  onUpload,
  className
}: {
  onUpload?: () => void;
  className?: string;
}) {
  return (
    <Empty
      icon={FolderOpen}
      title="Esta pasta está vazia"
      description="Adicione arquivos para começar"
      action={
        onUpload
          ? {
              label: 'Fazer upload',
              onClick: onUpload,
              variant: 'outline'
            }
          : undefined
      }
      className={className}
    />
  );
}

export function EmptyMessages({
  onStartChat,
  className
}: {
  onStartChat?: () => void;
  className?: string;
}) {
  return (
    <Empty
      icon={MessageSquare}
      title="Nenhuma mensagem"
      description="Envie uma mensagem para iniciar a conversa"
      action={
        onStartChat
          ? {
              label: 'Iniciar conversa',
              onClick: onStartChat
            }
          : undefined
      }
      className={className}
    />
  );
}