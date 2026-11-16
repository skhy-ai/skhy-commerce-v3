import { useState, useEffect, useCallback } from 'react';

export interface VesselData {
  mmsi: string;
  name?: string;
  lat: number;
  lon: number;
  heading: number; // 0-359 degrees
  speed: number; // in knots
  status: 'underway' | 'moored' | 'anchored' | 'unknown';
  type?: string;
  isAnomaly?: boolean;
}

interface UseMaritimeStreamOptions {
  url?: string;
  useMock?: boolean;
  updateIntervalMs?: number;
}

/**
 * A hook to connect to a live maritime AIS data stream via WebSockets.
 * Provides a mock mode for demonstrations when real API keys are unavailable.
 */
export function useMaritimeStream(options: UseMaritimeStreamOptions = {}) {
  const {
    url = 'wss://api.example.com/ais',
    useMock = true,
    updateIntervalMs = 2000
  } = options;

  const [vessels, setVessels] = useState<Record<string, VesselData>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MOCK MODE: Simulates a fleet of vessels moving around Singapore/Malacca Strait
  useEffect(() => {
    if (!useMock) return;

    setIsConnected(true);

    // Initial mock vessels
    const initialVessels: Record<string, VesselData> = {
      '563000001': { mmsi: '563000001', name: 'OCEAN STAR', lat: 1.25, lon: 103.8, heading: 45, speed: 12.5, status: 'underway', type: 'Cargo', isAnomaly: false },
      '563000002': { mmsi: '563000002', name: 'PACIFIC DAWN', lat: 1.28, lon: 103.85, heading: 90, speed: 15.0, status: 'underway', type: 'Tanker', isAnomaly: false },
      '563000003': { mmsi: '563000003', name: 'GHOST VESSEL', lat: 1.15, lon: 103.7, heading: 270, speed: 22.0, status: 'underway', type: 'Unknown', isAnomaly: true },
    };
    
    setVessels(initialVessels);

    const intervalId = setInterval(() => {
      setVessels(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(mmsi => {
          const v = { ...next[mmsi] };
          
          // Move vessel slightly based on heading and speed
          const distanceDeg = (v.speed / 60) * 0.001; // extremely simplified mock calculation
          const rad = (v.heading * Math.PI) / 180;
          v.lat += Math.cos(rad) * distanceDeg;
          v.lon += Math.sin(rad) * distanceDeg;
          
          next[mmsi] = v;
        });
        return next;
      });
    }, updateIntervalMs);

    return () => clearInterval(intervalId);
  }, [useMock, updateIntervalMs]);

  // LIVE MODE: Real WebSocket connection
  useEffect(() => {
    if (useMock) return;

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data: VesselData = JSON.parse(event.data);
          setVessels(prev => ({
            ...prev,
            [data.mmsi]: data
          }));
        } catch (err) {
          console.error("Failed to parse maritime data stream", err);
        }
      };

      ws.onerror = (event) => {
        setError('WebSocket error occurred');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [url, useMock]);

  return {
    vessels,
    vesselList: Object.values(vessels),
    isConnected,
    error
  };
}
