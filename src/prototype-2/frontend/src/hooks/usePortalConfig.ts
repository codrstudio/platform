// Hook to fetch portal configuration
// Mock implementation - will be replaced with JQEL in task 1.4
// Based on SPEC-concepts.md Portal concept

import { useState, useEffect } from 'react';
import type { Portal } from '../types/portal';

// Mock portal configurations (will be replaced with JQEL in task 1.4)
const MOCK_PORTALS: Portal[] = [
  {
    portalId: 'main',
    name: 'Main Portal',
    description: 'Main application portal',
    path: '/',
    activeModules: [],
    settings: {},
    removable: false,
  },
  {
    portalId: 'setup',
    name: 'Setup Portal',
    description: 'Platform setup and configuration',
    path: '/setup',
    activeModules: ['setup'],
    settings: {},
    removable: false,
  },
];

interface UsePortalConfigResult {
  portal: Portal | null;
  loading: boolean;
  error: Error | null;
}

export function usePortalConfig(portalId: string): UsePortalConfigResult {
  const [portal, setPortal] = useState<Portal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate async fetch (mock)
    const fetchPortal = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Find portal
        const found = MOCK_PORTALS.find(p => p.portalId === portalId);

        if (!found) {
          throw new Error(`Portal ${portalId} not found`);
        }

        setPortal(found);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchPortal();
  }, [portalId]);

  return { portal, loading, error };
}
