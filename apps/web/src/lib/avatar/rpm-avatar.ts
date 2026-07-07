'use client';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface AvatarConfig {
  id: string;
  url: string;
  gender: 'male' | 'female';
  skinTone: string;
  label: string;
}

export const DEFAULT_AVATARS: AvatarConfig[] = [
  {
    id: 'arabic-lady',
    url: '/models/arabic-lady.glb',
    gender: 'female',
    skinTone: '#e8c39e',
    label: 'Arabic Lady',
  },
  {
    id: 'xbot',
    url: '/models/xbot.glb',
    gender: 'male',
    skinTone: '#8d5524',
    label: 'X Bot (Mixamo)',
  },
  {
    id: 'soldier',
    url: '/models/soldier.glb',
    gender: 'male',
    skinTone: '#c68642',
    label: 'Soldier (Mixamo)',
  },
];

const RPM_BASE_URL = 'https://models.readyplayer.me';

export function getAvatarUrl(avatarId: string, options?: {
  textureAtlas?: '128' | '256' | '512' | '1024';
  textureFormat?: 'png' | 'jpeg';
  pose?: 'A' | 'T' | '放松';
}): string {
  const params = new URLSearchParams();
  if (options?.textureAtlas) params.set('textureAtlas', options.textureAtlas);
  if (options?.textureFormat) params.set('textureFormat', options.textureFormat);
  if (options?.pose) params.set('pose', options.pose);
  const qs = params.toString();
  return `${RPM_BASE_URL}/${avatarId}.glb${qs ? '?' + qs : ''}`;
}

export async function loadAvatarGLB(
  url: string,
  onProgress?: (progress: number) => void,
): Promise<{
  scene: THREE.Group;
  mixer: THREE.AnimationMixer;
  clips: THREE.AnimationClip[];
  morphTargetDictionary: Map<string, THREE.Object3D>;
}> {
  const loader = new GLTFLoader();

  const gltf = await new Promise<any>((resolve, reject) => {
    loader.load(
      url,
      resolve,
      (progress) => {
        if (progress.total > 0) {
          onProgress?.(progress.loaded / progress.total);
        }
      },
      reject,
    );
  });

  const morphTargetDictionary = new Map<string, THREE.Object3D>();

  gltf.scene.traverse((child: THREE.Object3D) => {
    if (
      child instanceof THREE.Mesh &&
      child.morphTargetDictionary
    ) {
      morphTargetDictionary.set(child.name, child);
    }
  });

  return {
    scene: gltf.scene,
    mixer: new THREE.AnimationMixer(gltf.scene),
    clips: gltf.animations || [],
    morphTargetDictionary,
  };
}

export function printSkeletonierarchy(root: THREE.Object3D): string[] {
  const bones: string[] = [];
  root.traverse((child) => {
    if (child instanceof THREE.Bone) {
      bones.push(child.name);
    }
  });
  return bones;
}

export function findBone(root: THREE.Object3D, name: string): THREE.Object3D | null {
  let found: THREE.Object3D | null = null;
  root.traverse((child) => {
    if (child.name.toLowerCase() === name.toLowerCase() || child.name.includes(name)) {
      found = child;
    }
  });
  return found;
}

export function findMeshWithMorphTargets(root: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  root.traverse((child) => {
    if (child instanceof THREE.Mesh && child.morphTargetDictionary) {
      meshes.push(child);
    }
  });
  return meshes;
}
