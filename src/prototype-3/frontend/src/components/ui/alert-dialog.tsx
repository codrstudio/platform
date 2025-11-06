/**
 * Alert Dialog Component
 *
 * Modal dialog for confirmations and alerts based on shadcn/ui patterns
 */

import * as React from "react";
import { cn } from "../../lib/utils";

interface AlertDialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue>({
  open: false,
  onOpenChange: () => {},
});

export interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({
  open: controlledOpen,
  onOpenChange,
  children,
}: AlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const handleOpenChange =
    onOpenChange !== undefined ? onOpenChange : setUncontrolledOpen;

  return (
    <AlertDialogContext.Provider
      value={{ open, onOpenChange: handleOpenChange }}
    >
      {children}
    </AlertDialogContext.Provider>
  );
}

export interface AlertDialogContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function AlertDialogContent({
  className,
  children,
  ...props
}: AlertDialogContentProps) {
  const { open, onOpenChange } = React.useContext(AlertDialogContext);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        onClick={() => onOpenChange(false)}
      />

      {/* Content */}
      <div
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

export interface AlertDialogHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function AlertDialogHeader({
  className,
  ...props
}: AlertDialogHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

export interface AlertDialogFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function AlertDialogFooter({
  className,
  ...props
}: AlertDialogFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  );
}

export interface AlertDialogTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export function AlertDialogTitle({
  className,
  ...props
}: AlertDialogTitleProps) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold",
        className
      )}
      {...props}
    />
  );
}

export interface AlertDialogDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function AlertDialogDescription({
  className,
  ...props
}: AlertDialogDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export interface AlertDialogActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function AlertDialogAction({
  className,
  ...props
}: AlertDialogActionProps) {
  const { onOpenChange } = React.useContext(AlertDialogContext);

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2",
        className
      )}
      onClick={(e) => {
        props.onClick?.(e);
        if (!e.defaultPrevented) {
          onOpenChange(false);
        }
      }}
      {...props}
    />
  );
}

export interface AlertDialogCancelProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function AlertDialogCancel({
  className,
  ...props
}: AlertDialogCancelProps) {
  const { onOpenChange } = React.useContext(AlertDialogContext);

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-2 sm:mt-0",
        className
      )}
      onClick={(e) => {
        props.onClick?.(e);
        onOpenChange(false);
      }}
      {...props}
    />
  );
}
