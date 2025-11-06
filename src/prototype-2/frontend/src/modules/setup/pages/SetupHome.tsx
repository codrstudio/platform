import { Link } from 'react-router-dom';
import { SessionStatus } from '../../../components/auth/SessionStatus';
import { ColorPicker } from '../components/ColorPicker';
import { PlatformSettings } from '../components/PlatformSettings';
import { Settings, ArrowRight, Package } from 'lucide-react';

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

        {/* Management Cards */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Platform Management
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Portal Management Card */}
            <Link
              to="/setup/portals"
              className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950">
                    <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Manage Portals
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Configure portals and their modules
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 dark:text-gray-600" />
              </div>
            </Link>

            {/* Module Management Card */}
            <Link
              to="/setup/modules"
              className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-green-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-green-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950">
                    <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Manage Modules
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      View and manage available modules
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 dark:text-gray-600" />
              </div>
            </Link>
          </div>
        </div>

        {/* Session Status Card */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Authentication</h2>
          <SessionStatus />
        </div>

        {/* Theme Configuration */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Theme Configuration
          </h2>
          <ColorPicker />
        </div>

        {/* Platform Settings */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Platform Settings
          </h2>
          <PlatformSettings />
        </div>
      </div>
    </div>
  );
}
