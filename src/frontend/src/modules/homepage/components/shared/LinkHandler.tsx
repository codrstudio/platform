/**
 * LinkHandler Component
 *
 * Manages flexible navigation between:
 * - Relative links within current portal
 * - Links to other portals
 * - External links
 *
 * Provides both a component wrapper and utility functions
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortal } from '@/contexts/PortalContext';
import type { LinkConfig } from '../../types';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Resolve a link configuration to an actual URL
 *
 * @param link - Link configuration
 * @param currentPortalId - Current portal ID (for relative links)
 * @returns Resolved URL string
 */
export function resolveLink(link: LinkConfig, currentPortalId: string): string {
  switch (link.type) {
    case 'relative':
      // Relative to current portal
      return `/${currentPortalId}${link.route}`;

    case 'portal':
      // Link to another portal
      return `/${link.portal}${link.route}`;

    case 'external':
      // External URL
      return link.url;

    default:
      console.warn('Unknown link type:', link);
      return '#';
  }
}

/**
 * Check if a link is external
 */
export function isExternalLink(link: LinkConfig): boolean {
  return link.type === 'external';
}

/**
 * Check if a link should open in a new tab
 */
export function shouldOpenInNewTab(link: LinkConfig): boolean {
  return link.target === '_blank' || (link.type === 'external' && link.target !== '_self');
}

/**
 * Get link attributes for anchor elements
 */
export function getLinkAttributes(link: LinkConfig, currentPortalId: string): {
  href: string;
  target?: string;
  rel?: string;
} {
  const href = resolveLink(link, currentPortalId);
  const target = link.target || (link.type === 'external' ? '_blank' : '_self');

  return {
    href,
    target,
    rel: target === '_blank' ? 'noopener noreferrer' : undefined,
  };
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook for programmatic navigation
 */
export function useNavigateLink() {
  const navigate = useNavigate();
  const { portalId } = usePortal();

  return (link: LinkConfig) => {
    const url = resolveLink(link, portalId);

    if (isExternalLink(link)) {
      if (shouldOpenInNewTab(link)) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = url;
      }
    } else {
      navigate(url);
    }
  };
}

// ============================================================================
// Components
// ============================================================================

/**
 * Props for LinkHandler component
 */
interface LinkHandlerProps {
  link: LinkConfig;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

/**
 * LinkHandler Component
 *
 * Renders the appropriate link element based on link type
 *
 * @example
 * <LinkHandler link={{ type: 'relative', route: '/dashboard' }}>
 *   Dashboard
 * </LinkHandler>
 *
 * @example
 * <LinkHandler link={{ type: 'portal', portal: 'admin', route: '/settings' }}>
 *   Admin Settings
 * </LinkHandler>
 *
 * @example
 * <LinkHandler link={{ type: 'external', url: 'https://google.com' }}>
 *   Google
 * </LinkHandler>
 */
export const LinkHandler: React.FC<LinkHandlerProps> = ({
  link,
  children,
  className,
  onClick,
  disabled,
  'aria-label': ariaLabel,
}) => {
  const { portalId } = usePortal();
  const href = resolveLink(link, portalId);
  const shouldNewTab = shouldOpenInNewTab(link);

  // Handle disabled state
  if (disabled) {
    return (
      <span
        className={className}
        aria-label={ariaLabel}
        aria-disabled="true"
        style={{ opacity: 0.5, cursor: 'not-allowed' }}
      >
        {children}
      </span>
    );
  }

  // External links
  if (isExternalLink(link)) {
    return (
      <a
        href={href}
        target={shouldNewTab ? '_blank' : '_self'}
        rel={shouldNewTab ? 'noopener noreferrer' : undefined}
        className={className}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  // Internal links (use React Router)
  return (
    <Link
      to={href}
      target={link.target}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
};

/**
 * Button that navigates on click
 */
interface NavigationButtonProps {
  link: LinkConfig;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  link,
  children,
  className,
  variant = 'default',
  size = 'md',
  disabled,
}) => {
  const navigateLink = useNavigateLink();

  const handleClick = () => {
    if (!disabled) {
      navigateLink(link);
    }
  };

  // Import Button dynamically to avoid circular dependencies
  const Button = require('@/components/ui/button').Button;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

/**
 * Card that navigates on click
 */
interface ClickableCardProps {
  link: LinkConfig;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const ClickableCard: React.FC<ClickableCardProps> = ({
  link,
  children,
  className,
  disabled,
}) => {
  const navigateLink = useNavigateLink();

  const handleClick = () => {
    if (!disabled) {
      navigateLink(link);
    }
  };

  return (
    <div
      className={className}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
};

// ============================================================================
// Context Provider (Optional)
// ============================================================================

/**
 * Context for providing link resolution functions
 */
interface LinkContextValue {
  resolveLink: (link: LinkConfig) => string;
  navigateToLink: (link: LinkConfig) => void;
}

const LinkContext = React.createContext<LinkContextValue | undefined>(undefined);

export const LinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { portalId } = usePortal();
  const navigateLink = useNavigateLink();

  const value: LinkContextValue = {
    resolveLink: (link) => resolveLink(link, portalId),
    navigateToLink: navigateLink,
  };

  return <LinkContext.Provider value={value}>{children}</LinkContext.Provider>;
};

export function useLinkContext(): LinkContextValue {
  const context = React.useContext(LinkContext);
  if (!context) {
    throw new Error('useLinkContext must be used within LinkProvider');
  }
  return context;
}

// ============================================================================
// Exports
// ============================================================================

export default LinkHandler;