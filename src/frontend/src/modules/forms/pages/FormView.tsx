/**
 * FormView Page
 *
 * SPEC Compliance: SPEC-FORMS-*
 */

import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FormRenderer } from '../components/FormRenderer';
import { useForms } from '../hooks/useForms';
import type { FormInstanceConfig } from '../types';

export interface FormViewProps {
  config: FormInstanceConfig;
}

export function FormView({ config }: FormViewProps) {
  const {
    formConfig,
    formState,
    isLoading,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    resetForm
  } = useForms(config.formId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Carregando formulário...</div>
      </div>
    );
  }

  if (!formConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Formulário não encontrado
          </h3>
          <p className="text-sm text-muted-foreground">
            O formulário solicitado não existe ou não está disponível.
          </p>
        </div>
      </div>
    );
  }

  // Show success message after submission
  if (formState.isSubmitted) {
    const confirmationMessage = formConfig.settings.confirmationMessage || 'Sua resposta foi enviada com sucesso!';

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <h2 className="text-2xl font-bold">Enviado com sucesso!</h2>
              <p className="text-muted-foreground">{confirmationMessage}</p>

              {formConfig.settings.allowMultipleSubmissions && (
                <Button onClick={resetForm} variant="outline">
                  Enviar outra resposta
                </Button>
              )}

              {formConfig.settings.redirectUrl && (
                <Button
                  onClick={() => window.location.href = formConfig.settings.redirectUrl!}
                >
                  Continuar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate progress
  const totalFields = formConfig.fields.length;
  const completedFields = Object.keys(formState.values).filter(key => {
    const value = formState.values[key];
    return value !== null && value !== undefined && String(value).trim() !== '';
  }).length;
  const progress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {config.title || formConfig.title}
            </CardTitle>
            {formConfig.description && (
              <CardDescription className="text-base">
                {formConfig.description}
              </CardDescription>
            )}
            {formConfig.settings.showProgressBar && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Progresso</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormRenderer
                fields={formConfig.fields}
                formState={formState}
                onFieldChange={handleFieldChange}
                onFieldBlur={handleFieldBlur}
              />

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className="flex-1"
                >
                  {formState.isSubmitting ? 'Enviando...' : 'Enviar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={formState.isSubmitting}
                >
                  Limpar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
