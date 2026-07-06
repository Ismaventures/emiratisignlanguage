'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface HandResult {
  handedness: 'Left' | 'Right';
  landmarks: Landmark[];
}

export interface FaceResult {
  landmarks: Landmark[];
}

export interface PoseResult {
  landmarks: Landmark[];
}

export interface DetectionResult {
  hands: HandResult[];
  face: FaceResult | null;
  pose: PoseResult | null;
  confidence: number;
  timestamp: number;
}

export interface GestureResult {
  gestureId: string;
  gestureName: string;
  confidence: number;
  timestamp: number;
}

export interface WsMessage {
  type: 'detection' | 'gesture' | 'error' | 'connected';
  payload: DetectionResult | GestureResult | string;
  timestamp: number;
}

interface UseWebSocketCameraOptions {
  url?: string;
  onDetection?: (result: DetectionResult) => void;
  onGesture?: (result: GestureResult) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  enabled?: boolean;
}

export function useWebSocketCamera(options: UseWebSocketCameraOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001',
    onDetection,
    onGesture,
    onError,
    onConnect,
    onDisconnect,
    enabled = true,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(`${url}/api/v1/vision/stream`);

      ws.onopen = () => {
        setIsConnected(true);
        setIsReconnecting(false);
        reconnectAttempts.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.landmarks) {
            onDetection?.(data.landmarks as DetectionResult);
          }
          if (data.gesture) {
            onGesture?.(data.gesture as GestureResult);
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        onError?.('WebSocket connection error');
      };

      ws.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();

        // Attempt reconnection
        if (reconnectAttempts.current < maxReconnectAttempts && enabled) {
          setIsReconnecting(true);
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      onError?.('Failed to create WebSocket connection');
    }
  }, [url, enabled, onDetection, onGesture, onError, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsReconnecting(false);
  }, []);

  const sendFrame = useCallback(
    (imageBase64: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            image: imageBase64,
            timestamp: Date.now(),
          }),
        );
        return true;
      }
      return false;
    },
    [],
  );

  useEffect(() => {
    if (enabled) {
      connect();
    }
    return disconnect;
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    isReconnecting,
    sendFrame,
    connect,
    disconnect,
  };
}
