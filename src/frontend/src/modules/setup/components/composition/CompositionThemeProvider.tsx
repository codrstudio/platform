/**
 * CompositionThemeProvider Component
 * DESIGN Reference: DES-COMP-004
 *
 * Provides theme isolation for composition preview by applying
 * CSS variables only within the preview container.
 */

import React, { useEffect, useRef } from 'react';
import type { CompositionWithConfigs } from '@/core/composition/types-extended';

interface CompositionThemeProviderProps {
  /** The composition being themed */
  composition: CompositionWithConfigs;

  /** Child components to render within the theme context */
  children: React.ReactNode;

  /** Portal ID for theme variations */
  portalId?: string;
}

/**
 * Provides isolated theme context for composition preview
 *
 * Similar to LoginThemeProvider, this component applies CSS variables
 * only within its container using data-composition-preview attribute.
 */
export function CompositionThemeProvider({
  composition,
  children,
  portalId = 'default',
}: CompositionThemeProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Apply composition-specific CSS variables
    const applyThemeVariables = () => {
      // Layout width variables
      const widthMap = {
        full: '100%',
        lg: '1024px',
        md: '768px',
        sm: '640px',
      };

      container.style.setProperty(
        '--composition-max-width',
        widthMap[composition.layout.width]
      );

      // Slot visibility variables
      container.style.setProperty(
        '--composition-navbar-display',
        composition.slots.navbar ? 'block' : 'none'
      );
      container.style.setProperty(
        '--composition-sidebar-display',
        composition.slots.sidebar ? 'flex' : 'none'
      );
      container.style.setProperty(
        '--composition-companion-display',
        composition.slots.companion ? 'flex' : 'none'
      );
      container.style.setProperty(
        '--composition-breadcrumb-display',
        composition.slots.breadcrumb ? 'block' : 'none'
      );
      container.style.setProperty(
        '--composition-footer-display',
        composition.slots.footer ? 'block' : 'none'
      );

      // Portal-specific theming
      container.style.setProperty('--composition-portal-id', portalId);

      // Add spacing variables for consistent layout
      container.style.setProperty('--composition-spacing-xs', '0.25rem');
      container.style.setProperty('--composition-spacing-sm', '0.5rem');
      container.style.setProperty('--composition-spacing-md', '1rem');
      container.style.setProperty('--composition-spacing-lg', '1.5rem');
      container.style.setProperty('--composition-spacing-xl', '2rem');

      // Add transition variables for smooth updates
      container.style.setProperty(
        '--composition-transition',
        'all 0.2s ease-in-out'
      );

      // Border radius variables for consistency
      container.style.setProperty('--composition-radius-sm', '0.25rem');
      container.style.setProperty('--composition-radius-md', '0.5rem');
      container.style.setProperty('--composition-radius-lg', '0.75rem');

      // Shadow variables for depth
      container.style.setProperty(
        '--composition-shadow-sm',
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      );
      container.style.setProperty(
        '--composition-shadow-md',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      );
      container.style.setProperty(
        '--composition-shadow-lg',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      );

      // Component-specific configurations
      if (composition.slotConfigs) {
        // Apply navbar config
        if (composition.slotConfigs['blueprint-header']) {
          const navConfig = composition.slotConfigs['blueprint-header'];
          container.style.setProperty(
            '--navbar-sticky',
            navConfig.sticky ? 'sticky' : 'relative'
          );
          container.style.setProperty(
            '--navbar-height',
            navConfig.height || '3.5rem'
          );
        }

        // Apply sidebar config
        if (composition.slotConfigs['blueprint-sidebar']) {
          const sidebarConfig = composition.slotConfigs['blueprint-sidebar'];
          const widthMap = {
            sm: '200px',
            md: '260px',
            lg: '320px',
          };
          container.style.setProperty(
            '--sidebar-width',
            widthMap[sidebarConfig.width as keyof typeof widthMap] || '260px'
          );
          container.style.setProperty(
            '--sidebar-collapsible',
            sidebarConfig.collapsible ? '1' : '0'
          );
        }
      }
    };

    // Apply theme on mount and when composition changes
    applyThemeVariables();

    // Clean up function to remove custom properties
    return () => {
      const properties = [
        '--composition-max-width',
        '--composition-navbar-display',
        '--composition-sidebar-display',
        '--composition-companion-display',
        '--composition-breadcrumb-display',
        '--composition-footer-display',
        '--composition-portal-id',
        '--composition-spacing-xs',
        '--composition-spacing-sm',
        '--composition-spacing-md',
        '--composition-spacing-lg',
        '--composition-spacing-xl',
        '--composition-transition',
        '--composition-radius-sm',
        '--composition-radius-md',
        '--composition-radius-lg',
        '--composition-shadow-sm',
        '--composition-shadow-md',
        '--composition-shadow-lg',
        '--navbar-sticky',
        '--navbar-height',
        '--sidebar-width',
        '--sidebar-collapsible',
      ];

      properties.forEach((prop) => {
        container.style.removeProperty(prop);
      });
    };
  }, [composition, portalId]);

  return (
    <div
      ref={containerRef}
      data-composition-preview="true"
      className="composition-theme-provider contents"
    >
      {children}
    </div>
  );
}

/**
 * Hook to access composition theme variables
 */
export function useCompositionTheme() {
  const getVariable = (name: string): string | null => {
    const element = document.querySelector('[data-composition-preview="true"]');
    if (!element) return null;

    const computedStyle = window.getComputedStyle(element);
    return computedStyle.getPropertyValue(name).trim() || null;
  };

  return {
    getVariable,
    maxWidth: getVariable('--composition-max-width'),
    navbarDisplay: getVariable('--composition-navbar-display'),
    sidebarDisplay: getVariable('--composition-sidebar-display'),
    companionDisplay: getVariable('--composition-companion-display'),
    breadcrumbDisplay: getVariable('--composition-breadcrumb-display'),
    footerDisplay: getVariable('--composition-footer-display'),
  };
}