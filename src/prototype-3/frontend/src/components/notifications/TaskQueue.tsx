import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, XCircle, Clock, AlertCircle, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTasks } from '@/hooks/useSSE';
import { cn } from '@/lib/utils';
import type { TaskEvent, EventPriority } from '@/types/events';

/**
 * TaskQueue Component
 *
 * Displays interactive tasks requiring user action
 * SPEC-EV-CO-009 to SPEC-EV-CO-013: Task system
 * SPEC-EV-FR-003: Visual feedback for tasks
 *
 * Story 1.5.2: Interactive tasks UI
 */

type TaskStatus = 'pending' | 'completed' | 'cancelled';
type TaskFilter = 'all' | TaskStatus;

interface TaskItemProps {
  task: TaskEvent;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
}

function TaskItem({ task, onComplete, onCancel }: TaskItemProps) {
  const priority = task.priority || 'normal';
  const status = (task.data?.status as TaskStatus) || 'pending';
  const category = task.category || 'general';

  const timestamp = new Date(task.timestamp);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  const priorityColors: Record<EventPriority, string> = {
    low: 'text-gray-500',
    normal: 'text-blue-500',
    high: 'text-orange-500',
    urgent: 'text-red-500',
  };

  const statusIcons: Record<TaskStatus, typeof Clock> = {
    pending: Clock,
    completed: CheckCircle2,
    cancelled: XCircle,
  };

  const statusColors: Record<TaskStatus, string> = {
    pending: 'text-yellow-500',
    completed: 'text-green-500',
    cancelled: 'text-gray-500',
  };

  const StatusIcon = statusIcons[status];

  return (
    <Card className={cn(status === 'pending' ? 'border-orange-200' : '')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn('h-5 w-5', statusColors[status])} />
            <CardTitle className="text-base">{category}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {priority !== 'normal' && (
              <Badge variant="outline" className={priorityColors[priority]}>
                <AlertCircle className="h-3 w-3 mr-1" />
                {priority}
              </Badge>
            )}
            <Badge
              variant={
                status === 'pending'
                  ? 'default'
                  : status === 'completed'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {status}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs">{timeAgo}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Task ID/Description */}
        <div>
          <p className="text-sm font-mono text-muted-foreground">{task.id}</p>
        </div>

        {/* Task Data (if available) */}
        {task.data && Object.keys(task.data).filter((k) => k !== 'status').length > 0 && (
          <div className="p-2 bg-muted rounded-md">
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(task.data).filter(([k]) => k !== 'status')
                ),
                null,
                2
              )}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        {status === 'pending' && (
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="default"
              onClick={() => onComplete(task.id)}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complete
            </Button>
            <Button
              variant="outline"
              onClick={() => onCancel(task.id)}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TaskQueue() {
  const { tasks, clearTasks } = useTasks();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [localCompletedTasks, setLocalCompletedTasks] = useState<Set<string>>(new Set());
  const [localCancelledTasks, setLocalCancelledTasks] = useState<Set<string>>(new Set());

  // Handle task actions (optimistic UI)
  const handleComplete = (id: string) => {
    setLocalCompletedTasks((prev) => new Set([...prev, id]));
    // In real implementation, would call JQEL mutation to update task status
    console.log('[TaskQueue] Task completed:', id);
  };

  const handleCancel = (id: string) => {
    setLocalCancelledTasks((prev) => new Set([...prev, id]));
    // In real implementation, would call JQEL mutation to update task status
    console.log('[TaskQueue] Task cancelled:', id);
  };

  // Merge server status with local optimistic updates
  const tasksWithStatus = useMemo(() => {
    return tasks.map((task) => {
      if (localCompletedTasks.has(task.id)) {
        return { ...task, data: { ...task.data, status: 'completed' as const } };
      }
      if (localCancelledTasks.has(task.id)) {
        return { ...task, data: { ...task.data, status: 'cancelled' as const } };
      }
      return task;
    });
  }, [tasks, localCompletedTasks, localCancelledTasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasksWithStatus;
    return tasksWithStatus.filter((t) => (t.data?.status || 'pending') === filter);
  }, [tasksWithStatus, filter]);

  // Stats
  const stats = {
    total: tasks.length,
    pending: tasksWithStatus.filter((t) => (t.data?.status || 'pending') === 'pending').length,
    completed: tasksWithStatus.filter((t) => t.data?.status === 'completed').length,
    cancelled: tasksWithStatus.filter((t) => t.data?.status === 'cancelled').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Task Queue</h2>
          <p className="text-muted-foreground">
            {stats.pending > 0
              ? `${stats.pending} task${stats.pending === 1 ? '' : 's'} require${stats.pending === 1 ? 's' : ''} your attention`
              : 'All tasks completed'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 px-3 py-1 text-sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter: {filter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter tasks</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(['all', 'pending', 'completed', 'cancelled'] as TaskFilter[]).map((f) => (
                <DropdownMenuCheckboxItem
                  key={f}
                  checked={filter === f}
                  onCheckedChange={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== 'all' && ` (${stats[f as keyof typeof stats] || 0})`}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear All */}
          {tasks.length > 0 && (
            <Button variant="outline" className="h-8 px-3 py-1 text-sm" onClick={clearTasks}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle>{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-orange-500">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-green-500">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cancelled</CardDescription>
            <CardTitle className="text-gray-500">{stats.cancelled}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Separator />

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">
              {filter === 'all' ? 'No tasks' : `No ${filter} tasks`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onCancel={handleCancel}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
