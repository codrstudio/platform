/**
 * UpdateNotification Component
 *
 * Exibe notificação visual quando há uma nova versão da aplicação disponível.
 * Permite ao usuário escolher entre atualizar imediatamente ou continuar usando
 * a versão atual.
 *
 * Features:
 * - Toast/Banner com mensagem de update disponível
 * - Botão "Atualizar agora" para reload imediato
 * - Botão "Mais tarde" para fechar notificação
 * - Auto-hide após 30 segundos
 * - Integração com swUpdateHandler
 *
 * Refs: PLAN_4-Cache-Invalidation.md - FASE 3.2
 */

import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { swUpdateHandler } from '@/services/swUpdateHandler'
import { cn } from '@/lib/utils'

export function UpdateNotification() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Registra callback para ser notificado quando houver update
    const unsubscribe = swUpdateHandler?.onUpdateAvailable(() => {
      console.log('[UpdateNotification] Update available, showing notification')
      setIsVisible(true)

      // Auto-hide após 30 segundos
      setTimeout(() => {
        console.log('[UpdateNotification] Auto-hiding notification')
        setIsVisible(false)
      }, 30000)
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const handleUpdateNow = () => {
    console.log('[UpdateNotification] User clicked Update Now')
    swUpdateHandler?.activateWaitingSW()
    // O reload será feito automaticamente quando o novo SW assumir controle
  }

  const handleDismiss = () => {
    console.log('[UpdateNotification] User dismissed notification')
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 w-full max-w-md',
        'animate-in slide-in-from-bottom-5',
        'sm:max-w-lg'
      )}
    >
      <Alert className="border-primary/50 bg-card shadow-lg">
        <RefreshCw className="h-4 w-4 text-primary" />
        <AlertTitle className="text-base font-semibold">
          Nova versão disponível
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p className="text-sm text-muted-foreground">
            Uma atualização da aplicação está disponível. Atualize agora para
            obter as últimas melhorias e correções.
          </p>

          <div className="flex gap-2">
            <Button
              onClick={handleUpdateNow}
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Atualizar agora
            </Button>

            <Button
              onClick={handleDismiss}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <X className="h-3 w-3" />
              Mais tarde
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
