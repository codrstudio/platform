/**
 * Health Monitoring Examples
 *
 * Demonstrates health monitoring system features.
 *
 * SPEC-module-setup.md (SPEC-MS-PS-010 to SPEC-MS-PS-016)
 * SPEC-MS-HE-* sections about health monitoring
 */

import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { HealthStatusCard, HealthStatusBadge } from '../components/health/HealthStatusCard';
import { useHealth, useBasicHealth } from '../hooks/useHealth';

/**
 * Example 1: Basic Health Check
 *
 * Simplest usage - one-time health check without auto-refresh.
 */
export function Example1_BasicHealthCheck() {
  const { data, isLoading, error } = useBasicHealth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 1: Basic Health Check</CardTitle>
        <CardDescription>One-time check without auto-refresh</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-600">Error: {error.message}</p>}
        {data && (
          <div className="space-y-2 text-sm">
            <div><strong>Status:</strong> {data.status}</div>
            <div><strong>Environment:</strong> {data.environment}</div>
            <div><strong>Uptime:</strong> {Math.floor(data.uptime / 60)} minutes</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 2: Auto-Refresh Health Check
 *
 * Health check with automatic refresh every 30 seconds.
 * SPEC-MS-PS-015: Periodic health check updates
 */
export function Example2_AutoRefreshHealthCheck() {
  const { systemStatus, lastCheck, isLoading } = useHealth({
    autoRefresh: true,
    refetchInterval: 30000, // 30 seconds
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 2: Auto-Refresh (30s)</CardTitle>
        <CardDescription>Automatically refreshes every 30 seconds</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Checking...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {systemStatus === 'healthy' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium capitalize">{systemStatus}</span>
            </div>
            {lastCheck && (
              <p className="text-xs text-gray-500">
                Last check: {new Date(lastCheck).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 3: Manual Refresh
 *
 * Health check with manual refresh button.
 */
export function Example3_ManualRefresh() {
  const { systemStatus, refresh, isLoading, isFetching } = useHealth({
    autoRefresh: false, // Disable auto-refresh
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 3: Manual Refresh</CardTitle>
        <CardDescription>Click refresh button to update status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <strong>Status:</strong> {isLoading ? 'Loading...' : systemStatus}
          </div>
          <Button
            onClick={() => refresh()}
            disabled={isFetching}
            
            variant="outline"
          >
            {isFetching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 4: Individual Service Status
 *
 * Display status for individual services.
 * SPEC-MS-PS-011: n8n connectivity
 * SPEC-MS-PS-012: Redis connectivity
 * SPEC-MS-PS-013: Backend status
 */
export function Example4_IndividualServiceStatus() {
  const { backendStatus, redisStatus, n8nStatus } = useHealth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 4: Individual Service Status</CardTitle>
        <CardDescription>Monitor each service separately</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <HealthStatusBadge name="Backend" status={backendStatus} />
          <HealthStatusBadge name="Redis" status={redisStatus} />
          <HealthStatusBadge name="n8n" status={n8nStatus} />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 5: Detailed Service Cards
 *
 * Full health status cards with response time and last check.
 * SPEC-MS-PS-016: Last check timestamp
 */
export function Example5_DetailedServiceCards() {
  const { data: health, isLoading } = useHealth();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Example 5: Detailed Service Cards</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Example 5: Detailed Service Cards</h3>
        <p className="text-sm text-gray-600 mb-4">
          Complete health cards with response time and messages
        </p>
      </div>

      <div className="grid gap-4">
        {health?.services?.backend && (
          <HealthStatusCard
            name="Backend API"
            health={health.services.backend}
            description="Express.js server"
          />
        )}

        {health?.services?.redis && (
          <HealthStatusCard
            name="Redis Cache"
            health={health.services.redis}
            description="Caching and Pub/Sub"
          />
        )}

        {health?.services?.n8n && (
          <HealthStatusCard
            name="n8n Backbone"
            health={health.services.n8n}
            description="Workflow automation"
          />
        )}
      </div>
    </div>
  );
}

/**
 * All examples in one component
 */
export default function HealthMonitoringExamples() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Health Monitoring Examples</h1>
        <p className="text-gray-600">
          Examples of using the health monitoring system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Example1_BasicHealthCheck />
        <Example2_AutoRefreshHealthCheck />
        <Example3_ManualRefresh />
        <Example4_IndividualServiceStatus />
      </div>

      <Example5_DetailedServiceCards />
    </div>
  );
}
