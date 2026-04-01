'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

const DEFAULT_CENTER = { lat: 24.8607, lng: 67.0011 };
const DEFAULT_ZOOM = 13;
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

export default function MapPicker({
  center,
  marker,
  onMarkerChange,
  readOnly = false,
  height = 320,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onMarkerRef = useRef(onMarkerChange);

  useEffect(() => {
    onMarkerRef.current = onMarkerChange;
  }, [onMarkerChange]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const start = center || DEFAULT_CENTER;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [start.lng, start.lat],
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    if (!readOnly) {
      map.on('click', (e) => {
        const next = { lat: e.lngLat.lat, lng: e.lngLat.lng };
        if (onMarkerRef.current) onMarkerRef.current(next);
      });
    }

    mapRef.current = map;
    return () => map.remove();
  }, [readOnly]);

  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.flyTo({
      center: [center.lng, center.lat],
      zoom: Math.max(mapRef.current.getZoom(), DEFAULT_ZOOM),
      essential: true,
    });
  }, [center?.lat, center?.lng]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!marker || marker.lat == null || marker.lng == null) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.style.width = '18px';
      el.style.height = '18px';
      el.style.borderRadius = '50%';
      el.style.background = '#0B2D72';
      el.style.border = '2px solid #FFFFFF';
      el.style.boxShadow = '0 2px 10px rgba(15, 23, 42, 0.35)';
      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([marker.lng, marker.lat])
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat([marker.lng, marker.lat]);
    }
  }, [marker?.lat, marker?.lng]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height,
        borderRadius: 14,
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 8px rgba(15,23,42,0.06)',
        background: '#F8FAFC',
      }}
    />
  );
}
