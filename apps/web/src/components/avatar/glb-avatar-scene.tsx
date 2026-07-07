'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  loadAvatarGLB,
  findBone,
  findMeshWithMorphTargets,
  type AvatarConfig,
  DEFAULT_AVATARS,
} from '@/lib/avatar/rpm-avatar';
import { BlendshapeManager } from '@/lib/avatar/animics-blendshapes';
import { buildBoneMap, findMixamoBone } from '@/lib/avatar/animics-skeleton';
import { ESL_SIGNS, FINGERSPELLING, type SignEntry } from '@/lib/avatar/esl-sign-database';

// Updated bone map — uses Animics-style mapping with multiple naming conventions
const MIXAMO_BONE_MAP: Record<string, string[]> = {
  RightHand: ['mixamorigRightHand', 'RightHand', 'hand_r'],
  RightForeArm: ['mixamorigRightForeArm', 'RightForeArm', 'lowerarm_r'],
  RightUpperArm: ['mixamorigRightArm', 'RightUpperArm', 'upperarm_r'],
  LeftHand: ['mixamorigLeftHand', 'LeftHand', 'hand_l'],
  LeftForeArm: ['mixamorigLeftForeArm', 'LeftForeArm', 'lowerarm_l'],
  LeftUpperArm: ['mixamorigLeftArm', 'LeftUpperArm', 'upperarm_l'],
  Spine: ['mixamorigSpine', 'Spine', 'spine'],
  Spine1: ['mixamorigSpine1', 'Spine1'],
  Spine2: ['mixamorigSpine2', 'Spine2'],
  Head: ['mixamorigHead', 'Head', 'head'],
  Neck: ['mixamorigNeck', 'Neck'],
  Hips: ['mixamorigHips', 'Hips', 'hips'],
  RightShoulder: ['mixamorigRightShoulder', 'RightShoulder'],
  LeftShoulder: ['mixamorigLeftShoulder', 'LeftShoulder'],
  RightUpLeg: ['mixamorigRightUpLeg', 'RightUpLeg', 'upleg_r'],
  RightLeg: ['mixamorigRightLeg', 'RightLeg', 'leg_r'],
  RightFoot: ['mixamorigRightFoot', 'RightFoot', 'foot_r'],
  LeftUpLeg: ['mixamorigLeftUpLeg', 'LeftUpLeg', 'upleg_l'],
  LeftLeg: ['mixamorigLeftLeg', 'LeftLeg', 'leg_l'],
  LeftFoot: ['mixamorigLeftFoot', 'LeftFoot', 'foot_l'],
  
  // Right Fingers
  RightHandThumb1: ['mixamorigRightHandThumb1', 'RightHandThumb1', 'thumb_01_r'],
  RightHandThumb2: ['mixamorigRightHandThumb2', 'RightHandThumb2', 'thumb_02_r'],
  RightHandThumb3: ['mixamorigRightHandThumb3', 'RightHandThumb3', 'thumb_03_r'],
  RightHandIndex1: ['mixamorigRightHandIndex1', 'RightHandIndex1', 'index_01_r'],
  RightHandIndex2: ['mixamorigRightHandIndex2', 'RightHandIndex2', 'index_02_r'],
  RightHandIndex3: ['mixamorigRightHandIndex3', 'RightHandIndex3', 'index_03_r'],
  RightHandMiddle1: ['mixamorigRightHandMiddle1', 'RightHandMiddle1', 'middle_01_r'],
  RightHandMiddle2: ['mixamorigRightHandMiddle2', 'RightHandMiddle2', 'middle_02_r'],
  RightHandMiddle3: ['mixamorigRightHandMiddle3', 'RightHandMiddle3', 'middle_03_r'],
  RightHandRing1: ['mixamorigRightHandRing1', 'RightHandRing1', 'ring_01_r'],
  RightHandRing2: ['mixamorigRightHandRing2', 'RightHandRing2', 'ring_02_r'],
  RightHandRing3: ['mixamorigRightHandRing3', 'RightHandRing3', 'ring_03_r'],
  RightHandPinky1: ['mixamorigRightHandPinky1', 'RightHandPinky1', 'pinky_01_r'],
  RightHandPinky2: ['mixamorigRightHandPinky2', 'RightHandPinky2', 'pinky_02_r'],
  RightHandPinky3: ['mixamorigRightHandPinky3', 'RightHandPinky3', 'pinky_03_r'],
  
  // Left Fingers
  LeftHandThumb1: ['mixamorigLeftHandThumb1', 'LeftHandThumb1', 'thumb_01_l'],
  LeftHandThumb2: ['mixamorigLeftHandThumb2', 'LeftHandThumb2', 'thumb_02_l'],
  LeftHandThumb3: ['mixamorigLeftHandThumb3', 'LeftHandThumb3', 'thumb_03_l'],
  LeftHandIndex1: ['mixamorigLeftHandIndex1', 'LeftHandIndex1', 'index_01_l'],
  LeftHandIndex2: ['mixamorigLeftHandIndex2', 'LeftHandIndex2', 'index_02_l'],
  LeftHandIndex3: ['mixamorigLeftHandIndex3', 'LeftHandIndex3', 'index_03_l'],
  LeftHandMiddle1: ['mixamorigLeftHandMiddle1', 'LeftHandMiddle1', 'middle_01_l'],
  LeftHandMiddle2: ['mixamorigLeftHandMiddle2', 'LeftHandMiddle2', 'middle_02_l'],
  LeftHandMiddle3: ['mixamorigLeftHandMiddle3', 'LeftHandMiddle3', 'middle_03_l'],
  LeftHandRing1: ['mixamorigLeftHandRing1', 'LeftHandRing1', 'ring_01_l'],
  LeftHandRing2: ['mixamorigLeftHandRing2', 'LeftHandRing2', 'ring_02_l'],
  LeftHandRing3: ['mixamorigLeftHandRing3', 'LeftHandRing3', 'ring_03_l'],
  LeftHandPinky1: ['mixamorigLeftHandPinky1', 'LeftHandPinky1', 'pinky_01_l'],
  LeftHandPinky2: ['mixamorigLeftHandPinky2', 'LeftHandPinky2', 'pinky_02_l'],
  LeftHandPinky3: ['mixamorigLeftHandPinky3', 'LeftHandPinky3', 'pinky_03_l'],
};

