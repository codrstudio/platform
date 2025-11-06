import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { HealthStatus } from '../../../services/health/healthClient';

interface HealthIndicatorProps {
  service: string;
  status?: 'ok' | 'degraded' | 'down' | 'loading';
  lastCheck?: number;
  error?: string;
  isLoading?: boolean;
  data?: HealthStatus;
}

/**
 * HealthIndicator Component
 *
 * Visual status indicator for platform services.
 * Displays service name, status, last check time, and error messages.
 *
 * States:
 * - Loading: Gray skeleton or spinner
 * - OK: Green checkmark
 * - Degraded: Yellow warning triangle
 * - Down: Red X circle
 *
 * SPEC References:
 * - SPEC-MS-HE-001:009: Health check indicators
 * - SPEC-MS-PS-014:016: Platform Settings display
 *
 * @param service - Service name (e.g., "n8n", "Redis", "Backend")
 * @param status - Current status
 * @param lastCheck - Timestamp of last check
 * @param error - Error message if status is down
 * @param isLoading - Loading state
 * @param data - Full health status data (optional, for additional details)
 */
export function HealthIndicator({
  service,
  status,
  lastCheck,
  error,
  isLoading,
  data,
}: HealthIndicatorProps) {
  // Loading state
  if (isLoading || !status) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  // Determine status icon and colors
  const statusConfig = {
    ok: {
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-900',
      label: 'Operational',
    },
    degraded: {
      icon: AlertTriangle,
      color: 'text-yellow-600 dark:text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      borderColor: 'border-yellow-200 dark:border-yellow-900',
      label: 'Degraded',
    },
    down: {
      icon: XCircle,
      color: 'text-red-600 dark:text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-900',
      label: 'Down',
    },
    loading: {
      icon: Loader2,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-950/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
      label: 'Checking...',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Format last check timestamp
  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div
      className={`rounded-lg border p-6 ${config.bgColor} ${config.borderColor}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`h-5 w-5 ${config.color} ${status === 'loading' ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {service}
            </h3>
            <span className={`text-sm font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>

          {/* Error message */}
          {error && (
            <p className="mt-2 text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Additional details */}
          {data && status === 'ok' && (
            <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
              {data.latency !== undefined && (
                <p>Response time: {data.latency}ms</p>
              )}
              {data.uptime !== undefined && (
                <p>Uptime: {formatUptime(data.uptime)}</p>
              )}
            </div>
          )}

          {/* Last check timestamp */}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Last checked: {formatTimestamp(lastCheck)}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Format uptime in seconds to human-readable string
 */
function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
