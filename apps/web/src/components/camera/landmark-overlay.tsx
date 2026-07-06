'use client';

import { useEffect, useRef } from 'react';
import type { DetectionResult, HandResult } from '@/lib/use-websocket-camera';

interface LandmarkOverlayProps {
  detection: DetectionResult | null;
  width?: number;
  height?: number;
}

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

const POSE_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10], [11, 12], [11, 23], [12, 24],
  [23, 24], [23, 25], [25, 27], [27, 29], [29, 31],
  [24, 26], [26, 28], [28, 30], [30, 32],
];

const HAND_COLORS = ['#00FF88', '#FF6600'];

function drawHand(ctx: CanvasRenderingContext2D, hand: HandResult, color: string) {
  const { landmarks } = hand;

  // Draw connections
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;

  for (const [i, j] of HAND_CONNECTIONS) {
    if (landmarks[i] && landmarks[j]) {
      ctx.beginPath();
      ctx.moveTo(landmarks[i].x * ctx.canvas.width, landmarks[i].y * ctx.canvas.height);
      ctx.lineTo(landmarks[j].x * ctx.canvas.width, landmarks[j].y * ctx.canvas.height);
      ctx.stroke();
    }
  }

  // Draw landmarks
  ctx.globalAlpha = 1;
  for (const lm of landmarks) {
    ctx.beginPath();
    ctx.arc(lm.x * ctx.canvas.width, lm.y * ctx.canvas.height, 4, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawFace(ctx: CanvasRenderingContext2D, landmarks: { landmarks: { x: number; y: number; z: number }[] }) {
  if (!landmarks.landmarks) return;

  ctx.globalAlpha = 0.3;
  for (const lm of landmarks.landmarks) {
    ctx.beginPath();
    ctx.arc(lm.x * ctx.canvas.width, lm.y * ctx.canvas.height, 1, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFAA00';
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPose(ctx: CanvasRenderingContext2D, landmarks: { landmarks: { x: number; y: number; z: number }[] }) {
  const pts = landmarks.landmarks;
  if (!pts) return;

  ctx.strokeStyle = '#00AAFF';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;

  for (const [i, j] of POSE_CONNECTIONS) {
    if (pts[i] && pts[j]) {
      ctx.beginPath();
      ctx.moveTo(pts[i].x * ctx.canvas.width, pts[i].y * ctx.canvas.height);
      ctx.lineTo(pts[j].x * ctx.canvas.width, pts[j].y * ctx.canvas.height);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
  for (const lm of pts) {
    ctx.beginPath();
    ctx.arc(lm.x * ctx.canvas.width, lm.y * ctx.canvas.height, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#00AAFF';
    ctx.fill();
  }
}

export function LandmarkOverlay({ detection, width = 640, height = 480 }: LandmarkOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (!detection) return;

    // Draw pose
    if (detection.pose) {
      drawPose(ctx, detection.pose);
    }

    // Draw face
    if (detection.face) {
      drawFace(ctx, detection.face);
    }

    // Draw hands
    if (detection.hands) {
      detection.hands.forEach((hand, index) => {
        const color = HAND_COLORS[index % HAND_COLORS.length];
        drawHand(ctx, hand, color);

        // Draw handedness label
        if (hand.landmarks.length > 0) {
          const lm = hand.landmarks[0];
          ctx.fillStyle = color;
          ctx.font = '14px sans-serif';
          ctx.fillText(
            hand.handedness,
            lm.x * width + 10,
            lm.y * height - 10,
          );
        }
      });
    }
  }, [detection, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      width={width}
      height={height}
    />
  );
}