function findBoneFlexible(root: THREE.Object3D, names: string[]): THREE.Object3D | null {
  for (const name of names) {
    const bone = findBone(root, name);
    if (bone) return bone;
  }
  return null;
}

function AvatarGLBScene({
  avatarConfig,
  signs,
  autoPlay,
  onAnimationStateChange,
  onQueueComplete,
  onAvatarLoaded,
}: {
  avatarConfig: AvatarConfig;
  signs: string[];
  autoPlay: boolean;
  onAnimationStateChange?: (state: string, token: string) => void;
  onQueueComplete?: () => void;
  onAvatarLoaded?: (info: { boneCount: number; hasMorphTargets: boolean; clipNames: string[] }) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useThree();
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const avatarRef = useRef<THREE.Group | null>(null);
  const boneMapRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const morphMeshesRef = useRef<THREE.Mesh[]>([]);
  const blendshapeManagerRef = useRef<BlendshapeManager | null>(null);
  const queueRef = useRef<string[]>([]);
  const currentIndexRef = useRef(-1);
  const isPlayingRef = useRef(false);
  const animTimeRef = useRef(0);
  const totalDurationRef = useRef(0);
  const currentKeyframesRef = useRef<any[]>([]);
  const prevPoseRef = useRef<Record<string, { x: number; y: number; z: number }>>({});
  const transitionProgressRef = useRef(1);
  const blinkTimerRef = useRef(0);
  const nextBlinkRef = useRef(2 + Math.random() * 4);
  const isBlinkingRef = useRef(false);
  const breathTimerRef = useRef(0);
  const idleTimerRef = useRef(0);
  const headTurnTimerRef = useRef(0);
  const headTurnDirRef = useRef(1);

  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        console.log('Loading avatar from:', avatarConfig.url);
        const { scene: avatarScene, mixer, clips } = await loadAvatarGLB(avatarConfig.url);

        if (cancelled) return;

        // Auto-scale and center the avatar in case it's not a standard scale
        const box = new THREE.Box3().setFromObject(avatarScene);
        const size = box.getSize(new THREE.Vector3());
        
        if (size.y > 0) {
          const scale = 1.6 / size.y; // Target height of 1.6 units (meters)
          avatarScene.scale.setScalar(scale);
          avatarScene.updateMatrixWorld(true);
          
          // Recompute box after scaling to position correctly
          const scaledBox = new THREE.Box3().setFromObject(avatarScene);
          const center = scaledBox.getCenter(new THREE.Vector3());
          
          avatarScene.position.set(-center.x, -scaledBox.min.y, -center.z);
        } else {
          avatarScene.scale.setScalar(1);
          avatarScene.position.set(0, 0, 0);
        }
        
        if (avatarRef.current) {
          groupRef.current?.remove(avatarRef.current);
        }
        groupRef.current?.add(avatarScene);
        avatarRef.current = avatarScene;
        mixerRef.current = mixer;

        const boneMap = new Map<string, THREE.Object3D>();
        for (const [slot, names] of Object.entries(MIXAMO_BONE_MAP)) {
          const bone = findBoneFlexible(avatarScene, names);
          if (bone) boneMap.set(slot, bone);
        }
        boneMapRef.current = boneMap;

        const morphMeshes = findMeshWithMorphTargets(avatarScene);
        morphMeshesRef.current = morphMeshes;

        // Initialize Animics blendshape manager
        const bsManager = new BlendshapeManager(avatarScene);
        blendshapeManagerRef.current = bsManager;

        const boneCount = Array.from(boneMap.values()).length;
        const hasMorph = morphMeshes.length > 0;
        const clipNames = clips.map((c) => c.name);

        onAvatarLoaded?.({ boneCount, hasMorphTargets: hasMorph, clipNames });
        setLoaded(true);
      } catch (err: any) {
        console.error('Failed to load avatar GLB:', err);
        setLoadError(err.message || String(err));
      }
    };

    load();
    return () => {
      cancelled = true;
      if (avatarRef.current && groupRef.current) {
        groupRef.current.remove(avatarRef.current);
      }
    };
  }, [avatarConfig.url]);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  const getHandshapeBones = (shape: string, side: 'Right' | 'Left') => {
    const bones: Record<string, {x: number, y: number, z: number}> = {};
    const sign = side === 'Right' ? 1 : -1;
    
    // Curl goes mostly on Z axis for standard mixamo rig.
    const setFinger = (finger: string, curl1: number, curl2: number, curl3: number) => {
      bones[`${side}Hand${finger}1`] = { x: 0, y: 0, z: curl1 * sign * 1.5 };
      bones[`${side}Hand${finger}2`] = { x: 0, y: 0, z: curl2 * sign * 1.5 };
      bones[`${side}Hand${finger}3`] = { x: 0, y: 0, z: curl3 * sign * 1.5 };
    };
    
    const setThumb = (curl1: number, curl2: number, spread: number) => {
      bones[`${side}HandThumb1`] = { x: spread * sign * 0.5, y: -spread * sign * 0.5, z: curl1 * sign * 1.0 };
      bones[`${side}HandThumb2`] = { x: 0, y: 0, z: curl2 * sign * 1.0 };
      bones[`${side}HandThumb3`] = { x: 0, y: 0, z: curl2 * sign * 1.0 };
    }

    setFinger('Index', 0, 0, 0);
    setFinger('Middle', 0, 0, 0);
    setFinger('Ring', 0, 0, 0);
    setFinger('Pinky', 0, 0, 0);
    setThumb(0, 0, 0);

    const s = shape.toLowerCase();
    if (s === 'fist' || s === 's' || s === 'a' || s === 'e' || s === 'm' || s === 'n' || s === 't') {
      setFinger('Index', 1, 1, 1);
      setFinger('Middle', 1, 1, 1);
      setFinger('Ring', 1, 1, 1);
      setFinger('Pinky', 1, 1, 1);
      setThumb(0.5, 0.5, 0);
    } else if (s === 'point' || s === 'd' || s === 'g' || s === 'p' || s === 'z') {
      setFinger('Index', 0, 0, 0);
      setFinger('Middle', 1, 1, 1);
      setFinger('Ring', 1, 1, 1);
      setFinger('Pinky', 1, 1, 1);
      setThumb(1, 1, 1);
    } else if (s === 'peace_sign' || s === 'v' || s === 'h' || s === 'k' || s === 'u') {
      setFinger('Index', 0, 0, 0);
      setFinger('Middle', 0, 0, 0);
      setFinger('Ring', 1, 1, 1);
      setFinger('Pinky', 1, 1, 1);
      setThumb(1, 1, 1);
    } else if (s === 'c' || s === 'c_shape' || s === 'o' || s === 'o_shape') {
      setFinger('Index', 0.5, 0.5, 0.5);
      setFinger('Middle', 0.5, 0.5, 0.5);
      setFinger('Ring', 0.5, 0.5, 0.5);
      setFinger('Pinky', 0.5, 0.5, 0.5);
      setThumb(0.5, 0.5, 0.5);
    } else if (s === 'i' || s === 'j' || s === 'pinky_up') {
      setFinger('Index', 1, 1, 1);
      setFinger('Middle', 1, 1, 1);
      setFinger('Ring', 1, 1, 1);
      setFinger('Pinky', 0, 0, 0);
      setThumb(1, 1, 1);
    } else if (s === 'w' || s === 'w_shape' || s === 'f' || s === 'ok_sign') {
      setFinger('Index', 0.8, 0.8, 0.8);
      setFinger('Middle', 0, 0, 0);
      setFinger('Ring', 0, 0, 0);
      setFinger('Pinky', 0, 0, 0);
      setThumb(0.8, 0.8, 0.8);
    } else if (s === 'y' || s === 'phone_sign') {
      setFinger('Index', 1, 1, 1);
      setFinger('Middle', 1, 1, 1);
      setFinger('Ring', 1, 1, 1);
      setFinger('Pinky', 0, 0, 0);
      setThumb(0, 0, 0);
    } else if (s === 'l' || s === 'l_shape') {
      setFinger('Index', 0, 0, 0);
      setFinger('Middle', 1, 1, 1);
      setFinger('Ring', 1, 1, 1);
      setFinger('Pinky', 1, 1, 1);
      setThumb(0, 0, 0);
    }

    return bones;
  };

  const getSignKeyframes = (sign: string): any[] => {
    const S: Record<string, any[]> = {
      HELLO: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.5 } } },
        { time: 0.3, bones: { RightHand: { x: 0, y: 0.2, z: 0.3 }, RightForeArm: { x: 0, y: 0.1, z: 0.5 } } },
        { time: 0.6, bones: { RightHand: { x: 0, y: -0.1, z: 0.3 }, RightForeArm: { x: 0, y: -0.05, z: 0.5 } } },
        { time: 0.9, bones: { RightHand: { x: 0, y: 0.15, z: 0.3 }, RightForeArm: { x: 0, y: 0.08, z: 0.5 } } },
        { time: 1.2, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.5 } } },
      ],
      THANK_YOU: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.8 } } },
        { time: 0.3, bones: { RightHand: { x: 0.1, y: 0, z: -0.2 }, RightForeArm: { x: 0.05, y: 0, z: 0.6 } } },
        { time: 0.6, bones: { RightHand: { x: 0.2, y: 0, z: -0.4 }, RightForeArm: { x: 0.1, y: 0, z: 0.4 } } },
        { time: 1.0, bones: { RightHand: { x: 0.1, y: 0, z: -0.2 }, RightForeArm: { x: 0.05, y: 0, z: 0.6 } } },
      ],
      PLEASE: [
        { time: 0, bones: { RightHand: { x: 0.1, y: 0, z: 0 }, RightForeArm: { x: 0.3, y: 0, z: 0.4 } } },
        { time: 0.4, bones: { RightHand: { x: 0.1, y: 0.05, z: 0 }, RightForeArm: { x: 0.3, y: 0.05, z: 0.4 } } },
        { time: 0.8, bones: { RightHand: { x: 0.1, y: -0.05, z: 0 }, RightForeArm: { x: 0.3, y: -0.05, z: 0.4 } } },
        { time: 1.0, bones: { RightHand: { x: 0.1, y: 0, z: 0 }, RightForeArm: { x: 0.3, y: 0, z: 0.4 } } },
      ],
      YES: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 } } },
        { time: 0.2, bones: { RightHand: { x: 0.15, y: 0, z: 0 }, RightForeArm: { x: 0.1, y: 0, z: 0.3 } } },
        { time: 0.4, bones: { RightHand: { x: -0.1, y: 0, z: 0 }, RightForeArm: { x: -0.05, y: 0, z: 0.3 } } },
        { time: 0.6, bones: { RightHand: { x: 0.15, y: 0, z: 0 }, RightForeArm: { x: 0.1, y: 0, z: 0.3 } } },
        { time: 0.8, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 } } },
      ],
      NO: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 } } },
        { time: 0.2, bones: { RightHand: { x: 0, y: 0.15, z: 0 }, RightForeArm: { x: 0, y: 0.1, z: 0.3 } } },
        { time: 0.4, bones: { RightHand: { x: 0, y: -0.15, z: 0 }, RightForeArm: { x: 0, y: -0.1, z: 0.3 } } },
        { time: 0.6, bones: { RightHand: { x: 0, y: 0.15, z: 0 }, RightForeArm: { x: 0, y: 0.1, z: 0.3 } } },
        { time: 0.8, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 } } },
      ],
      HELP: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.3 } } },
        { time: 0.3, bones: { RightHand: { x: 0, y: -0.2, z: 0.1 }, RightForeArm: { x: 0, y: -0.1, z: 0.3 }, LeftHand: { x: 0, y: -0.2, z: -0.1 }, LeftForeArm: { x: 0, y: -0.1, z: -0.3 } } },
        { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0.1 }, RightForeArm: { x: 0, y: 0, z: 0.3 }, LeftHand: { x: 0, y: 0, z: -0.1 }, LeftForeArm: { x: 0, y: 0, z: -0.3 } } },
      ],
      I: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.3 } } },
        { time: 0.3, bones: { RightHand: { x: 0, y: 0, z: 0.1 }, RightForeArm: { x: 0.2, y: 0, z: 0.3 } } },
        { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0.1 }, RightForeArm: { x: 0.2, y: 0, z: 0.3 } } },
      ],
      YOU: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 } } },
        { time: 0.3, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.4 } } },
        { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.4 } } },
      ],
      WHAT: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.5 } } },
        { time: 0.3, bones: { RightHand: { x: 0.1, y: 0, z: 0 }, RightForeArm: { x: 0.05, y: 0, z: 0.5 } } },
        { time: 0.6, bones: { RightHand: { x: -0.1, y: 0, z: 0 }, RightForeArm: { x: -0.05, y: 0, z: 0.5 } } },
        { time: 0.9, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.5 } } },
      ],
      GOOD: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.5 } } },
        { time: 0.3, bones: { RightHand: { x: 0, y: 0, z: 0.2 }, RightForeArm: { x: 0, y: 0, z: 0.5 } } },
        { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.4 } } },
        { time: 1.0, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.4 } } },
      ],
      GO: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 } } },
        { time: 0.3, bones: { RightHand: { x: 0, y: 0, z: 0.4 }, RightForeArm: { x: 0, y: 0, z: 0.3 } } },
        { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0.5 }, RightForeArm: { x: 0, y: 0, z: 0.2 } } },
      ],
      SCHOOL: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.6 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.6 } } },
        { time: 0.3, bones: { RightHand: { x: 0, y: 0.1, z: 0 }, RightForeArm: { x: 0, y: 0.05, z: 0.6 }, LeftHand: { x: 0, y: 0.1, z: 0 }, LeftForeArm: { x: 0, y: 0.05, z: -0.6 } } },
        { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.6 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.6 } } },
      ],
      LOVE: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.3, y: 0, z: 0.3 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0.3, y: 0, z: -0.3 } } },
        { time: 0.4, bones: { RightHand: { x: 0, y: 0, z: -0.1 }, RightForeArm: { x: 0.3, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: 0.1 }, LeftForeArm: { x: 0.3, y: 0, z: -0.1 } } },
        { time: 0.8, bones: { RightHand: { x: 0, y: 0, z: -0.1 }, RightForeArm: { x: 0.3, y: 0, z: 0.1 }, LeftHand: { x: 0, y: 0, z: 0.1 }, LeftForeArm: { x: 0.3, y: 0, z: -0.1 } } },
      ],
      GOODBYE: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.5 } } },
        { time: 0.3, bones: { RightHand: { x: 0, y: 0.2, z: 0.3 }, RightForeArm: { x: 0, y: 0.1, z: 0.5 } } },
        { time: 0.6, bones: { RightHand: { x: 0, y: -0.1, z: 0.3 }, RightForeArm: { x: 0, y: -0.05, z: 0.5 } } },
        { time: 0.9, bones: { RightHand: { x: 0, y: 0.15, z: 0.3 }, RightForeArm: { x: 0, y: 0.08, z: 0.5 } } },
        { time: 1.2, bones: { RightHand: { x: 0, y: 0, z: 0.3 }, RightForeArm: { x: 0, y: 0, z: 0.5 } } },
      ],
      SORRY: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.3 } } },
        { time: 0.3, bones: { RightHand: { x: 0, y: 0.05, z: 0 }, RightForeArm: { x: 0.2, y: 0.05, z: 0.3 } } },
        { time: 0.6, bones: { RightHand: { x: 0, y: -0.05, z: 0 }, RightForeArm: { x: 0.2, y: -0.05, z: 0.3 } } },
        { time: 0.9, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0.2, y: 0, z: 0.3 } } },
      ],
      FRIEND: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.4 } } },
        { time: 0.3, bones: { RightHand: { x: -0.1, y: 0, z: 0 }, RightForeArm: { x: -0.05, y: 0, z: 0.4 }, LeftHand: { x: 0.1, y: 0, z: 0 }, LeftForeArm: { x: 0.05, y: 0, z: -0.4 } } },
        { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.4 } } },
      ],
      FAMILY: [
        { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.4 } } },
        { time: 0.3, bones: { RightHand: { x: 0, y: 0, z: 0.15 }, RightForeArm: { x: 0, y: 0, z: 0.35 }, LeftHand: { x: 0, y: 0, z: -0.15 }, LeftForeArm: { x: 0, y: 0, z: -0.35 } } },
        { time: 0.6, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.4 }, LeftHand: { x: 0, y: 0, z: 0 }, LeftForeArm: { x: 0, y: 0, z: -0.4 } } },
      ],
    };
    
    let kfs = S[sign];
    
    if (kfs) {
      const eslSign = ESL_SIGNS[sign];
      if (eslSign && eslSign.handshape) {
        const rBones = getHandshapeBones(eslSign.handshape, 'Right');
        const lBones = getHandshapeBones(eslSign.handshape, 'Left');
        // We do a deep clone so we don't mutate the constant arrays
        kfs = kfs.map(kf => ({
          ...kf,
          bones: { ...rBones, ...lBones, ...kf.bones }
        }));
      }
      return kfs;
    }
    
    // Check if it's fingerspelling (single letter)
    if (sign.length === 1 && /[A-Z]/.test(sign)) {
      const fsData = FINGERSPELLING[sign];
      if (fsData) {
        const hBones = getHandshapeBones(fsData.handshape, 'Right');
        return [
          { time: 0, bones: { RightForeArm: { x: 0.2, y: 0, z: 0.4 }, ...hBones } },
          { time: fsData.duration, bones: { RightForeArm: { x: 0.2, y: 0, z: 0.4 }, ...hBones } }
        ];
      }
    }

    return [
      { time: 0, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 } } },
      { time: 0.3, bones: { RightHand: { x: 0.1, y: 0, z: 0 }, RightForeArm: { x: 0.05, y: 0, z: 0.3 } } },
      { time: 0.6, bones: { RightHand: { x: 0, y: 0.1, z: 0 }, RightForeArm: { x: 0, y: 0.05, z: 0.3 } } },
      { time: 0.9, bones: { RightHand: { x: 0, y: 0, z: 0 }, RightForeArm: { x: 0, y: 0, z: 0.3 } } },
    ];
  };

  const startSign = (sign: string) => {
    const kfs = getSignKeyframes(sign);
    currentKeyframesRef.current = kfs;
    totalDurationRef.current = kfs.length > 0 ? kfs[kfs.length - 1].time : 0;
    animTimeRef.current = 0;
    transitionProgressRef.current = 0;
    prevPoseRef.current = {};
    for (const [slot, bone] of boneMapRef.current) {
      prevPoseRef.current[slot] = { x: bone.rotation.x, y: bone.rotation.y, z: bone.rotation.z };
    }
    // Apply non-manual features (facial expressions) from ESL database
    const dbSign = ESL_SIGNS[sign];
    if (dbSign?.nonManual && blendshapeManagerRef.current) {
      blendshapeManagerRef.current.applyExpression(dbSign.nonManual);
    }
    onAnimationStateChange?.('playing', sign);
  };

  const interpolatePose = (time: number) => {
    const kfs = currentKeyframesRef.current;
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
    const eased = easeInOut(t);
    const result: Record<string, { x: number; y: number; z: number }> = {};
    const allBones = new Set([...Object.keys(prev.bones), ...Object.keys(next.bones)]);
    for (const boneName of allBones) {
      const a = prev.bones[boneName] || { x: 0, y: 0, z: 0 };
      const b = next.bones[boneName] || { x: 0, y: 0, z: 0 };
      result[boneName] = {
        x: lerp(a.x, b.x, eased),
        y: lerp(a.y, b.y, eased),
        z: lerp(a.z, b.z, eased),
      };
    }
    return result;
  };

  const updateBlink = (delta: number) => {
    blinkTimerRef.current += delta;
    if (!isBlinkingRef.current && blinkTimerRef.current >= nextBlinkRef.current) {
      isBlinkingRef.current = true;
      blinkTimerRef.current = 0;
      for (const mesh of morphMeshesRef.current) {
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          const blinkL = mesh.morphTargetDictionary['eyeBlinkLeft'];
          const blinkR = mesh.morphTargetDictionary['eyeBlinkRight'];
          if (blinkL !== undefined) mesh.morphTargetInfluences[blinkL] = 1;
          if (blinkR !== undefined) mesh.morphTargetInfluences[blinkR] = 1;
        }
      }
    }
    if (isBlinkingRef.current && blinkTimerRef.current >= 0.15) {
      isBlinkingRef.current = false;
      blinkTimerRef.current = 0;
      nextBlinkRef.current = 2 + Math.random() * 4;
      for (const mesh of morphMeshesRef.current) {
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          const blinkL = mesh.morphTargetDictionary['eyeBlinkLeft'];
          const blinkR = mesh.morphTargetDictionary['eyeBlinkRight'];
          if (blinkL !== undefined) mesh.morphTargetInfluences[blinkL] = 0;
          if (blinkR !== undefined) mesh.morphTargetInfluences[blinkR] = 0;
        }
      }
    }
  };

  const updateBreathing = (delta: number) => {
    breathTimerRef.current += delta;
    const phase = (breathTimerRef.current % 3.5) / 3.5;
    const value = Math.sin(phase * Math.PI * 2) * 0.015;
    const spine = boneMapRef.current.get('Spine');
    const spine1 = boneMapRef.current.get('Spine1');
    if (spine) {
      spine.rotation.z = value * 0.3;
      spine.rotation.x = value * 0.15;
    }
    if (spine1) {
      spine1.rotation.z = value * 0.2;
    }
  };

  const updateIdle = (delta: number) => {
    idleTimerRef.current += delta;
    const head = boneMapRef.current.get('Head');
    if (head) {
      head.rotation.y = Math.sin(idleTimerRef.current * 0.3) * 0.02;
      head.rotation.x = Math.sin(idleTimerRef.current * 0.21) * 0.01;
    }
    // Head turns — look left/right periodically
    headTurnTimerRef.current += delta;
    if (headTurnTimerRef.current > 4 + Math.random() * 3) {
      headTurnTimerRef.current = 0;
      headTurnDirRef.current *= -1;
    }
    if (head) {
      const targetY = headTurnDirRef.current * 0.15;
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, targetY, 0.02);
    }
    // Shoulder shift
    const leftArm = boneMapRef.current.get('LeftUpperArm');
    const rightArm = boneMapRef.current.get('RightUpperArm');
    if (leftArm && rightArm) {
      const shift = Math.sin(idleTimerRef.current * 0.15) * 0.01;
      leftArm.rotation.z = -0.05 + shift;
      rightArm.rotation.z = 0.05 - shift;
    }
  };

  useFrame((_, delta) => {
    if (!loaded) return;

    updateBlink(delta);
    updateBreathing(delta);
    updateIdle(delta);

    if (!isPlayingRef.current) return;

    animTimeRef.current += delta;

    if (animTimeRef.current >= totalDurationRef.current + 0.3) {
      currentIndexRef.current++;
      if (currentIndexRef.current >= queueRef.current.length) {
        isPlayingRef.current = false;
        onAnimationStateChange?.('idle', '');
        onQueueComplete?.();
        return;
      }
      startSign(queueRef.current[currentIndexRef.current]);
    }

    const pose = interpolatePose(Math.min(animTimeRef.current, totalDurationRef.current));

    if (transitionProgressRef.current < 1) {
      transitionProgressRef.current = Math.min(1, transitionProgressRef.current + delta / 0.25);
      const blend = easeInOut(transitionProgressRef.current);
      for (const [slot, bone] of boneMapRef.current) {
        const target = pose[slot];
        const prev = prevPoseRef.current[slot];
        if (target && prev) {
          bone.rotation.x = lerp(prev.x, target.x, blend);
          bone.rotation.y = lerp(prev.y, target.y, blend);
          bone.rotation.z = lerp(prev.z, target.z, blend);
        } else if (target) {
          bone.rotation.x = target.x;
          bone.rotation.y = target.y;
          bone.rotation.z = target.z;
        }
      }
    } else {
      for (const [slot, bone] of boneMapRef.current) {
        const target = pose[slot];
        if (target) {
          bone.rotation.x = target.x;
          bone.rotation.y = target.y;
          bone.rotation.z = target.z;
        }
      }
    }
  });

  useEffect(() => {
    if (!loaded || signs.length === 0) return;
    queueRef.current = signs;
    currentIndexRef.current = 0;
    isPlayingRef.current = true;
    animTimeRef.current = 0;
    transitionProgressRef.current = 0;
    startSign(signs[0]);
  }, [signs, loaded]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {!loaded && !loadError && (
        <Html center>
          <div className="bg-white/10 text-white p-4 rounded-xl flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            <span className="text-sm">Loading avatar model...</span>
          </div>
        </Html>
      )}
      {loadError && (
        <Html center>
          <div className="bg-red-900/90 text-white p-4 rounded-xl max-w-xs text-center">
            <p className="text-sm font-semibold mb-1">Failed to load avatar</p>
            <p className="text-xs opacity-70 break-all">{loadError}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 1.0, 2.5);
    camera.lookAt(0, 0.5, 0);
  }, [camera]);
  return null;
}

