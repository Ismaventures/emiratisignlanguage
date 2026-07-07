'use client';

import * as THREE from 'three';

export class EyeController {
  private leftEyeBone: THREE.Object3D | null = null;
  private rightEyeBone: THREE.Object3D | null = null;
  private blinkTimer = 0;
  private nextBlinkTime = 2 + Math.random() * 4;
  private blinkPhase = 0;
  private isBlinking = false;
  private blinkDuration = 0.15;
  private gazeTarget = new THREE.Vector3(0, 0, 1);
  private currentGaze = new THREE.Vector3(0, 0, 1);
  private gazeSmoothing = 0.05;
  private lookAroundTimer = 0;
  private nextLookAroundTime = 3 + Math.random() * 5;
  private microSaccadeTimer = 0;

  constructor(root: THREE.Object3D) {
    root.traverse((child) => {
      const name = child.name.toLowerCase();
      if (name.includes('eye_l') || name.includes('lefteye') || name === 'eyeleft') {
        this.leftEyeBone = child;
      } else if (name.includes('eye_r') || name.includes('righteye') || name === 'eyeright') {
        this.rightEyeBone = child;
      }
    });
  }

  update(delta: number, headPosition?: THREE.Vector3) {
    this.updateBlink(delta);
    this.updateGaze(delta);
  }

  private updateBlink(delta: number) {
    this.blinkTimer += delta;

    if (!this.isBlinking && this.blinkTimer >= this.nextBlinkTime) {
      this.isBlinking = true;
      this.blinkPhase = 0;
      this.blinkTimer = 0;
      this.nextBlinkTime = 2 + Math.random() * 4;
    }

    if (this.isBlinking) {
      this.blinkPhase += delta / this.blinkDuration;

      let blinkAmount = 0;
      if (this.blinkPhase < 0.5) {
        blinkAmount = this.blinkPhase * 2;
      } else if (this.blinkPhase < 1.0) {
        blinkAmount = (1 - this.blinkPhase) * 2;
      } else {
        blinkAmount = 0;
        this.isBlinking = false;
      }

      const rotation = new THREE.Euler(blinkAmount * 0.5, 0, 0);
      if (this.leftEyeBone) this.leftEyeBone.rotation.x = rotation.x;
      if (this.rightEyeBone) this.rightEyeBone.rotation.x = rotation.x;
    }
  }

  private updateGaze(delta: number) {
    this.lookAroundTimer += delta;
    this.microSaccadeTimer += delta;

    if (this.lookAroundTimer >= this.nextLookAroundTime) {
      this.lookAroundTimer = 0;
      this.nextLookAroundTime = 3 + Math.random() * 5;

      this.gazeTarget.set(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.2,
        1,
      );
    }

    if (this.microSaccadeTimer > 0.1 + Math.random() * 0.2) {
      this.microSaccadeTimer = 0;
      this.gazeTarget.x += (Math.random() - 0.5) * 0.02;
      this.gazeTarget.y += (Math.random() - 0.5) * 0.01;
    }

    this.currentGaze.lerp(this.gazeTarget, this.gazeSmoothing);

    const yaw = Math.atan2(this.currentGaze.x, this.currentGaze.z);
    const pitch = Math.atan2(this.currentGaze.y, this.currentGaze.z);

    if (this.leftEyeBone) {
      this.leftEyeBone.rotation.y = yaw * 0.5;
      this.leftEyeBone.rotation.x = pitch * 0.5;
    }
    if (this.rightEyeBone) {
      this.rightEyeBone.rotation.y = yaw * 0.5;
      this.rightEyeBone.rotation.x = pitch * 0.5;
    }
  }

  lookAt(target: THREE.Vector3) {
    this.gazeTarget.copy(target);
  }

  resetGaze() {
    this.gazeTarget.set(0, 0, 1);
  }
}
