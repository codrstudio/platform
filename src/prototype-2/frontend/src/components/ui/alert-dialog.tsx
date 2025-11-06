/**
 * AlertDialog Component - shadcn/ui pattern
 *
 * Displays modal confirmation dialogs for critical actions.
 * Based on shadcn/ui AlertDialog component.
 */

import * as React from 'react';
import { X } from 'lucide-react';

interface AlertDialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | undefined>(undefined);

function useAlertDialogContext() {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error('AlertDialog components must be used within AlertDialog');
  }
  return context;
}

/**
 * AlertDialog root component
 */
export interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open: controlledOpen, onOpenChange, children }: AlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      }
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
    },
    [onOpenChange, isControlled]
  );

  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

/**
 * AlertDialogTrigger - Button to open dialog
 */
export interface AlertDialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogTrigger({ children, asChild, className }: AlertDialogTriggerProps) {
  const { onOpenChange } = useAlertDialogContext();

  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as { onClick?: (e: React.MouseEvent) => void };
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        // Call original onClick if exists
        if (childProps.onClick) {
          childProps.onClick(e);
        }
        onOpenChange(true);
      },
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button onClick={() => onOpenChange(true)} className={className}>
      {children}
    </button>
  );
}

/**
 * AlertDialogPortal - Renders content in portal (for now, just returns children)
 */
export function AlertDialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * AlertDialogOverlay - Backdrop behind dialog
 */
export function AlertDialogOverlay({ className = '' }: { className?: string }) {
  const { open, onOpenChange } = useAlertDialogContext();

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity ${className}`}
      onClick={() => onOpenChange(false)}
      aria-hidden="true"
    />
  );
}

/**
 * AlertDialogContent - Main dialog content
 */
export interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogContent({ children, className = '' }: AlertDialogContentProps) {
  const { open, onOpenChange } = useAlertDialogContext();

  if (!open) return null;

  return (
    <>
      <AlertDialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`
            relative w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-lg
            dark:border-gray-800 dark:bg-gray-900
            ${className}
          `}
          role="alertdialog"
          aria-modal="true"
        >
          {children}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none dark:ring-offset-gray-950"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * AlertDialogHeader - Header section
 */
export function AlertDialogHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}>{children}</div>;
}

/**
 * AlertDialogFooter - Footer section (action buttons)
 */
export function AlertDialogFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}>{children}</div>;
}

/**
 * AlertDialogTitle - Dialog title
 */
export function AlertDialogTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}>{children}</h2>;
}

/**
 * AlertDialogDescription - Dialog description
 */
export function AlertDialogDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>{children}</p>;
}

/**
 * AlertDialogAction - Confirm action button
 */
export interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogAction({ children, className = '', onClick, ...props }: AlertDialogActionProps) {
  const { onOpenChange } = useAlertDialogContext();

  return (
    <button
      className={`
        inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white
        hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        dark:bg-red-700 dark:hover:bg-red-800
        ${className}
      `}
      onClick={(e) => {
        if (onClick) onClick(e);
        onOpenChange(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * AlertDialogCancel - Cancel action button
 */
export interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogCancel({ children, className = '', onClick, ...props }: AlertDialogCancelProps) {
  const { onOpenChange } = useAlertDialogContext();

  return (
    <button
      className={`
        mt-2 inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900
        hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
        sm:mt-0
        dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700
        ${className}
      `}
      onClick={(e) => {
        if (onClick) onClick(e);
        onOpenChange(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
