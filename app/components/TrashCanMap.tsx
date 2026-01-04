'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom trash can icon
const trashCanIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjAwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMyA2aDE4Ii8+PHBhdGggZD0iTTE5IDZ2MTRjMCAxLTEgMi0yIDJIN2MtMSAwLTItMS0yLTJWNiIvPjxwYXRoIGQ9Ik04IDZWNGMwLTEgMS0yIDItMmg0YzEgMCAyIDEgMiAydjIiLz48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export interface TrashCan {
  id: number;
  location: string;
  lat: number;
  lng: number;
  status: 'Vol' | 'Niet vol' | 'Halfvol';
  lastUpdated: string;
}

const baseTrashCans: TrashCan[] = [
  {
    id: 1,
    location: 'Gravensteenstraat',
    lat: 51.0568,
    lng: 3.7192,
    status: 'Niet vol',
    lastUpdated: '2025-12-17',
  },
  {
    id: 2,
    location: 'Korenmarkt',
    lat: 51.0543,
    lng: 3.7205,
    status: 'Vol',
    lastUpdated: '2025-12-17',
  },
  {
    id: 3,
    location: 'Citadelpark',
    lat: 51.0398,
    lng: 3.7103,
    status: 'Halfvol',
    lastUpdated: '2025-12-17',
  },
  {
    id: 4,
    location: 'Sint-Pietersplein',
    lat: 51.0475,
    lng: 3.7268,
    status: 'Niet vol',
    lastUpdated: '2025-12-17',
  },
  {
    id: 5,
    location: 'Vrijdagmarkt',
    lat: 51.0589,
    lng: 3.7243,
    status: 'Halfvol',
    lastUpdated: '2025-12-17',
  },
  {
    id: 6,
    location: 'Gentbrugge Meersen',
    lat: 51.0358,
    lng: 3.7565,
    status: 'Vol',
    lastUpdated: '2025-12-17',
  },
];

const getStatusColor = (status: TrashCan['status']) => {
  switch (status) {
    case 'Vol':
      return 'text-red-600 font-semibold';
    case 'Halfvol':
      return 'text-orange-500 font-semibold';
    case 'Niet vol':
      return 'text-green-600 font-semibold';
  }
};

type TrashStatusResponse = {
  isFull: boolean;
  distance: number | null;
};

export default function TrashCanMap() {
  const [trashCans, setTrashCans] = useState<TrashCan[]>(baseTrashCans);
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(testMode ? '/api/trash-status/test' : '/api/trash-status');
        const data: TrashStatusResponse = await res.json();

        const newStatus: TrashCan['status'] = data.isFull ? 'Vol' : 'Niet vol';
        const updatedDate = new Date().toISOString().slice(0, 10);

        setTrashCans((prev) =>
          prev.map((t) => ({
            ...t,
            status: newStatus,
            lastUpdated: updatedDate,
          })),
        );
      } catch (e) {
        console.error('Failed to fetch trash status', e);
      }
    };

    fetchStatus();
    const id = setInterval(fetchStatus, 1000);
    return () => clearInterval(id);
  }, [testMode]);

  return (
    <div className="w-full space-y-4">
      {testMode && (
        <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
          <h3 className="font-bold mb-2">Test Mode</h3>
          <div className="flex gap-2">
            <button
              onClick={() => fetch('/api/trash-status/test?action=full')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Set FULL
            </button>
            <button
              onClick={() => fetch('/api/trash-status/test?action=halfway')}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Set HALFWAY
            </button>
            <button
              onClick={() => fetch('/api/trash-status/test?action=empty')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Set EMPTY
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Test Mode (no Arduino)</span>
        </label>
      </div>

      <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[51.0543, 3.7174]}
        zoom={13}
        className="w-full h-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {trashCans.map((trashCan) => (
          <Marker
            key={trashCan.id}
            position={[trashCan.lat, trashCan.lng]}
            icon={trashCanIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2">
                  {trashCan.location}
                </h3>
                <p className="mb-1">
                  Status:{' '}
                  <span className={getStatusColor(trashCan.status)}>
                    {trashCan.status}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Laatst geüpdatet: {trashCan.lastUpdated}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
    </div>
  );
}
