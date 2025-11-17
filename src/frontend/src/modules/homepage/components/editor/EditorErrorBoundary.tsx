/**
 * Editor Error Boundary
 *
 * Error boundary específico para o editor visual.
 * Captura erros e permite que o usuário continue trabalhando ou feche o editor.
 *
 * Features:
 * - Captura erros em componentes filhos
 * - Mostra UI de fallback amigável
 * - Permite recuperação sem perder todo o trabalho
 * - Log de erros para debugging
 * - Botão para tentar recuperar ou fechar
 *
 * @module homepage/components/editor
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, X } from 'lucide-react'

interface Props {
  children: ReactNode
  onClose?: () => void
  fallbackTitle?: string
  fallbackMessage?: string
  level?: 'critical' | 'warning' | 'info'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorCount: number
}

/**
 * EditorErrorBoundary Component
 *
 * Captura erros e mostra UI de fallback amigável.
 */
export class EditorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro para debugging
    console.error('Editor Error Boundary caught an error:', error, errorInfo)

    // Incrementar contador de erros
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }))

    // TODO: Enviar erro para sistema de logging/monitoramento
    // sendErrorToLoggingService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleClose = () => {
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  render() {
    if (this.state.hasError) {
      const { level = 'critical', fallbackTitle, fallbackMessage } = this.props
      const { error, errorInfo, errorCount } = this.state

      // Se erro crítico e muitos erros, sugerir fechar
      const tooManyErrors = errorCount > 3

      return (
        <div className="p-6 max-w-2xl mx-auto">
          <Card className="border-destructive">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">
                  {fallbackTitle || 'Erro no Editor'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTitle>O que aconteceu?</AlertTitle>
                <AlertDescription>
                  {fallbackMessage ||
                    'Ocorreu um erro inesperado. Suas alterações podem não ter sido salvas.'}
                </AlertDescription>
              </Alert>

              {/* Error Details (desenvolvimento) */}
              {import.meta.env.DEV && error && (
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium mb-2 hover:underline">
                    Detalhes técnicos (desenvolvedor)
                  </summary>
                  <div className="bg-muted p-4 rounded-md space-y-2 text-xs">
                    <div>
                      <strong>Erro:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{error.toString()}</pre>
                    </div>
                    {errorInfo && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-48">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Warning sobre múltiplos erros */}
              {tooManyErrors && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Múltiplos erros detectados</AlertTitle>
                  <AlertDescription>
                    Este é o {errorCount}º erro. Recomendamos fechar o editor e verificar os
                    dados.
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                {this.props.onClose && (
                  <Button variant="outline" onClick={this.handleClose}>
                    <X className="w-4 h-4 mr-2" />
                    Fechar Editor
                  </Button>
                )}

                {!tooManyErrors && level !== 'critical' && (
                  <Button onClick={this.handleReset}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
