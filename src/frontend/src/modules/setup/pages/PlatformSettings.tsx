// Platform Settings Page
// Based on spec/ui/setup-module-interfaces.md Section 3

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Server, Database, Activity, Info } from 'lucide-react';

export function PlatformSettings() {
  // TODO: Fetch real data from JQEL
  const systemInfo = {
    version: '1.0.0',
    environment: 'development',
    uptime: '2h 15m',
    status: 'healthy'
  };

  const services = [
    { name: 'Backend', status: 'running', port: 3001, health: 'healthy' },
    { name: 'Redis', status: 'running', port: 6379, health: 'healthy' },
    { name: 'n8n Backbone', status: 'running', url: 'https://n8n.codrstudio.dev', health: 'healthy' }
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
      'warning': 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
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
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.port ? `Port: ${service.port}` : service.url}
                      </p>
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
    </div>
  );
}
