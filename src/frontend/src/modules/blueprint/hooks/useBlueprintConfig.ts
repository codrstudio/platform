// hooks/useBlueprintConfig.ts
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { jqelClient } from '@/services/jqelClient';
import type { BlueprintConfig } from '../types';

export function useBlueprintConfig() {
  const { portalId = 'main' } = useParams();

  return useQuery({
    queryKey: ['blueprint', 'config', portalId],
    queryFn: async () => {
      const result = await jqelClient.query({
        schema: 'backend',
        select: 'instance',
        where: {
          portalId: { $eq: portalId },
          moduleId: { $eq: 'blueprint' }
        },
        output: ['config']
      });

      if (!result.data || result.data.length === 0) {
        return { title: 'Blueprint Module', description: '' } as BlueprintConfig;
      }

      return result.data[0].config as BlueprintConfig;
    },
    staleTime: 5 * 60 * 1000
  });
}
