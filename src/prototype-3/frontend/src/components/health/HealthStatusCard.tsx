/**
 * HealthStatusCard Component
 *
 * Displays health status for a single service.
 *
 * SPEC-module-setup.md (SPEC-MS-PS-010 to SPEC-MS-PS-016)
 * Visual status indicators: green (healthy), yellow (degraded), red (unhealthy)
 */

import { Activity, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import type { ServiceHealth } from '../../services/health/healthClient';

export interface HealthStatusCardProps {
  /**
   * Service name (e.g., "Backend", "Redis", "n8n")
   */
  name: string;

  /**
   * Service health data
   */
  health: ServiceHealth;

  /**
   * Optional description
   */
  description?: string;

  /**
   * Show response time
   * Default: true
   */
  showResponseTime?: boolean;

  /**
   * Show last check timestamp
   * Default: true
   */
  showLastCheck?: boolean;
}

/**
 * Format timestamp to relative time
 */
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 5) {
    return 'just now';
  } else if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes}m ago`;
  } else {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours}h ago`;
  }
}

/**
 * Get status icon and color
 */
function getStatusDisplay(status: ServiceHealth['status']) {
  switch (status) {
    case 'healthy':
      return {
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        dotColor: 'bg-green-500',
        label: 'Healthy',
      };
    case 'degraded':
      return {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        dotColor: 'bg-yellow-500',
        label: 'Degraded',
      };
    case 'unhealthy':
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        dotColor: 'bg-red-500',
        label: 'Unhealthy',
      };
    default:
      return {
        icon: Activity,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        dotColor: 'bg-gray-500',
        label: 'Unknown',
      };
  }
}

/**
 * HealthStatusCard component
 *
 * Visual indicators:
 * - Green: Service is healthy
 * - Yellow: Service is degraded but functional
 * - Red: Service is down or unhealthy
 *
 * Displays:
 * - Service name and status
 * - Status message
 * - Response time (if available)
 * - Last check timestamp
 */
export function HealthStatusCard({
  name,
  health,
  description,
  showResponseTime = true,
  showLastCheck = true,
}: HealthStatusCardProps) {
  const display = getStatusDisplay(health.status);
  const Icon = display.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${display.bgColor}`}>
              <Icon className={`h-5 w-5 ${display.color}`} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{name}</CardTitle>
              {description && (
                <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${display.bgColor} ${display.color}`}
            >
              <span className={`w-2 h-2 rounded-full ${display.dotColor} animate-pulse`} />
              {display.label}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Status message */}
          <p className="text-sm text-gray-700">{health.message}</p>

          {/* Additional info */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {/* Response time */}
            {showResponseTime && health.responseTime !== undefined && (
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>{health.responseTime}ms</span>
              </div>
            )}

            {/* Last check */}
            {showLastCheck && health.lastCheck && (
              <div className="flex items-center gap-1">
                <span>Last check: {formatRelativeTime(health.lastCheck)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact version of HealthStatusCard
 *
 * Single line with dot indicator and service name.
 */
export interface HealthStatusBadgeProps {
  name: string;
  status: ServiceHealth['status'];
  showDot?: boolean;
}

export function HealthStatusBadge({ name, status, showDot = true }: HealthStatusBadgeProps) {
  const display = getStatusDisplay(status);

  return (
    <div className="inline-flex items-center gap-2 text-sm">
      {showDot && <span className={`w-2 h-2 rounded-full ${display.dotColor}`} />}
      <span className="font-medium">{name}</span>
      <span className={`text-xs ${display.color}`}>({display.label})</span>
    </div>
  );
}
