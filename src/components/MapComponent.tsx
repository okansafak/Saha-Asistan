import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [32.85, 39.92], // EPSG:3857 değil, EPSG:4326, dönüştürülmeli
        zoom: 6,
        projection: 'EPSG:4326',
      }),
    });
    return () => map.setTarget(undefined);
  }, []);

  return (
    <div ref={mapRef} className="w-full h-96 rounded-lg shadow border" />
  );
};

export default MapComponent;
