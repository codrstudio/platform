import { useState, useCallback } from 'react';
import { cacheValidator } from '../services/cacheValidator';

/**
 * Hook para integrar Cache Validator com componentes React
 *
 * Expõe métodos do serviço e permite componentes reagirem a mudanças de epoch
 */
export const useCacheValidator = () => {
  const [currentEpoch, setCurrentEpoch] = useState<string | null>(
    cacheValidator.getCurrentEpoch()
  );

  /**
   * Atualiza epoch e notifica componente via state
   */
  const updateEpoch = useCallback((newEpoch: string) => {
    cacheValidator.updateEpoch(newEpoch);
    setCurrentEpoch(newEpoch);
  }, []);

  /**
   * Verifica se epoch de recurso é válido
   */
  const isValid = useCallback(
    (resourceEpoch: string | null) => {
      return cacheValidator.isValid(resourceEpoch);
    },
    [currentEpoch]
  );

  /**
   * Invalida todos os caches
   */
  const invalidateAll = useCallback(async () => {
    await cacheValidator.invalidateAll();
  }, []);

  /**
   * Limpa cache e epoch local (reset completo)
   */
  const clear = useCallback(async () => {
    await cacheValidator.clear();
    setCurrentEpoch(null);
  }, []);

  return {
    currentEpoch,
    updateEpoch,
    isValid,
    invalidateAll,
    clear,
  };
};
