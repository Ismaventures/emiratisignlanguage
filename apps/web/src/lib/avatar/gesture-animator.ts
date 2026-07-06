'use client';

import type { GestureSample } from '../dataset-types';

export interface AnimatedGesture {
  gesture: GestureSample;
  frames: GestureFrame[];
  currentFrame: number;
  elapsed: number;
  loop: boolean;
  playing: boolean;
}

export interface GestureFrame {
  leftHandX: number;
  leftHandY: number;
  rightHandX: number;
  rightHandY: number;
  leftFingers: number[];
  rightFingers: number[];
  duration: number;
}

export function gestureToFrames(gesture: GestureSample, numFrames: number = 10): GestureFrame[] {
  const frames: GestureFrame[] = [];
  const lm = gesture.landmarks;

  if (lm.length < 21) {
    for (let i = 0; i < numFrames; i++) {
      const t = i / (numFrames - 1);
      const wave = Math.sin(t * Math.PI * 2) * 0.15;
      frames.push({
        leftHandX: -0.25 + wave, leftHandY: 0.2 + Math.sin(t * Math.PI) * 0.1,
        rightHandX: 0.25 - wave, rightHandY: 0.2 + Math.cos(t * Math.PI) * 0.1,
        leftFingers: [0.2, 0.3, 0.3, 0.3, 0.2], rightFingers: [0.2, 0.3, 0.3, 0.3, 0.2],
        duration: 0.18,
      });
    }
    return frames;
  }

  const wrist = lm[0];
  const hx = (wrist[0] - 0.5) * 2;
  const hy = (0.7 - wrist[1]) * 2;

  for (let i = 0; i < numFrames; i++) {
    const t = i / (numFrames - 1);
    const wave = Math.sin(t * Math.PI * 2) * 0.08;
    frames.push({
      leftHandX: -hx * 0.8 + wave, leftHandY: hy * 0.8 + Math.sin(t * Math.PI) * 0.05,
      rightHandX: hx * 0.8 - wave, rightHandY: hy * 0.8 + Math.cos(t * Math.PI) * 0.05,
      leftFingers: [0.2, 0.3, 0.3, 0.3, 0.2], rightFingers: [0.2, 0.3, 0.3, 0.3, 0.2],
      duration: 0.16,
    });
  }
  return frames;
}

export function createGestureAnimation(gesture: GestureSample, loop = false, framesPerGesture = 10): AnimatedGesture {
  return { gesture, frames: gestureToFrames(gesture, framesPerGesture), currentFrame: 0, elapsed: 0, loop, playing: true };
}
