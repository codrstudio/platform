/**
 * PlatformSettings Component
 *
 * Displays read-only platform configuration and service health status.
 * Features:
 * - Environment info (NODE_ENV, PORT, LOG_LEVEL)
 * - URLs (Frontend, Backend, n8n)
 * - Redis configuration
 * - Service health indicators with auto-refresh
 * - Prominent read-only message with edit instructions
 *
 * Based on Task 2.2.6 plan
 */

import { Info, Server, AlertCircle } from 'lucide-react';
import { usePlatformSettings } from '../../../hooks/usePlatformSettings';
import { HealthIndicator } from './HealthIndicator';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';

export function PlatformSettings() {
  const { data, isLoading, isError, error, refetch } = usePlatformSettings();

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6" role="region" aria-label="Platform settings">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading platform settings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-lg border bg-card p-6" role="region" aria-label="Platform settings">
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Unable to load platform settings</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'The backend may be offline or experiencing issues.'}
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Normal state - display settings
  if (!data) {
    return null;
  }

  const { settings, health, timestamp } = data;

  return (
    <div className="space-y-6 rounded-lg border bg-card p-6" role="region" aria-label="Platform settings">
      {/* Header */}
      <div className="flex items-center gap-2 border-b pb-3">
        <Server className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Platform Settings</h3>
      </div>

      {/* Read-Only Warning */}
      <div
        className="rounded-md border border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-950"
        role="note"
      >
        <div className="flex gap-3">
          <Info className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="flex-1 text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium">Read-Only Configuration</p>
            <p className="mt-1">
              These settings are configured via <code className="rounded bg-blue-100 px-1 dark:bg-blue-900">.env</code> files on the server.
              To modify, edit the <code className="rounded bg-blue-100 px-1 dark:bg-blue-900">.env</code> file and restart the backend application.
            </p>
          </div>
        </div>
      </div>

      {/* Environment Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Environment</h4>
        <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
          <Label>NODE_ENV</Label>
          <span className="text-sm text-foreground">
            <code className="rounded bg-muted px-2 py-1">{settings.nodeEnv}</code>
          </span>

          <Label>PORT</Label>
          <span className="text-sm text-foreground">{settings.port}</span>

          <Label>LOG_LEVEL</Label>
          <span className="text-sm text-foreground">{settings.logLevel}</span>

          <Label>System Schema Target</Label>
          <span className="text-sm text-foreground">{settings.systemSchemaTarget}</span>
        </div>
      </div>

      {/* URLs Section */}
      <div className="space-y-3 border-t pt-6">
        <h4 className="text-sm font-semibold text-foreground">URLs</h4>
        <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
          <Label>Frontend</Label>
          <span className="break-all text-sm text-foreground">{settings.frontendUrl}</span>

          <Label>Backend</Label>
          <span className="break-all text-sm text-foreground">{settings.backendUrl}</span>

          <Label>n8n</Label>
          <span className="break-all text-sm text-foreground">{settings.n8nBaseUrl}</span>
        </div>
      </div>

      {/* Redis Section */}
      <div className="space-y-3 border-t pt-6">
        <h4 className="text-sm font-semibold text-foreground">Redis</h4>
        <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
          <Label>Host</Label>
          <span className="text-sm text-foreground">{settings.redisHost}</span>

          <Label>Port</Label>
          <span className="text-sm text-foreground">{settings.redisPort}</span>

          <Label>Database</Label>
          <span className="text-sm text-foreground">{settings.redisDb}</span>

          <Label>Authenticated</Label>
          <span className="text-sm text-foreground">
            {settings.redisAuthenticated ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      {/* Service Health Section */}
      <div className="space-y-3 border-t pt-6">
        <h4 className="text-sm font-semibold text-foreground">Service Health</h4>
        <div className="grid gap-4 sm:grid-cols-3">
          <HealthIndicator service="n8n" status={health.n8n ? 'ok' : 'down'} />
          <HealthIndicator service="Redis" status={health.redis ? 'ok' : 'down'} />
          <HealthIndicator service="Backend" status={health.backend ? 'ok' : 'down'} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Last checked: {new Date(timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