export interface GlbAvatarSceneProps {
  avatarConfig?: AvatarConfig;
  signs?: string[];
  autoPlay?: boolean;
  width?: string | number;
  height?: number;
  showControls?: boolean;
  onAnimationStateChange?: (state: string, token: string) => void;
  onQueueComplete?: () => void;
  onAvatarLoaded?: (info: { boneCount: number; hasMorphTargets: boolean; clipNames: string[] }) => void;
}

export function GlbAvatarScene({
  avatarConfig = DEFAULT_AVATARS[0],
  signs = [],
  autoPlay = true,
  width = '100%',
  height = 500,
  showControls = true,
  onAnimationStateChange,
  onQueueComplete,
  onAvatarLoaded,
}: GlbAvatarSceneProps) {
  return (
<div style={{ width, height }} className="relative overflow-hidden rounded-2xl bg-slate-900">
      <Canvas shadows camera={{ position: [0, 1.0, 2.5], fov: 35 }}>
        <CameraSetup />
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 3]} intensity={2.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <pointLight position={[-2, 3, -1]} intensity={0.6} color="#93c5fd" />
        <pointLight position={[2, 2, 1]} intensity={0.5} color="#fde68a" />
        <hemisphereLight args={['#f0f9ff', '#1e293b', 0.5]} />

        <AvatarGLBScene
          avatarConfig={avatarConfig}
          signs={signs}
          autoPlay={autoPlay}
          onAnimationStateChange={onAnimationStateChange}
          onQueueComplete={onQueueComplete}
          onAvatarLoaded={onAvatarLoaded}
        />

        <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={3} blur={2} />

        {showControls && (
          <OrbitControls
            target={[0, 0.5, 0]}
            minDistance={1.0}
            maxDistance={4.0}
            minPolarAngle={Math.PI / 10}
            maxPolarAngle={Math.PI / 2}
            enablePan={false}
          />
        )}
      </Canvas>
    </div>
  );
}
