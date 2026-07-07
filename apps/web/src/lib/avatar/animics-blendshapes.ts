'use client';

import * as THREE from 'three';

// Extracted from Animics blendshapes.js — ARKit blendshape mapping
// https://github.com/upf-gti/animics

// MediaPipe face landmarks → ARKit blendshape mapping (from Animics mapnames.json)
export const ARKIT_BLENDSHAPES = [
  'eyeBlinkLeft', 'eyeBlinkRight',
  'eyeLookDownLeft', 'eyeLookDownRight',
  'eyeLookInLeft', 'eyeLookInRight',
  'eyeLookOutLeft', 'eyeLookOutRight',
  'eyeLookUpLeft', 'eyeLookUpRight',
  'eyeSquintLeft', 'eyeSquintRight',
  'eyeWideLeft', 'eyeWideRight',
  'jawForward', 'jawLeft', 'jawRight', 'jawOpen',
  'mouthClose',
  'mouthFunnel', 'mouthPucker',
  'mouthLeft', 'mouthRight',
  'mouthSmileLeft', 'mouthSmileRight',
  'mouthFrownLeft', 'mouthFrownRight',
  'mouthDimpleLeft', 'mouthDimpleRight',
  'mouthStretchLeft', 'mouthStretchRight',
  'mouthRollLower', 'mouthRollUpper',
  'mouthShrugLower', 'mouthShrugUpper',
  'mouthPressLeft', 'mouthPressRight',
  'mouthLowerDownLeft', 'mouthLowerDownRight',
  'mouthUpperUpLeft', 'mouthUpperUpRight',
  'browDownLeft', 'browDownRight',
  'browInnerUp',
  'browOuterUpLeft', 'browOuterUpRight',
  'cheekPuff',
  'cheekSquintLeft', 'cheekSquintRight',
  'noseSneerLeft', 'noseSneerRight',
  'tongueOut',
];

export class BlendshapeManager {
  private meshes: THREE.Mesh[] = [];
  private dictionaries: Map<THREE.Mesh, Record<string, number>> = new Map();

  constructor(scene: THREE.Object3D) {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.morphTargetDictionary) {
        this.meshes.push(child);
        this.dictionaries.set(child, child.morphTargetDictionary as Record<string, number>);
      }
    });
  }

  get hasBlendshapes(): boolean {
    return this.meshes.length > 0;
  }

  getAvailableBlendshapes(): string[] {
    if (this.meshes.length === 0) return [];
    return Object.keys(this.dictionaries.get(this.meshes[0]) || {});
  }

  setBlendshape(name: string, value: number) {
    for (const mesh of this.meshes) {
      const dict = this.dictionaries.get(mesh);
      if (dict && dict[name] !== undefined && mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[dict[name]] = Math.max(0, Math.min(1, value));
      }
    }
  }

  setBlendshapes(values: Record<string, number>) {
    for (const [name, value] of Object.entries(values)) {
      this.setBlendshape(name, value);
    }
  }

  reset() {
    for (const mesh of this.meshes) {
      if (mesh.morphTargetInfluences) {
        for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
          mesh.morphTargetInfluences[i] = 0;
        }
      }
    }
  }

  // Apply expression preset
  applyExpression(expression: string) {
    this.reset();
    const expressions: Record<string, Record<string, number>> = {
      happy: {
        mouthSmileLeft: 0.8,
        mouthSmileRight: 0.8,
        cheekSquintLeft: 0.4,
        cheekSquintRight: 0.4,
        browInnerUp: 0.3,
      },
      sad: {
        mouthFrownLeft: 0.6,
        mouthFrownRight: 0.6,
        browDownLeft: 0.4,
        browDownRight: 0.4,
        innerBrowRaiser: 0.5,
      },
      surprised: {
        eyeWideLeft: 0.8,
        eyeWideRight: 0.8,
        jawOpen: 0.5,
        browInnerUp: 0.7,
        browOuterUpLeft: 0.6,
        browOuterUpRight: 0.6,
      },
      angry: {
        browDownLeft: 0.8,
        browDownRight: 0.8,
        jawForward: 0.3,
        mouthFrownLeft: 0.4,
        mouthFrownRight: 0.4,
      },
      neutral: {},
    };

    const data = expressions[expression] || {};
    this.setBlendshapes(data);
  }
}

// Non-manual features for sign language (from Animics BML)
export interface NonManualFeature {
  mouthShape?: string;
  eyebrowPosition?: string;
  headTilt?: { x: number; y: number; z: number };
  gazeDirection?: { x: number; y: number };
  duration: number;
}

// Common mouth shapes for sign language
export const MOUTH_SHAPES: Record<string, Record<string, number>> = {
  mm: { mouthClose: 0.8, mouthPucker: 0.3 },
  oo: { mouthFunnel: 0.7, jawOpen: 0.2 },
  ee: { mouthStretchLeft: 0.5, mouthStretchRight: 0.5, mouthDimpleLeft: 0.3, mouthDimpleRight: 0.3 },
  ah: { jawOpen: 0.6, mouthUpperUpLeft: 0.2, mouthUpperUpRight: 0.2 },
  oh: { jawOpen: 0.4, mouthFunnel: 0.5 },
  pp: { mouthPressLeft: 0.5, mouthPressRight: 0.5, mouthClose: 0.3 },
  ff: { mouthRollLower: 0.6, mouthRollUpper: 0.4 },
  smile: { mouthSmileLeft: 0.7, mouthSmileRight: 0.7 },
  frown: { mouthFrownLeft: 0.5, mouthFrownRight: 0.5 },
};

export function applyNonManualFeature(blendshapes: BlendshapeManager, feature: NonManualFeature) {
  if (feature.mouthShape) {
    const shape = MOUTH_SHAPES[feature.mouthShape];
    if (shape) blendshapes.setBlendshapes(shape);
  }
  if (feature.eyebrowPosition === 'up') {
    blendshapes.setBlendshape('browInnerUp', 0.6);
    blendshapes.setBlendshape('browOuterUpLeft', 0.5);
    blendshapes.setBlendshape('browOuterUpRight', 0.5);
  } else if (feature.eyebrowPosition === 'down') {
    blendshapes.setBlendshape('browDownLeft', 0.5);
    blendshapes.setBlendshape('browDownRight', 0.5);
  }
}
