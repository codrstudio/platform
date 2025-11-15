// hooks/useBlueprintConfig.ts
// SPEC-DA-TQ-001: Uses useJQELQuery for SELECT operations
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useJQELQuery } from '@/hooks/useJQEL';
import type { BlueprintConfig } from '../types';

interface InstanceConfig {
  config: BlueprintConfig;
}

export function useBlueprintConfig() {
  const { portalId = 'main' } = useParams();

  const query = useJQELQuery<InstanceConfig[]>({
    schema: 'backend',
    select: 'instance',
    where: {
      portalId: { $eq: portalId },
      moduleId: { $eq: 'blueprint' }
    },
    output: ['config']
  }, {
    staleTime: 5 * 60 * 1000
  });

  // Extract config or provide default
  const config = useMemo(() => {
    if (!query.data?.data || query.data.data.length === 0) {
      return { title: 'Blueprint Module', description: '' } as BlueprintConfig;
    }
    return query.data.data[0].config;
  }, [query.data]);

  return {
    ...query,
    data: config
  };
}
