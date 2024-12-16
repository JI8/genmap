'use client'

import { useRef, useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet'
import { ExternalLink } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface Location {
  name: string;
  country: string;
  emoji: string;
  description: string;
  rarity: number;
  latitude: number;
  longitude: number;
}

interface MapProps {
  locations: Location[];
  selectedLocation: Location | null;
  countryFilter?: string | null;
}

// Custom marker icons using emojis
const createCustomIcon = (location: Location) => {
  const size = location.rarity >= 90 ? 'scale-110' : 'scale-100'
  const pulseClass = location.rarity >= 90 ? 'animate-pulse' : ''
  
  const html = `
    <div class="relative ${size} ${pulseClass}">
      <div class="w-10 h-10 bg-white bg-opacity-90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 border-2 border-gray-100 text-2xl">
        ${location.emoji}
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  })
}

function getGoogleMapsUrl(location: Location) {
  return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
}

function getRarityColor(rarity: number): string {
  if (rarity >= 90) return 'text-purple-600';
  if (rarity >= 70) return 'text-blue-600';
  if (rarity >= 50) return 'text-green-600';
  if (rarity >= 30) return 'text-yellow-600';
  return 'text-gray-600';
}

function getRarityLabel(rarity: number): string {
  if (rarity >= 90) return '💎 Hidden Gem';
  if (rarity >= 70) return '🌟 Local Secret';
  if (rarity >= 50) return '🎯 Off the Path';
  if (rarity >= 30) return '📍 Notable Spot';
  return '🎪 Tourist Favorite';
}

// Component to handle map bounds and selected location
function MapUpdater({ locations, selectedLocation, countryFilter, geoJSON }: MapProps & { geoJSON: any }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (selectedLocation) {
      map.flyTo(
        [selectedLocation.latitude, selectedLocation.longitude],
        15,
        {
          duration: 1.5,
          easeLinearity: 0.25
        }
      );
    } else if (geoJSON?.features?.length > 0) {
      // If there's a country filter, fit to the country bounds
      const bounds = L.geoJSON(geoJSON).getBounds();
      map.flyToBounds(bounds, {
        padding: [50, 50],
        duration: 1.5,
        easeLinearity: 0.25
      });
    } else if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
      map.flyToBounds(bounds, { 
        padding: [50, 50],
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [locations, selectedLocation, geoJSON, map]);

  return null;
}

const defaultCenter = {
  lat: 20,
  lng: 0
};

export default function Map({ locations, selectedLocation, countryFilter }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerId = useMemo(() => `map-${Math.random().toString(36).substr(2, 9)}`, []);
  const [geoJSON, setGeoJSON] = useState<any>(null);
  const geoJSONRef = useRef<L.GeoJSON | null>(null);

  // Load GeoJSON data for country highlighting
  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        if (countryFilter) {
          const response = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
          const data = await response.json();
          const filtered = {
            type: "FeatureCollection",
            features: data.features.filter((f: any) => 
              f.properties.ADMIN?.toLowerCase() === countryFilter.toLowerCase()
            )
          };
          setGeoJSON(filtered);
        } else {
          setGeoJSON(null);
        }
      } catch (error) {
        console.error('Error loading GeoJSON:', error);
        setGeoJSON(null);
      }
    };

    loadGeoJSON();
  }, [countryFilter]);

  // Clean up map instance on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="absolute inset-0" id={mapContainerId}>
      <MapContainer
        key={mapContainerId}
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={2}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          noWrap={false}
        />
        {geoJSON && (
          <GeoJSON
            key={countryFilter} // Force re-render when country changes
            data={geoJSON}
            style={{
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              color: '#3b82f6',
              weight: 2,
              opacity: 0.5
            }}
            ref={geoJSONRef}
          />
        )}
        <MapUpdater 
          locations={locations} 
          selectedLocation={selectedLocation} 
          countryFilter={countryFilter}
          geoJSON={geoJSON}
        />
        {locations.map((location, index) => (
          <Marker
            key={`${location.latitude}-${location.longitude}-${index}`}
            position={[location.latitude, location.longitude]}
            icon={createCustomIcon(location)}
            opacity={selectedLocation ? (selectedLocation === location ? 1 : 0.6) : 1}
          >
            <Popup className="rounded-lg" maxWidth={300}>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{location.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{location.name}</h3>
                    <div className="text-sm text-gray-600">{location.country}</div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {location.description}
                </p>

                <div className="space-y-2">
                  <div className={`px-3 py-2 rounded-lg ${getRarityColor(location.rarity).replace('text-', 'bg-')} bg-opacity-10 flex items-center justify-between`}>
                    <span className="font-medium">{getRarityLabel(location.rarity)}</span>
                  </div>

                  <a
                    href={getGoogleMapsUrl(location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View on Google Maps</span>
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
} 