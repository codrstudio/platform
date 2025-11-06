import { SessionStatus } from '../../../components/auth/SessionStatus';

export default function SetupHome() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Setup Module</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome to the platform setup module. This is the home page of the setup portal.
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            This component was lazy-loaded as a separate chunk.
          </p>
        </div>

        {/* Session Status Card */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Authentication</h2>
          <SessionStatus />
        </div>
      </div>
    </div>
  );
}
