'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Link from 'next/link';
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

// Function to create trash can icon with dynamic color based on status
const getTrashCanIcon = (status: string) => {
  const color = status.toLowerCase().includes('vol') || status.toLowerCase() === 'full' ? '#ff0000' : '#00aa00';
  
  // Create SVG with dynamic color
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
  
  // Encode to base64
  const encoded = btoa(svg);
  
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${encoded}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export interface TrashCan {
  id: number;
  location: string;
  lat: number;
  lng: number;
  status: string;
  lastUpdated: string;
}

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('vol') || statusLower === 'full') {
    return 'text-red-600 font-semibold';
  }
  return 'text-green-600 font-semibold';
};

type TrashCanResponse = TrashCan[];

export default function TrashCanMap() {
  const [trashCans, setTrashCans] = useState<TrashCan[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        console.log('[TrashCanMap] Fetching trash cans...');
        const res = await fetch('/api/trash-status');
        const data: TrashCanResponse = await res.json();
        
        console.log('[TrashCanMap] Fetched trash cans:', data);
        setTrashCans(data);
      } catch (e) {
        console.error('[TrashCanMap] Failed to fetch trash status', e);
      }
    };

    fetchStatus();
    const id = setInterval(fetchStatus, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end">
        <Link
          href="/admin"
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition font-medium shadow-md"
        >
          🔧 Admin Panel
        </Link>
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
            icon={getTrashCanIcon(trashCan.status)}
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
                  Last update: {trashCan.lastUpdated}
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
