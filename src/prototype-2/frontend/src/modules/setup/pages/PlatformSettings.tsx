import { useHealth } from '../../../hooks/useHealth';
import { HealthIndicator } from '../components/HealthIndicator';

/**
 * PlatformSettings Page
 *
 * Displays platform configuration and infrastructure health status.
 * Shows read-only settings from environment variables and real-time
 * health checks for n8n, Redis, and Backend services.
 *
 * Features:
 * - Read-only platform configuration display
 * - Real-time health monitoring with auto-refresh (60s intervals)
 * - Visual status indicators (green/yellow/red)
 * - Error messages for troubleshooting
 *
 * SPEC References:
 * - SPEC-MS-PS-010:016: Platform Settings visualization requirements
 * - SPEC-MS-HE-001:009: Health check indicators
 *
 * @returns Platform Settings page component
 */
export default function PlatformSettings() {
  // Health check hooks with auto-polling
  const n8nHealth = useHealth('n8n');
  const redisHealth = useHealth('redis');
  const backendHealth = useHealth('backend');

  return (
    <div className="space-y-8 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Platform Settings
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Monitor platform infrastructure and review configuration settings.
        </p>
      </div>

      {/* Infrastructure Health Section */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Infrastructure Health
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Real-time status of platform services. Updates automatically every 60 seconds.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {/* n8n Health Indicator */}
          <HealthIndicator
            service="n8n Backbone"
            status={n8nHealth.data?.status}
            lastCheck={n8nHealth.dataUpdatedAt}
            error={n8nHealth.data?.error}
            isLoading={n8nHealth.isLoading}
            data={n8nHealth.data}
          />

          {/* Redis Health Indicator */}
          <HealthIndicator
            service="Redis"
            status={redisHealth.data?.status}
            lastCheck={redisHealth.dataUpdatedAt}
            error={redisHealth.data?.error}
            isLoading={redisHealth.isLoading}
            data={redisHealth.data}
          />

          {/* Backend Health Indicator */}
          <HealthIndicator
            service="Backend"
            status={backendHealth.data?.status}
            lastCheck={backendHealth.dataUpdatedAt}
            error={backendHealth.data?.error}
            isLoading={backendHealth.isLoading}
            data={backendHealth.data}
          />
        </div>
      </section>

      {/* Platform Configuration Section */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Platform Configuration
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Read-only view of platform settings. To modify these values, edit the <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">.env</code> file and restart the services.
        </p>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <dl className="grid gap-4 md:grid-cols-2">
            {/* API URL */}
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                API Base URL
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {import.meta.env.VITE_API_URL || 'http://localhost:3000'}
              </dd>
            </div>

            {/* Environment */}
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Environment
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {import.meta.env.MODE || 'development'}
              </dd>
            </div>

            {/* Backend Version */}
            {backendHealth.data?.version && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Backend Version
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {backendHealth.data.version}
                </dd>
              </div>
            )}

            {/* Node.js Version */}
            {backendHealth.data?.nodeVersion && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Node.js Version
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {backendHealth.data.nodeVersion}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {/* Info Message */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <strong>Note:</strong> Platform settings are configured via environment variables and cannot be modified from this interface. Contact your system administrator to change configuration values.
        </p>
      </div>
    </div>
  );
}
