'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create a custom trash can icon
const trashCanIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjAwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMyA2aDE4Ii8+PHBhdGggZD0iTTE5IDZ2MTRjMCAxLTEgMi0yIDJIN2MtMSAwLTItMS0yLTJWNiIvPjxwYXRoIGQ9Ik04IDZWNGMwLTEgMS0yIDItMmg0YzEgMCAyIDEgMiAydjIiLz48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Trash can locations in Gent (placeholder data)
export interface TrashCan {
  id: number;
  location: string;
  lat: number;
  lng: number;
  status: 'Vol' | 'Niet vol' | 'Halfvol';
  lastUpdated: string;
}

const trashCans: TrashCan[] = [
  {
    id: 1,
    location: 'Gravensteenstraat',
    lat: 51.0568,
    lng: 3.7192,
    status: 'Niet vol',
    lastUpdated: '2025-12-17'
  },
  {
    id: 2,
    location: 'Korenmarkt',
    lat: 51.0543,
    lng: 3.7205,
    status: 'Vol',
    lastUpdated: '2025-12-17'
  },
  {
    id: 3,
    location: 'Citadelpark',
    lat: 51.0398,
    lng: 3.7103,
    status: 'Halfvol',
    lastUpdated: '2025-12-17'
  },
  {
    id: 4,
    location: 'Sint-Pietersplein',
    lat: 51.0475,
    lng: 3.7268,
    status: 'Niet vol',
    lastUpdated: '2025-12-17'
  },
  {
    id: 5,
    location: 'Vrijdagmarkt',
    lat: 51.0589,
    lng: 3.7243,
    status: 'Halfvol',
    lastUpdated: '2025-12-17'
  },
  {
    id: 6,
    location: 'Gentbrugge Meersen',
    lat: 51.0358,
    lng: 3.7565,
    status: 'Vol',
    lastUpdated: '2025-12-17'
  }
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

export default function TrashCanMap() {
  return (
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
                <h3 className="font-bold text-lg mb-2">{trashCan.location}</h3>
                <p className="mb-1">
                  Status: <span className={getStatusColor(trashCan.status)}>{trashCan.status}</span>
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
  );
}
