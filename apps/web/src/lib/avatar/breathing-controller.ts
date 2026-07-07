'use client';

import * as THREE from 'three';

export class BreathingController {
  private chestBone: THREE.Object3D | null = null;
  private spineBone: THREE.Object3D | null = null;
  private timer = 0;
  private breathRate = 3.5 + Math.random() * 1.5;
  private breathDepth = 0.015;
  private shoulderL: THREE.Object3D | null = null;
  private shoulderR: THREE.Object3D | null = null;

  constructor(root: THREE.Object3D) {
    root.traverse((child) => {
      const name = child.name.toLowerCase();
      if (name.includes('chest') || name === 'spine02' || name === 'spine_02') {
        this.chestBone = child;
      } else if (name.includes('spine') && !name.includes('0') && !name.includes('1') && !name.includes('2')) {
        this.spineBone = child;
      } else if (name.includes('shoulder_l') || name === 'leftshoulder' || name === 'shoulderl') {
        this.shoulderL = child;
      } else if (name.includes('shoulder_r') || name === 'rightshoulder' || name === 'shoulderr') {
        this.shoulderR = child;
      }
    });
  }

  update(delta: number) {
    this.timer += delta;
    const breathPhase = (this.timer % this.breathRate) / this.breathRate;
    const breathValue = Math.sin(breathPhase * Math.PI * 2) * this.breathDepth;

    if (this.chestBone) {
      this.chestBone.scale.setScalar(1 + breathValue * 0.5);
      this.chestBone.rotation.z = breathValue * 0.3;
    }

    if (this.spineBone) {
      this.spineBone.rotation.x = breathValue * 0.2;
    }

    const shoulderBreath = breathValue * 0.02;
    if (this.shoulderL) {
      this.shoulderL.position.y += shoulderBreath * delta;
    }
    if (this.shoulderR) {
      this.shoulderR.position.y += shoulderBreath * delta;
    }
  }

  reset() {
    this.timer = 0;
    if (this.chestBone) {
      this.chestBone.scale.setScalar(1);
      this.chestBone.rotation.z = 0;
    }
    if (this.spineBone) {
      this.spineBone.rotation.x = 0;
    }
  }
}
