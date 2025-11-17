import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

interface HeatMapProps {
  data: Array<{ latitude: number; longitude: number; value: number }>;
  type: string;
}

const HeatMap = ({ data, type }: HeatMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Initialize map - centered on Jharkhand mining region to show all three mines
    const map = L.map(mapContainer.current, {
      center: [23.00, 86.30], // Central point between all three mines
      zoom: 9,
      zoomControl: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstance.current = map;
    setIsLoading(false);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || data.length === 0) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      mapInstance.current.removeLayer(heatLayerRef.current);
    }

    // Add mine location markers
    const miningLocations = [
      { name: 'Jadugora Uranium Mines', lat: 22.65, lng: 86.35 },
      { name: 'Dhanbad Coal Mines', lat: 23.80, lng: 86.43 },
      { name: 'HCL Mines East Singhbhum', lat: 22.56, lng: 86.18 }
    ];

    miningLocations.forEach(mine => {
      L.marker([mine.lat, mine.lng])
        .addTo(mapInstance.current!)
        .bindPopup(`<strong>${mine.name}</strong>`);
    });

    // Prepare heat data with intensity
    const heatData = data.map(point => [
      point.latitude,
      point.longitude,
      point.value / 100, // Normalize to 0-1
    ]);

    // Add new heat layer
    const heatLayer = (L as any).heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: '#00ff00',
        0.4: '#ffff00',
        0.6: '#ff9900',
        0.8: '#ff0000',
        1.0: '#990000',
      },
    }).addTo(mapInstance.current);

    heatLayerRef.current = heatLayer;

    // Fit bounds to show all three mines
    if (data.length > 0) {
      const bounds = L.latLngBounds(data.map(d => [d.latitude, d.longitude]));
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [data]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg overflow-hidden border-2 border-border shadow-2xl" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-lg">
          <div className="text-foreground">Loading map...</div>
        </div>
      )}
      {data.length === 0 && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-lg">
          <div className="text-center">
            <p className="text-muted-foreground">No data available</p>
            <p className="text-sm text-muted-foreground mt-2">Upload a dataset or load sample data</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatMap;
