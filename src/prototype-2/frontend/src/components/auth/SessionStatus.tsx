/**
 * SessionStatus Component
 *
 * Displays current authentication status and provides logout controls.
 * Demonstrates secure logout functionality per SPEC-authentication.md:
 * - SPEC-AU-LO-* (Logout single session)
 * - SPEC-AU-LA-* (Logout all sessions)
 *
 * Features:
 * - Visual feedback via toast notifications
 * - Confirmation dialog for logout-all (security best practice)
 * - Loading states during logout operations
 * - User info display (username, email, roles)
 */

import { useState } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { toast } from '../../hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { LogOut, User, ShieldAlert } from 'lucide-react';

export function SessionStatus() {
  const { user, isAuthenticated, isLoading, logout, logoutAll } = useAuth();
  const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);

  /**
   * Handle logout (current session only)
   * Per SPEC-AU-LO-013:015 - clears tokens and auth state
   */
  const handleLogout = async () => {
    try {
      await logout();

      // Success feedback (SPEC-AU-LO-010)
      toast({
        variant: 'success',
        title: 'Logged out',
        description: 'You have been successfully logged out of this session.',
        duration: 3000,
      });
    } catch (error) {
      // Error feedback
      toast({
        variant: 'error',
        title: 'Logout failed',
        description: error instanceof Error ? error.message : 'Failed to logout. Please try again.',
        duration: 5000,
      });
    }
  };

  /**
   * Handle logout all sessions
   * Per SPEC-AU-LA-010 - revokes ALL refresh tokens for the user
   * Shows confirmation dialog before proceeding (security best practice)
   */
  const handleLogoutAll = async () => {
    try {
      await logoutAll();

      // Success feedback (SPEC-AU-LA-013)
      toast({
        variant: 'success',
        title: 'All sessions logged out',
        description: 'You have been logged out of all active sessions across all devices.',
        duration: 3000,
      });
    } catch (error) {
      // Error feedback
      toast({
        variant: 'error',
        title: 'Logout all failed',
        description: error instanceof Error ? error.message : 'Failed to logout all sessions. Please try again.',
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <User className="h-5 w-5" />
          <span className="text-sm">Not authenticated</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* User Info */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Session Status</h3>
          </div>

          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Username:</span>{' '}
              <span className="text-gray-900 dark:text-gray-100">{user.username}</span>
            </div>

            {user.email && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>{' '}
                <span className="text-gray-900 dark:text-gray-100">{user.email}</span>
              </div>
            )}

            {user.roles && user.roles.length > 0 && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Roles:</span>{' '}
                <span className="text-gray-900 dark:text-gray-100">{user.roles.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Logout Actions */}
        <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
          {/* Logout Current Session */}
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>

          {/* Logout All Sessions - with confirmation */}
          <button
            onClick={() => setShowLogoutAllDialog(true)}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
          >
            <ShieldAlert className="h-4 w-4" />
            Logout All Devices
          </button>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            "Logout All Devices" will end all your active sessions everywhere.
          </p>
        </div>
      </div>

      {/* Confirmation Dialog for Logout All */}
      <AlertDialog open={showLogoutAllDialog} onOpenChange={setShowLogoutAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout all sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will end all your active sessions across all devices. You will need to login again on each device.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutAll}>Logout All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
