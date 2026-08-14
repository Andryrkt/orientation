import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Universite } from '../lib/types';

const defaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: icon2x,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Centre approximatif de Madagascar
const MADAGASCAR_CENTER: [number, number] = [-18.9, 47.0];

interface UniversitesMapProps {
  universites: Universite[];
  height?: string;
}

export function UniversitesMap({ universites, height = '480px' }: UniversitesMapProps) {
  const points = useMemo(
    () => universites.filter((u) => u.latitude != null && u.longitude != null),
    [universites],
  );

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10" style={{ height }}>
      <MapContainer center={MADAGASCAR_CENTER} zoom={6} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((u) => (
          <Marker key={u.id} position={[u.latitude as number, u.longitude as number]} icon={defaultIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold mb-1">{u.nom}</p>
                {(u.ville || u.region) && (
                  <p className="text-slate-500 mb-2">{u.ville}{u.region ? `, ${u.region}` : ''}</p>
                )}
                <Link to={`/universites/${u.slug}`} className="text-blue-600 font-semibold">
                  Voir la fiche →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
