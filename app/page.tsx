'use client';

import dynamic from 'next/dynamic';

// Dynamically import the map component (no SSR since Leaflet requires window object)
const TrashCanMap = dynamic(() => import('./components/TrashCanMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">Kaart laden...</div>
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🗑️ Vuilbak App - Gent
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Bekijk de status van vuilbakken in realtime op de kaart
          </p>
        </div>

        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Niet vol</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-orange-500 rounded-full"></span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Halfvol</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-red-500 rounded-full"></span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Vol</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
          <TrashCanMap />
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>💡 Klik op een marker voor meer details over de vuilbak</p>
        </div>
      </main>
    </div>
  );
}
