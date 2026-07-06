'use client';

import * as THREE from 'three';

export class IdleController {
  private root: THREE.Object3D;
  private timer = 0;
  private headBone: THREE.Bone | null = null;
  private spineBone: THREE.Bone | null = null;
  private hipBone: THREE.Bone | null = null;
  private leftArmBone: THREE.Bone | null = null;
  private rightArmBone: THREE.Bone | null = null;

  private headIdleSpeed = 0.3;
  private headIdleAmount = 0.02;
  private spineIdleSpeed = 0.2;
  private spineIdleAmount = 0.01;
  private armIdleSpeed = 0.15;
  private armIdleAmount = 0.008;
  private weightShiftSpeed = 0.1;
  private weightShiftAmount = 0.005;

  constructor(root: THREE.Object3D) {
    this.root = root;
    root.traverse((child) => {
      if (child instanceof THREE.Bone) {
        const name = child.name.toLowerCase();
        if (name.includes('neck') || name === 'head') {
          this.headBone = child;
        } else if (name.includes('spine') && (name.includes('0') || name.includes('1'))) {
          this.spineBone = child;
        } else if (name.includes('hip') || name === 'pelvis') {
          this.hipBone = child;
        } else if (name.includes('upperarm_l') || name === 'leftupperarm' || name === 'upperarml') {
          this.leftArmBone = child;
        } else if (name.includes('upperarm_r') || name === 'rightupperarm' || name === 'upperarmr') {
          this.rightArmBone = child;
        }
      }
    });
  }

  update(delta: number) {
    this.timer += delta;

    if (this.headBone) {
      this.headBone.rotation.y = Math.sin(this.timer * this.headIdleSpeed) * this.headIdleAmount;
      this.headBone.rotation.x = Math.sin(this.timer * this.headIdleSpeed * 0.7) * this.headIdleAmount * 0.5;
      this.headBone.rotation.z = Math.sin(this.timer * this.headIdleSpeed * 1.3) * this.headIdleAmount * 0.3;
    }

    if (this.spineBone) {
      this.spineBone.rotation.y = Math.sin(this.timer * this.spineIdleSpeed) * this.spineIdleAmount;
      this.spineBone.rotation.z = Math.cos(this.timer * this.spineIdleSpeed * 0.8) * this.spineIdleAmount * 0.5;
    }

    if (this.hipBone) {
      this.hipBone.position.x = Math.sin(this.timer * this.weightShiftSpeed) * this.weightShiftAmount;
    }

    if (this.leftArmBone) {
      this.leftArmBone.rotation.z = Math.sin(this.timer * this.armIdleSpeed) * this.armIdleAmount - 0.05;
      this.leftArmBone.rotation.x = Math.cos(this.timer * this.armIdleSpeed * 0.6) * this.armIdleAmount * 0.5;
    }

    if (this.rightArmBone) {
      this.rightArmBone.rotation.z = -Math.sin(this.timer * this.armIdleSpeed + 0.5) * this.armIdleAmount + 0.05;
      this.rightArmBone.rotation.x = Math.cos(this.timer * this.armIdleSpeed * 0.6 + 0.5) * this.armIdleAmount * 0.5;
    }
  }

  reset() {
    this.timer = 0;
    const bones = [this.headBone, this.spineBone, this.hipBone, this.leftArmBone, this.rightArmBone];
    for (const bone of bones) {
      if (bone) {
        bone.rotation.set(0, 0, 0);
      }
    }
    if (this.hipBone) {
      this.hipBone.position.x = 0;
    }
  }
}
