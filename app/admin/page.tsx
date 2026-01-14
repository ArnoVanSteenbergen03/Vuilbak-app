'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TrashCan {
  id: number;
  location: string;
  status: string;
  lat?: number;
  lng?: number;
  lastUpdated?: string;
}

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('vol') || statusLower === 'full') {
    return 'bg-red-100 text-red-800';
  }
  return 'bg-green-100 text-green-800';
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check password (you should use an environment variable for this)
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      setError('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            🔐 Admin Panel
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Enter your password to continue
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
            >
              Login
            </button>
            <Link href="/" className="block text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
              Back to map
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [trashCans, setTrashCans] = useState<TrashCan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrash, setSelectedTrash] = useState<number | null>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrashCans = async () => {
      try {
        const response = await fetch('/api/trash-status');
        if (response.ok) {
          const data = await response.json();
          setTrashCans(data);
        }
      } catch (error) {
        console.error('Failed to fetch trash cans', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrashCans();
  }, []);

  const handleAction = async (action: string) => {
    if (selectedTrash === null) {
      setActionResult('Please select a trash can');
      return;
    }

    try {
      console.log(`[Admin] Updating trash can ${selectedTrash} to status: ${action}`);
      
      // Map action to Postman API status values
      let status: string;
      switch (action) {
        case 'empty':
          status = 'empty';
          break;
        case 'full':
          status = 'full';
          break;
        default:
          status = action;
      }

      console.log(`[Admin] Sending PUT request to /api/trash-status with status: ${status}`);
      
      const response = await fetch(
        `/api/trash-status/${selectedTrash}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      console.log(`[Admin] PUT response status: ${response.status}`);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log(`[Admin] PUT response data:`, responseData);
        
        const selected = trashCans.find((t) => t.id === selectedTrash);
        setActionResult(`${selected?.location} - Status updated to ${action}`);
        
        // Refresh trash cans data
        console.log(`[Admin] Refreshing trash cans data...`);
        const refreshResponse = await fetch('/api/trash-status');
        if (refreshResponse.ok) {
          const updatedData = await refreshResponse.json();
          console.log(`[Admin] Refreshed trash cans:`, updatedData);
          setTrashCans(updatedData);
        } else {
          console.error(`[Admin] Failed to refresh trash cans. Status: ${refreshResponse.status}`);
        }

        setTimeout(() => setActionResult(null), 3000);
      } else {
        const errorText = await response.text();
        console.error(`[Admin] Failed to update status. Response:`, errorText);
        setActionResult('Failed to update status');
      }
    } catch (error) {
      console.error('[Admin] Error in handleAction:', error);
      setActionResult('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              🗑️ Trash Can Admin Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Control trash can status
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
          >
            Back to Map
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Loading trash cans...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trash Can List */}
              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Select Trash Can
                </h2>
                <div className="space-y-2">
                  {trashCans.map((trash) => (
                    <button
                      key={trash.id}
                      onClick={() => setSelectedTrash(trash.id)}
                      className={`w-full text-left p-4 rounded-lg transition border-2 ${
                        selectedTrash === trash.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900'
                          : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {trash.location}
                      </div>
                      <div className={`text-sm mt-1 inline-block px-2 py-1 rounded ${getStatusColor(trash.status)}`}>
                        {trash.status}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Control Panel */}
              <div className="lg:col-span-2">
                {selectedTrash ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {trashCans.find((t) => t.id === selectedTrash)?.location}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Set the status for this trash can
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => handleAction('empty')}
                        className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium text-lg"
                      >
                        🟢 Not Full
                      </button>
                      <button
                        onClick={() => handleAction('full')}
                        className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium text-lg"
                      >
                        🔴 Full
                      </button>
                    </div>

                    {actionResult && (
                      <div className="p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 rounded-lg">
                        ✓ {actionResult}
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        💡 Changes will be reflected on the main dashboard immediately.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      Select a trash can to control its status
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

