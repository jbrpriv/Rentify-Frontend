'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

const DEFAULT_CENTER = { lat: 24.8607, lng: 67.0011 };
const DEFAULT_ZOOM = 14;
const TARGET_ZOOM = 15;
// Positron keeps a clean white base; we pair it with deep blue markers.
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const styleCache = { style: null, promise: null };

const cloneStyle = (style) => {
  if (typeof structuredClone === 'function') return structuredClone(style);
  return JSON.parse(JSON.stringify(style));
};

const applyEnglishLabels = (style) => {
  if (!style?.layers) return style;
  const next = { ...style };
  next.layers = style.layers.map((layer) => {
    if (layer?.type !== 'symbol') return layer;
    const textField = layer.layout?.['text-field'];
    if (!textField) return layer;

    const englishField = ['coalesce', ['get', 'name:en'], ['get', 'name:latin'], ['get', 'name']];
    return {
      ...layer,
      layout: {
        ...layer.layout,
        'text-field': englishField,
      },
    };
  });
  return next;
};

const loadStyle = async () => {
  if (styleCache.style) return styleCache.style;
  if (!styleCache.promise) {
    styleCache.promise = fetch(MAP_STYLE)
      .then((resp) => resp.json())
      .then((json) => {
        styleCache.style = json;
        return json;
      });
  }
  return styleCache.promise;
};

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

    let cancelled = false;
    const start = center || DEFAULT_CENTER;

    const initMap = async () => {
      const baseStyle = await loadStyle();
      if (cancelled || !containerRef.current) return;
      const style = applyEnglishLabels(cloneStyle(baseStyle));
      const map = new maplibregl.Map({
        container: containerRef.current,
        style,
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
    };

    initMap();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [readOnly]);

  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.flyTo({
      center: [center.lng, center.lat],
      zoom: Math.max(mapRef.current.getZoom(), TARGET_ZOOM),
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
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '12px';
      el.style.background = '#FFFFFF';
      el.style.border = '2px solid #0B2D72';
      el.style.boxShadow = '0 4px 12px rgba(11, 45, 114, 0.25)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M3 11.5L12 4l9 7.5" stroke="#0B2D72" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5 10.5V20h14v-9.5" stroke="#0B2D72" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9.5 20v-6h5v6" stroke="#0B2D72" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
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
