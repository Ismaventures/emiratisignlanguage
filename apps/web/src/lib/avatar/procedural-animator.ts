'use client';

import * as THREE from 'three';

export interface SignKeyframe {
  time: number;
  bones: Record<string, { x: number; y: number; z: number }>;
}

const BONE_POSES: Record<string, SignKeyframe[]> = {
  HELLO: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.3 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0.2, z: 0.3 }, RightForeArm: { x: 0, y: 0.1, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.3 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: -0.1, z: 0.3 }, RightForeArm: { x: 0, y: -0.05, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.3 } } },
    { time: 0.9, bones: { RightHand: { x: 0, y: 0.15, z: 0.3 }, RightForeArm: { x: 0, y: 0.08, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.3 } } },
    { time: 1.2, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.3 } } },
  ],
  THANK_YOU: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.8 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
    { time: 0.3, bones: { RightHand: { x: 0.1, y: 0, z: -0.2 }, RightForeArm: { x: 0.05, y: 0, z: 0.6 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
    { time: 0.6, bones: { RightHand: { x: 0.2, y: 0, z: -0.4 }, RightForeArm: { x: 0.1, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
    { time: 1.0, bones: { RightHand: { x: 0.1, y: 0, z: -0.2 }, RightForeArm: { x: 0.05, y: 0, z: 0.6 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
  ],
  PLEASE: [
    { time: 0, bones: { RightHand: { x: 0.1, y: 0, z: 0 }, RightForeArm: { x: 0.3, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
    { time: 0.4, bones: { RightHand: { x: 0.1, y: 0.05, z: 0 }, RightForeArm: { x: 0.3, y: 0.05, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
    { time: 0.8, bones: { RightHand: { x: 0.1, y: -0.05, z: 0 }, RightForeArm: { x: 0.3, y: -0.05, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
    { time: 1.0, bones: { RightHand: { x: 0.1, y: 0, z: 0 }, RightForeArm: { x: 0.3, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
  ],
  YES: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.2, bones: { RightHand: { x: 0.15, y: 0, z: 0 }, RightForeArm: { x: 0.1, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.4, bones: { RightHand: { x: -0.1, y: 0, z: 0 }, RightForeArm: { x: -0.05, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0.15, y: 0, z: 0 }, RightForeArm: { x: 0.1, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.8, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  NO: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.2, bones: { RightHand: { x: 0, y: 0.15, z: 0 }, RightForeArm: { x: 0, y: 0.1, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.4, bones: { RightHand: { x: 0, y: -0.15, z: 0 }, RightForeArm: { x: 0, y: -0.1, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0.15, z: 0 }, RightForeArm: { x: 0, y: 0.1, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.8, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  HELP: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.3 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: -0.2, z: 0.1 }, RightForeArm: { x: 0, y: -0.1, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: -0.2, z: -0.1 }, LeftForeArm: { x: 0, y: -0.1, z: -0.3 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0.1 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: -0.1 }, LeftForeArm: { x: 0, y: 0, z: -0.3 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
  ],
  GOOD: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0, z: 0.2 }, RightForeArm: { x: 0, y: 0, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
    { time: 1.0, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
  ],
  I: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0, z: 0.1 }, RightForeArm: { x: 0.2, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0.1 }, RightForeArm: { x: 0.2, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  YOU: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  WHAT: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
    { time: 0.3, bones: { RightHand: { x: 0.1, y: 0, z: 0 }, RightForeArm: { x: 0.05, y: 0, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
    { time: 0.6, bones: { RightHand: { x: -0.1, y: 0, z: 0 }, RightForeArm: { x: -0.05, y: 0, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
    { time: 0.9, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
  ],
  WHERE: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
    { time: 0.3, bones: { RightHand: { x: 0.2, y: 0, z: 0 }, RightForeArm: { x: 0.1, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
    { time: 0.6, bones: { RightHand: { x: -0.2, y: 0, z: 0 }, RightForeArm: { x: -0.1, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
    { time: 0.9, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.2 } } },
  ],
  HOW: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0.15, y: 0, z: 0 }, RightForeArm: { x: 0.1, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: -0.15, y: 0, z: 0 }, RightForeArm: { x: -0.1, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.9, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  GOODBYE: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.3 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0.2, z: 0.3 }, RightForeArm: { x: 0, y: 0.1, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.3 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: -0.1, z: 0.3 }, RightForeArm: { x: 0, y: -0.05, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.3 } } },
    { time: 0.9, bones: { RightHand: { x: 0, y: 0.15, z: 0.3 }, RightForeArm: { x: 0, y: 0.08, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.3 } } },
    { time: 1.2, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.5 }, RightUpperArm: { x: 0, y: 0, z: 0.3 } } },
  ],
  LOVE: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.3, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0.3, y: 0, z: -0.3 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
    { time: 0.4, bones: { RightHand: { x: 0, y: 0, z: -0.1 }, RightForeArm: { x: 0.3, y: 0, z: 0.1 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: 0.1 }, LeftForeArm: { x: 0.3, y: 0, z: -0.1 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
    { time: 0.8, bones: { RightHand: { x: 0, y: 0, z: -0.1 }, RightForeArm: { x: 0.3, y: 0, z: 0.1 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: 0.1 }, LeftForeArm: { x: 0.3, y: 0, z: -0.1 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
  ],
  SORRY: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0.05, z: 0 }, RightForeArm: { x: 0.2, y: 0.05, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: -0.05, z: 0 }, RightForeArm: { x: 0.2, y: -0.05, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.9, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  SCHOOL: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.6 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.6 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0.1, z: 0 }, RightForeArm: { x: 0, y: 0.05, z: 0.6 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0.1, z: 0 }, LeftForeArm: { x: 0, y: 0.05, z: -0.6 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.6 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.6 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
  ],
  GO: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0, z: 0.4 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0.5 }, RightForeArm: { x: 0, y: 0, z: 0.2 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  COME: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0, z: 0.1 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.2 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  NAME: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0.05, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: -0.05, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  TODAY: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: -0.15, z: 0 }, RightForeArm: { x: 0, y: -0.1, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  TOMORROW: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0.4 }, RightForeArm: { x: 0, y: 0, z: 0.2 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  HAPPY: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0.05, z: 0 }, RightForeArm: { x: 0.2, y: 0.05, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: -0.05, z: 0 }, RightForeArm: { x: 0.2, y: -0.05, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.9, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  SAD: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.4, bones: { RightHand: { x: 0, y: -0.1, z: 0 }, RightForeArm: { x: 0.2, y: -0.05, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.8, bones: { RightHand: { x: 0, y: -0.15, z: 0 }, RightForeArm: { x: 0.2, y: -0.08, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  NEED: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0, z: -0.15 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: -0.2 }, RightForeArm: { x: 0, y: 0, z: 0.25 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  KNOW: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0.1, z: 0.1 }, RightForeArm: { x: 0, y: 0.05, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0.1, z: 0.1 }, RightForeArm: { x: 0, y: 0.05, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  WANT: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0, z: -0.15 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: -0.2 }, RightForeArm: { x: 0, y: 0, z: 0.25 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  LIKE: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0, z: 0.15 }, RightForeArm: { x: 0.2, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0.2 }, RightForeArm: { x: 0.2, y: 0, z: 0.35 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  WATER: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0.1, z: 0.1 }, RightForeArm: { x: 0, y: 0.05, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  FOOD: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0.1, z: 0 }, RightForeArm: { x: 0.2, y: 0.05, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  EAT: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0.15, z: 0 }, RightForeArm: { x: 0.2, y: 0.08, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.3 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  DRINK: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.1, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0.1, z: 0.05 }, RightForeArm: { x: 0.1, y: 0.05, z: 0.35 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.1, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 } } },
  ],
  FRIEND: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.4 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
    { time: 0.3, bones: { RightHand: { x: -0.1, y: 0, z: 0 }, RightForeArm: { x: -0.05, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0.1, y: 0, z: 0 }, LeftForeArm: { x: 0.05, y: 0, z: -0.4 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.4 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
  ],
  FAMILY: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.4 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: 0, z: 0.15 }, RightForeArm: { x: 0, y: 0, z: 0.35 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: -0.15 }, LeftForeArm: { x: 0, y: 0, z: -0.35 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.4 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
  ],
  WORK: [
    { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.4 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
    { time: 0.3, bones: { RightHand: { x: 0, y: -0.1, z: 0 }, RightForeArm: { x: 0, y: -0.05, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: -0.1, z: 0 }, LeftForeArm: { x: 0, y: -0.05, z: -0.4 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
    { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, RightUpperArm: { x: 0, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.4 }, LeftUpperArm: { x: 0, y: 0, z: -0.1 } } },
  ],
};

const DEFAULT_POSE: SignKeyframe = {
  time: 0,
  bones: {
    RightHand: { x: 0, y: 0, z: 0 },
    RightForeArm: { x: 0, y: 0, z: 0.3 },
    RightUpperArm: { x: 0, y: 0, z: 0.1 },
    LeftHand: { x: 0, y: 0, z: 0 },
    LeftForeArm: { x: 0, y: 0, z: -0.3 },
    LeftUpperArm: { x: 0, y: 0, z: -0.1 },
  },
};

export class ProceduralAnimator {
  private root: THREE.Object3D | null = null;
  private boneMap = new Map<string, THREE.Bone>();
  private queue: string[] = [];
  private currentIndex = -1;
  private currentSign = '';
  private currentKeyframes: SignKeyframe[] = [];
  private animTime = 0;
  private totalDuration = 0;
  private isPlaying = false;
  private isPaused = false;
  private transitionProgress = 1;
  private prevPose: Record<string, { x: number; y: number; z: number }> = {};
  private blendDuration = 0.25;
  private onSignChange?: (sign: string) => void;
  private onQueueComplete?: () => void;

  constructor(root: THREE.Object3D) {
    this.root = root;
    root.traverse((child) => {
      if (child instanceof THREE.Bone) {
        const name = child.name.toLowerCase();
        if (name.includes('righthand') || name === 'handr' || name === 'right_hand') {
          this.boneMap.set('RightHand', child);
        } else if (name.includes('rightforearm') || name === 'lowerarmr' || name === 'right_forearm') {
          this.boneMap.set('RightForeArm', child);
        } else if (name.includes('rightupperarm') || name === 'upperarmr' || name === 'right_upperarm') {
          this.boneMap.set('RightUpperArm', child);
        } else if (name.includes('lefthand') || name === 'handl' || name === 'left_hand') {
          this.boneMap.set('LeftHand', child);
        } else if (name.includes('leftforearm') || name === 'lowerarml' || name === 'left_forearm') {
          this.boneMap.set('LeftForeArm', child);
        } else if (name.includes('leftupperarm') || name === 'upperarml' || name === 'left_upperarm') {
          this.boneMap.set('LeftUpperArm', child);
        } else if (name.includes('spine')) {
          this.boneMap.set('Spine', child);
        } else if (name.includes('neck') || name === 'head') {
          this.boneMap.set('Head', child);
        }
      }
    });
  }

  setCallbacks(onSignChange?: (sign: string) => void, onQueueComplete?: () => void) {
    this.onSignChange = onSignChange;
    this.onQueueComplete = onQueueComplete;
  }

  setQueue(signs: string[]) {
    this.queue = signs.map((s) => s.toUpperCase());
    this.currentIndex = -1;
  }

  play() {
    if (this.queue.length === 0) return;
    this.currentIndex = 0;
    this.isPlaying = true;
    this.isPaused = false;
    this.startSign(this.queue[0]);
  }

  private startSign(sign: string) {
    this.currentSign = sign;
    this.currentKeyframes = BONE_POSES[sign] || this.generateDefaultKeyframes();
    this.totalDuration = this.currentKeyframes[this.currentKeyframes.length - 1].time;
    this.animTime = 0;
    this.transitionProgress = 0;
    this.saveCurrentPose();
    this.onSignChange?.(sign);
  }

  private generateDefaultKeyframes(): SignKeyframe[] {
    return [
      { ...DEFAULT_POSE, time: 0 },
      { time: 0.3, bones: { ...DEFAULT_POSE.bones, RightHand: { x: 0.1, y: 0, z: 0 } } },
      { time: 0.6, bones: { ...DEFAULT_POSE.bones, RightHand: { x: 0, y: 0.1, z: 0 } } },
      { time: 0.9, bones: { ...DEFAULT_POSE.bones, RightHand: { x: 0, y: 0, z: 0 } } },
    ];
  }

  private saveCurrentPose() {
    this.prevPose = {};
    for (const [boneName, bone] of this.boneMap) {
      this.prevPose[boneName] = { x: bone.rotation.x, y: bone.rotation.y, z: bone.rotation.z };
    }
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  private interpolatePose(time: number): Record<string, { x: number; y: number; z: number }> {
    const kfs = this.currentKeyframes;
    if (kfs.length === 0) return {};

    let prev = kfs[0];
    let next = kfs[kfs.length - 1];

    for (let i = 0; i < kfs.length - 1; i++) {
      if (time >= kfs[i].time && time <= kfs[i + 1].time) {
        prev = kfs[i];
        next = kfs[i + 1];
        break;
      }
    }

    const range = next.time - prev.time;
    const t = range > 0 ? (time - prev.time) / range : 0;
    const eased = this.easeInOut(t);

    const result: Record<string, { x: number; y: number; z: number }> = {};
    const allBones = new Set([...Object.keys(prev.bones), ...Object.keys(next.bones)]);

    for (const boneName of allBones) {
      const a = prev.bones[boneName] || { x: 0, y: 0, z: 0 };
      const b = next.bones[boneName] || { x: 0, y: 0, z: 0 };
      result[boneName] = {
        x: this.lerp(a.x, b.x, eased),
        y: this.lerp(a.y, b.y, eased),
        z: this.lerp(a.z, b.z, eased),
      };
    }

    return result;
  }

  update(delta: number) {
    if (!this.isPlaying || this.isPaused) return;

    this.animTime += delta;

    if (this.animTime >= this.totalDuration + 0.3) {
      this.currentIndex++;
      if (this.currentIndex >= this.queue.length) {
        this.isPlaying = false;
        this.returnToIdle();
        this.onQueueComplete?.();
        return;
      }
      this.startSign(this.queue[this.currentIndex]);
    }

    const pose = this.interpolatePose(Math.min(this.animTime, this.totalDuration));

    if (this.transitionProgress < 1) {
      this.transitionProgress = Math.min(1, this.transitionProgress + delta / this.blendDuration);
      const blend = this.easeInOut(this.transitionProgress);

      for (const [boneName, bone] of this.boneMap) {
        const target = pose[boneName];
        const prev = this.prevPose[boneName];
        if (target && prev) {
          bone.rotation.x = this.lerp(prev.x, target.x, blend);
          bone.rotation.y = this.lerp(prev.y, target.y, blend);
          bone.rotation.z = this.lerp(prev.z, target.z, blend);
        } else if (target) {
          bone.rotation.x = target.x;
          bone.rotation.y = target.y;
          bone.rotation.z = target.z;
        }
      }
    } else {
      for (const [boneName, bone] of this.boneMap) {
        const target = pose[boneName];
        if (target) {
          bone.rotation.x = target.x;
          bone.rotation.y = target.y;
          bone.rotation.z = target.z;
        }
      }
    }
  }

  private returnToIdle() {
    this.saveCurrentPose();
    this.transitionProgress = 0;
    this.currentKeyframes = [
      { ...DEFAULT_POSE, time: 0 },
      { time: 0.5, bones: DEFAULT_POSE.bones },
    ];
    this.totalDuration = 0.5;
    this.animTime = 0;
    this.isPlaying = false;
  }

  pause() { this.isPaused = true; }
  resume() { this.isPaused = false; }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.queue = [];
    this.currentIndex = -1;
    this.returnToIdle();
  }

  getState() {
    return this.isPlaying ? (this.isPaused ? 'paused' : 'playing') : 'idle';
  }

  getCurrentSign() { return this.currentSign; }
  getProgress() { return this.queue.length === 0 ? 0 : (this.currentIndex + 1) / this.queue.length; }
  getQueueLength() { return this.queue.length; }
}
