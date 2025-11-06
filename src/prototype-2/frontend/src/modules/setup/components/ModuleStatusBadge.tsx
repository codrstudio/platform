import { Check, X } from 'lucide-react';

interface ModuleStatusBadgeProps {
  active: boolean;
}

export function ModuleStatusBadge({ active }: ModuleStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
        active
          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      }`}
    >
      {active ? <Check size={12} /> : <X size={12} />}
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}
