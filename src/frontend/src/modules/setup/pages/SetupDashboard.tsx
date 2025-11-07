// Setup Dashboard - Main entry point
// Based on spec/ui/setup-module-interfaces.md Section 2

import { Link } from 'react-router-dom';
import { Settings, Package, Layers, Activity, Globe, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageBreadcrumb } from '@/components/navigation';
import { useSetupBreadcrumb } from '@/hooks/useBreadcrumb';

export function SetupDashboard() {
  const breadcrumbItems = useSetupBreadcrumb();

  // TODO: Fetch real stats from JQEL
  const stats = {
    portals: { total: 2, active: 2 },
    modules: { total: 1, active: 1 },
    instances: { total: 0, portal: 'setup' }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Breadcrumb */}
      <PageBreadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Setup Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Portal de configuração da plataforma
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portais</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.portals.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.portals.active} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Módulos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.modules.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.modules.active} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instâncias</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.instances.total}</div>
            <p className="text-xs text-muted-foreground">
              Portal {stats.instances.portal}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Acesso Rápido</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/setup/realms">
            <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>Gerenciar Reinos</CardTitle>
                    <CardDescription>
                      Configure reinos para agrupar portais
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/setup/portals">
            <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>Gerenciar Portais</CardTitle>
                    <CardDescription>
                      Configure portais, módulos e instâncias
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/setup/platform-settings">
            <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>Platform Settings</CardTitle>
                    <CardDescription>
                      Visualizar variáveis e health checks
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/setup/about">
            <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Info className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>Sobre a Platform</CardTitle>
                    <CardDescription>
                      Informações sobre a plataforma e arquitetura
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* Activity Recent (Optional) */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Atividade Recente</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm">Portal "setup" criado</p>
                </div>
                <span className="text-sm text-muted-foreground">há 1 dia</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm">Módulo "setup" ativado em "setup"</p>
                </div>
                <span className="text-sm text-muted-foreground">há 1 dia</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
