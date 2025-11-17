/**
 * Section Error Boundary
 *
 * Error boundary para seções individuais do preview.
 * Garante que um erro em uma seção não derruba todo o preview.
 *
 * Features:
 * - Captura erros em seções específicas
 * - Mostra placeholder no lugar da seção com erro
 * - Permite que outras seções continuem funcionando
 * - Reporta erro sem travar a aplicação
 *
 * @module homepage/components/editor
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Bug, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  sectionType?: string
  sectionTitle?: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * SectionErrorBoundary Component
 *
 * Error boundary leve para seções individuais.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro
    console.error(
      `Error in section ${this.props.sectionType || 'unknown'}:`,
      error,
      errorInfo
    )

    // Callback para reportar erro
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError) {
      const { sectionType, sectionTitle } = this.props
      const displayName = sectionTitle || sectionType || 'Seção'

      return (
        <div className="py-8 px-4">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Bug className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <AlertTitle className="font-semibold">
                  Erro ao renderizar: {displayName}
                </AlertTitle>
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="text-sm">
                      Esta seção não pôde ser exibida devido a um erro. As outras seções
                      continuam funcionando normalmente.
                    </p>

                    {import.meta.env.DEV && this.state.error && (
                      <details className="text-xs">
                        <summary className="cursor-pointer hover:underline">
                          Ver detalhes do erro
                        </summary>
                        <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto max-h-32">
                          {this.state.error.toString()}
                        </pre>
                      </details>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={this.handleReset}
                      className="mt-2"
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Tentar renderizar novamente
                    </Button>
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
