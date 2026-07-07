'use client';

import * as THREE from 'three';

// Extracted from Animics skeleton.js — Mixamo bone mapping
// https://github.com/upf-gti/animics

export interface BoneInfo {
  idx: number;
  name: string;
  parentIdx: number;
  childrenNames: string[];
}

// Mixamo-compatible bone names (from Animics LM_INFO)
export const MIXAMO_BONES: Record<string, BoneInfo> = {
  Hips:             { idx: 33, name: 'mixamorigHips',            parentIdx: -1, childrenNames: ['RightUpLeg', 'LeftUpLeg'] },
  Spine:            { idx: 35, name: 'mixamorigSpine',           parentIdx: 33, childrenNames: ['Spine1'] },
  Spine1:           { idx: 36, name: 'mixamorigSpine1',          parentIdx: 35, childrenNames: ['Spine2'] },
  Spine2:           { idx: 37, name: 'mixamorigSpine2',          parentIdx: 36, childrenNames: ['Neck'] },
  Neck:             { idx: 38, name: 'mixamorigNeck',            parentIdx: 37, childrenNames: ['Head'] },
  Head:             { idx: 0,  name: 'mixamorigHead',            parentIdx: 38, childrenNames: [] },

  RightShoulder:    { idx: 73, name: 'mixamorigRightShoulder',   parentIdx: 37, childrenNames: ['RightArm'] },
  RightArm:         { idx: 12, name: 'mixamorigRightArm',        parentIdx: 73, childrenNames: ['RightForeArm'] },
  RightForeArm:     { idx: 14, name: 'mixamorigRightForeArm',    parentIdx: 12, childrenNames: ['RightHand'] },
  RightHand:        { idx: 16, name: 'mixamorigRightHand',       parentIdx: 14, childrenNames: [] },

  LeftShoulder:     { idx: 74, name: 'mixamorigLeftShoulder',    parentIdx: 37, childrenNames: ['LeftArm'] },
  LeftArm:          { idx: 11, name: 'mixamorigLeftArm',         parentIdx: 74, childrenNames: ['LeftForeArm'] },
  LeftForeArm:      { idx: 13, name: 'mixamorigLeftForeArm',     parentIdx: 11, childrenNames: ['LeftHand'] },
  LeftHand:         { idx: 15, name: 'mixamorigLeftHand',        parentIdx: 13, childrenNames: [] },

  RightUpLeg:       { idx: 24, name: 'mixamorigRightUpLeg',      parentIdx: 33, childrenNames: ['RightLeg'] },
  RightLeg:         { idx: 26, name: 'mixamorigRightLeg',        parentIdx: 24, childrenNames: ['RightFoot'] },
  RightFoot:        { idx: 28, name: 'mixamorigRightFoot',       parentIdx: 26, childrenNames: ['RightToeBase'] },

  LeftUpLeg:        { idx: 23, name: 'mixamorigLeftUpLeg',       parentIdx: 33, childrenNames: ['LeftLeg'] },
  LeftLeg:          { idx: 25, name: 'mixamorigLeftLeg',         parentIdx: 23, childrenNames: ['LeftFoot'] },
  LeftFoot:         { idx: 27, name: 'mixamorigLeftFoot',        parentIdx: 25, childrenNames: ['LeftToeBase'] },
};

// Finger bones (from Animics)
export const FINGER_BONES: Record<string, string[]> = {
  LeftHandThumb:  ['mixamorigLeftHandThumb1', 'mixamorigLeftHandThumb2', 'mixamorigLeftHandThumb3', 'mixamorigLeftHandThumb4'],
  LeftHandIndex:  ['mixamorigLeftHandIndex1', 'mixamorigLeftHandIndex2', 'mixamorigLeftHandIndex3', 'mixamorigLeftHandIndex4'],
  LeftHandMiddle: ['mixamorigLeftHandMiddle1', 'mixamorigLeftHandMiddle2', 'mixamorigLeftHandMiddle3', 'mixamorigLeftHandMiddle4'],
  LeftHandRing:   ['mixamorigLeftHandRing1', 'mixamorigLeftHandRing2', 'mixamorigLeftHandRing3', 'mixamorigLeftHandRing4'],
  LeftHandPinky:  ['mixamorigLeftHandPinky1', 'mixamorigLeftHandPinky2', 'mixamorigLeftHandPinky3', 'mixamorigLeftHandPinky4'],

  RightHandThumb:  ['mixamorigRightHandThumb1', 'mixamorigRightHandThumb2', 'mixamorigRightHandThumb3', 'mixamorigRightHandThumb4'],
  RightHandIndex:  ['mixamorigRightHandIndex1', 'mixamorigRightHandIndex2', 'mixamorigRightHandIndex3', 'mixamorigRightHandIndex4'],
  RightHandMiddle: ['mixamorigRightHandMiddle1', 'mixamorigRightHandMiddle2', 'mixamorigRightHandMiddle3', 'mixamorigRightHandMiddle4'],
  RightHandRing:   ['mixamorigRightHandRing1', 'mixamorigRightHandRing2', 'mixamorigRightHandRing3', 'mixamorigRightHandRing4'],
  RightHandPinky:  ['mixamorigRightHandPinky1', 'mixamorigRightHandPinky2', 'mixamorigRightHandPinky3', 'mixamorigRightHandPinky4'],
};

// Friendly name → Mixamo name mapping
export const FRIENDLY_TO_MIXAMO: Record<string, string> = {
  'RightHand': 'mixamorigRightHand',
  'RightForeArm': 'mixamorigRightForeArm',
  'RightUpperArm': 'mixamorigRightArm',
  'LeftHand': 'mixamorigLeftHand',
  'LeftForeArm': 'mixamorigLeftForeArm',
  'LeftUpperArm': 'mixamorigLeftArm',
  'Spine': 'mixamorigSpine',
  'Head': 'mixamorigHead',
  'Neck': 'mixamorigNeck',
  'Hips': 'mixamorigHips',
  'RightUpLeg': 'mixamorigRightUpLeg',
  'RightLeg': 'mixamorigRightLeg',
  'LeftUpLeg': 'mixamorigLeftUpLeg',
  'LeftLeg': 'mixamorigLeftLeg',
};

export function findMixamoBone(root: THREE.Object3D, friendlyName: string): THREE.Object3D | null {
  const mixamoName = FRIENDLY_TO_MIXAMO[friendlyName] || friendlyName;
  let found: THREE.Object3D | null = null;
  root.traverse((child) => {
    if (child.name === mixamoName || child.name.includes(friendlyName) || child.name.includes(mixamoName.replace('mixamorig', ''))) {
      found = child;
    }
  });
  return found;
}

export function buildBoneMap(root: THREE.Object3D): Map<string, THREE.Object3D> {
  const map = new Map<string, THREE.Object3D>();
  for (const friendlyName of Object.keys(FRIENDLY_TO_MIXAMO)) {
    const bone = findMixamoBone(root, friendlyName);
    if (bone) map.set(friendlyName, bone);
  }
  // Also find finger bones
  for (const [group, names] of Object.entries(FINGER_BONES)) {
    for (const name of names) {
      root.traverse((child) => {
        if (child.name === name) {
          map.set(name, child);
        }
      });
    }
  }
  return map;
}

export function printBoneHierarchy(root: THREE.Object3D): string[] {
  const bones: string[] = [];
  root.traverse((child) => {
    if (child instanceof THREE.Bone || child.name.includes('mixamorig')) {
      bones.push(`${child.name} (parent: ${child.parent?.name || 'root'})`);
    }
  });
  return bones;
}
