// Platform Settings Page
// Based on spec/ui/setup-module-interfaces.md Section 3

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Server, Database, Activity, Info, Loader2, Palette } from 'lucide-react';
import { usePortals } from '@/hooks/jqel/usePortal';
import { LoginBrandingEditor } from '../components/LoginBrandingEditor';
import { Page } from '@/core/composition';

function useSystemHealth() {
  // Test backend connectivity by querying portals
  const { isLoading, isError } = usePortals();

  return {
    backendStatus: isLoading ? 'checking' : isError ? 'error' : 'healthy',
    isLoading
  };
}

export function PlatformSettings() {
  const { backendStatus, isLoading: healthLoading } = useSystemHealth();
  const [showBrandingEditor, setShowBrandingEditor] = useState(false);

  const systemInfo = {
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
    uptime: 'N/A',
    status: backendStatus
  };

  const services = [
    {
      name: 'Backend API',
      status: healthLoading ? 'checking' : backendStatus === 'healthy' ? 'running' : 'stopped',
      port: 3001,
      health: backendStatus
    },
    {
      name: 'Redis',
      status: 'unknown',
      port: 6379,
      health: 'unknown',
      note: 'Verificação via backend necessária'
    },
    {
      name: 'n8n Backbone',
      status: 'unknown',
      url: 'https://n8n.codrstudio.dev',
      health: 'unknown',
      note: 'Verificação via backend necessária'
    }
  ];

  const envVariables = [
    { key: 'NODE_ENV', value: 'development', masked: false },
    { key: 'VITE_API_URL', value: 'http://localhost:3001', masked: false },
    { key: 'VITE_N8N_URL', value: 'https://n8n.codrstudio.dev', masked: false },
    { key: 'JWT_SECRET', value: '***************', masked: true },
    { key: 'REDIS_URL', value: 'redis://localhost:6379', masked: false }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'running': 'default',
      'healthy': 'default',
      'stopped': 'destructive',
      'error': 'destructive',
      'warning': 'secondary',
      'checking': 'secondary',
      'unknown': 'outline'
    };

    const icon = status === 'checking' ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null;

    return (
      <Badge variant={variants[status] || 'outline'}>
        {icon}
        {status}
      </Badge>
    );
  };

  return (
    <Page composition="settings">
      <div className="p-6 space-y-8">
      {/* Breadcrumb */}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configurações globais da plataforma e health checks
        </p>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <CardTitle>Informações do Sistema</CardTitle>
          </div>
          <CardDescription>
            Dados gerais sobre a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Versão</p>
              <p className="text-lg font-semibold">{systemInfo.version}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ambiente</p>
              <p className="text-lg font-semibold capitalize">{systemInfo.environment}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-lg font-semibold">{systemInfo.uptime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1">{getStatusBadge(systemInfo.status)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Branding Customization */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Personalização da Página de Login</CardTitle>
          </div>
          <CardDescription>
            Customize a aparência da tela de login com sua marca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Branding do Login</p>
              <p className="text-xs text-muted-foreground mt-1">
                Logo, cores e textos personalizados para a página de autenticação
              </p>
            </div>
            <Button onClick={() => setShowBrandingEditor(true)}>
              <Palette className="h-4 w-4 mr-2" />
              Customizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Health Check - Serviços</CardTitle>
          </div>
          <CardDescription>
            Status dos serviços da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={service.name}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Server className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(service as any).port ? `Port: ${(service as any).port}` : (service as any).url}
                      </p>
                      {(service as any).note && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          {(service as any).note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(service.status)}
                    {getStatusBadge(service.health)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Variáveis de Ambiente</CardTitle>
          </div>
          <CardDescription>
            Visualização das variáveis de ambiente (valores sensíveis mascarados)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {envVariables.map((env, index) => (
              <div key={env.key}>
                {index > 0 && <Separator className="mb-3" />}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-mono text-sm font-medium">{env.key}</p>
                  </div>
                  <div className="flex-1 text-right">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {env.value}
                    </code>
                    {env.masked && (
                      <span className="ml-2 text-xs text-muted-foreground">(masked)</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Login Branding Editor Dialog */}
      <Dialog open={showBrandingEditor} onOpenChange={setShowBrandingEditor}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden">
          <div className="h-full overflow-auto">
            <LoginBrandingEditor
              realmId="default"
              onClose={() => setShowBrandingEditor(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </Page>
  );
}
