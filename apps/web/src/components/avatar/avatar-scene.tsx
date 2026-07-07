'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { ProceduralAnimator } from '@/lib/avatar/procedural-animator';
import { EyeController } from '@/lib/avatar/eye-controller';
import { BreathingController } from '@/lib/avatar/breathing-controller';
import { IdleController } from '@/lib/avatar/idle-controller';

function AvatarBody() {
  const groupRef = useRef<THREE.Group>(null);
  const skinColor = 0xd4a574;

  useEffect(() => {
    if (!groupRef.current) return;
    const g = groupRef.current;

    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
    const clothMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.8 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2d2d44, roughness: 0.8 });

    const hip = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.2, 12), pantsMat);
    hip.position.y = 0.9;
    hip.name = 'Hip';
    g.add(hip);

    const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.35, 12), clothMat);
    spine.position.y = 1.15;
    spine.name = 'Spine';
    g.add(spine);

    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.3, 12), clothMat);
    chest.position.y = 1.45;
    chest.name = 'Chest';
    g.add(chest);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 8), skinMat);
    neck.position.y = 1.65;
    g.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), skinMat);
    head.position.y = 1.8;
    head.name = 'Head';
    g.add(head);

    const eyeGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x2d1b00 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.04, 1.82, 0.1);
    g.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.04, 1.82, 0.1);
    g.add(rightEye);

    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.01), new THREE.MeshStandardMaterial({ color: 0xc4756b }));
    mouth.position.set(0, 1.76, 0.11);
    g.add(mouth);

    const createArm = (side: 'left' | 'right') => {
      const sign = side === 'left' ? -1 : 1;
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.3, 8), clothMat);
      upperArm.position.set(sign * 0.22, 1.45, 0);
      upperArm.rotation.z = sign * 0.15;
      upperArm.name = `${side === 'left' ? 'Left' : 'Right'}UpperArm`;
      g.add(upperArm);

      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.28, 8), skinMat);
      forearm.position.set(sign * 0.26, 1.2, 0);
      forearm.rotation.z = sign * 0.05;
      forearm.name = `${side === 'left' ? 'Left' : 'Right'}ForeArm`;
      g.add(forearm);

      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.03), skinMat);
      hand.position.set(sign * 0.27, 1.04, 0);
      hand.name = `${side === 'left' ? 'Left' : 'Right'}Hand`;
      g.add(hand);

      return { upperArm, forearm, hand };
    };

    createArm('left');
    createArm('right');

    const createLeg = (side: 'left' | 'right') => {
      const sign = side === 'left' ? -1 : 1;
      const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.4, 8), pantsMat);
      upperLeg.position.set(sign * 0.08, 0.65, 0);
      g.add(upperLeg);

      const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.4, 8), pantsMat);
      lowerLeg.position.set(sign * 0.08, 0.25, 0);
      g.add(lowerLeg);

      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, 0.12), new THREE.MeshStandardMaterial({ color: 0x333333 }));
      foot.position.set(sign * 0.08, 0.03, 0.03);
      g.add(foot);
    };

    createLeg('left');
    createLeg('right');
  }, []);

  return <group ref={groupRef} />;
}

function AvatarModelInner({
  onAnimationStateChange,
  onQueueComplete,
  onAnimationReady,
}: {
  onAnimationStateChange?: (state: string, token: string) => void;
  onQueueComplete?: () => void;
  onAnimationReady?: (animator: ProceduralAnimator) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const animatorRef = useRef<ProceduralAnimator | null>(null);
  const eyeRef = useRef<EyeController | null>(null);
  const breathRef = useRef<BreathingController | null>(null);
  const idleRef = useRef<IdleController | null>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const timer = setTimeout(() => {
      const animator = new ProceduralAnimator(groupRef.current!);
      animator.setCallbacks(
        (sign) => onAnimationStateChange?.('playing', sign),
        () => onAnimationStateChange?.('idle', ''),
      );
      animatorRef.current = animator;

      eyeRef.current = new EyeController(groupRef.current!);
      breathRef.current = new BreathingController(groupRef.current!);
      idleRef.current = new IdleController(groupRef.current!);

      onAnimationReady?.(animator);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useFrame((_, delta) => {
    animatorRef.current?.update(delta);
    eyeRef.current?.update(delta);
    breathRef.current?.update(delta);
    idleRef.current?.update(delta);
  });

  return (
    <group ref={groupRef}>
      <AvatarBody />
    </group>
  );
}

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 1.4, 2.5);
    camera.lookAt(0, 1.2, 0);
  }, [camera]);
  return null;
}

export interface AvatarSceneProps {
  width?: string | number;
  height?: number;
  showControls?: boolean;
  onAnimationStateChange?: (state: string, token: string) => void;
  onQueueComplete?: () => void;
  onAnimationReady?: (animator: ProceduralAnimator) => void;
}

export function AvatarScene({
  width = '100%',
  height = 500,
  showControls = true,
  onAnimationStateChange,
  onQueueComplete,
  onAnimationReady,
}: AvatarSceneProps) {
  return (
    <div style={{ width, height }} className="relative overflow-hidden rounded-2xl bg-gray-950">
      <Canvas shadows camera={{ position: [0, 1.4, 2.5], fov: 45 }}>
        <CameraSetup />
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 3, 2]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <pointLight position={[-2, 2, -1]} intensity={0.3} color="#60a5fa" />
        <pointLight position={[2, 1, 1]} intensity={0.2} color="#fbbf24" />

        <AvatarModelInner
          onAnimationStateChange={onAnimationStateChange}
          onQueueComplete={onQueueComplete}
          onAnimationReady={onAnimationReady}
        />

        <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={3} blur={2} />

        {showControls && (
          <OrbitControls
            target={[0, 1.2, 0]}
            minDistance={1}
            maxDistance={5}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.8}
            enablePan={false}
          />
        )}
      </Canvas>
    </div>
  );
}
