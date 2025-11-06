/**
 * Platform Settings Page
 *
 * Read-only view of platform configuration and health checks.
 *
 * References:
 * - SPEC-module-setup.md (SPEC-MS-PS-*)
 * - SPEC-MS-HE-* sections about health monitoring
 *
 * Features:
 * - Display platform health status (SPEC-MS-PS-010)
 * - Show backend, n8n, and Redis status (SPEC-MS-PS-011, SPEC-MS-PS-012, SPEC-MS-PS-013)
 * - Auto-refresh health checks every 30 seconds (SPEC-MS-PS-015)
 * - Display last check timestamp (SPEC-MS-PS-016)
 * - Visual indicators: green (healthy), yellow (degraded), red (down)
 * - Manual refresh button
 */

import { RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { HealthStatusCard } from '../../../components/health/HealthStatusCard';
import { useHealth } from '../../../hooks/useHealth';

export default function PlatformSettings() {
  const {
    data: health,
    isLoading,
    error,
    systemStatus,
    lastCheck,
    refresh,
  } = useHealth({
    autoRefresh: true,
    refetchInterval: 30000, // 30 seconds (SPEC-MS-PS-015)
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
            <p className="text-gray-500 mt-2">
              Platform configuration and health monitoring
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Checking platform services...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
            <p className="text-gray-500 mt-2">
              Platform configuration and health monitoring
            </p>
          </div>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Health Check Failed</CardTitle>
              <CardDescription className="text-red-700">
                Unable to retrieve platform health status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-800 mb-4">{error.message}</p>
              <Button
                onClick={() => refresh()}
                variant="outline"
                
                className="border-red-300 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state with health data
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
            <p className="text-gray-500 mt-2">
              Platform configuration and health monitoring
            </p>
          </div>
          <Button
            onClick={() => refresh()}
            variant="outline"
            
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Overall system status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Overall platform status
                  {lastCheck && (
                    <span className="ml-2 text-xs">
                      (Last check: {new Date(lastCheck).toLocaleTimeString()})
                    </span>
                  )}
                </CardDescription>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  systemStatus === 'healthy'
                    ? 'bg-green-100 text-green-800'
                    : systemStatus === 'degraded'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {systemStatus === 'healthy' && 'All Systems Operational'}
                {systemStatus === 'degraded' && 'Degraded Performance'}
                {systemStatus === 'unhealthy' && 'Service Disruption'}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Environment</span>
                <span className="font-medium">{health?.environment || 'unknown'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Uptime</span>
                <span className="font-medium">
                  {health?.uptime ? `${Math.floor(health.uptime / 60)} minutes` : 'unknown'}
                </span>
              </div>
              {health?.version && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Version</span>
                  <span className="font-medium">{health.version}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service health cards */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Services</h2>
          <div className="grid gap-4 md:grid-cols-1">
            {/* Backend service */}
            {health?.services?.backend && (
              <HealthStatusCard
                name="Backend API"
                health={health.services.backend}
                description="Express.js server handling requests"
              />
            )}

            {/* Redis service */}
            {health?.services?.redis && (
              <HealthStatusCard
                name="Redis Cache"
                health={health.services.redis}
                description="Pub/Sub, streams, and caching layer"
              />
            )}

            {/* n8n service */}
            {health?.services?.n8n && (
              <HealthStatusCard
                name="n8n Backbone"
                health={health.services.n8n}
                description="Business logic and workflow automation"
              />
            )}
          </div>
        </div>

        {/* Configuration note */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 text-base">Configuration Note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800">
              Platform configurations are defined in the <code className="px-1 py-0.5 bg-blue-100 rounded">.env</code> file on the server.
              Changes require manual editing of the file and application restart.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
