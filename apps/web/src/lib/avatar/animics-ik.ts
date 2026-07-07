'use client';

import * as THREE from 'three';

// Extracted from Animics IKSolver.js — Two-bone IK for arms and legs
// https://github.com/upf-gti/animics

const _quat = new THREE.Quaternion();
const _vec3 = new THREE.Vector3();
const _vec3_2 = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();

export class TwoBoneIKSolver {
  private skeleton: THREE.Skeleton;
  private chains: { bone: THREE.Bone; target: THREE.Vector3 }[] = [];
  private bindQuats: THREE.Quaternion[] = [];
  private invBindQuats: THREE.Quaternion[] = [];

  constructor(skeleton: THREE.Skeleton) {
    this.skeleton = skeleton;
    this.precomputeBind();
  }

  private precomputeBind() {
    const numBones = this.skeleton.bones.length;
    this.bindQuats = [];
    this.invBindQuats = [];

    for (let i = 0; i < numBones; i++) {
      const parentIdx = this.skeleton.bones.indexOf(this.skeleton.bones[i].parent as THREE.Bone);

      _mat4.copy(this.skeleton.boneInverses[i]);
      _mat4.invert();

      if (parentIdx > -1) {
        _mat4.premultiply(this.skeleton.boneInverses[parentIdx]);
      }

      _quat.setFromRotationMatrix(_mat4);
      this.bindQuats[i] = _quat.clone();
      this.invBindQuats[i] = _quat.clone().invert();
    }
  }

  addChain(boneName: string, target: THREE.Vector3) {
    const bone = this.skeleton.bones.find((b) => b.name.includes(boneName));
    if (bone) {
      this.chains.push({ bone, target: target.clone() });
    }
  }

  solve() {
    for (const chain of this.chains) {
      this.solveChain(chain.bone, chain.target);
    }
  }

  private solveChain(endBone: THREE.Bone, target: THREE.Vector3) {
    // Find parent bone (elbow) and grandparent (shoulder)
    const parent = endBone.parent as THREE.Bone;
    if (!parent) return;

    const grandparent = parent.parent as THREE.Bone;
    if (!grandparent) return;

    // Get world positions
    endBone.updateWorldMatrix(true, false);
    parent.updateWorldMatrix(true, false);
    grandparent.updateWorldMatrix(true, false);

    const shoulderPos = new THREE.Vector3().setFromMatrixPosition(grandparent.matrixWorld);
    const elbowPos = new THREE.Vector3().setFromMatrixPosition(parent.matrixWorld);
    const handPos = new THREE.Vector3().setFromMatrixPosition(endBone.matrixWorld);

    const upperArmLen = shoulderPos.distanceTo(elbowPos);
    const foreArmLen = elbowPos.distanceTo(handPos);
    const totalLen = upperArmLen + foreArmLen;

    const dirToTarget = new THREE.Vector3().subVectors(target, shoulderPos);
    const distToTarget = dirToTarget.length();

    // Clamp to reachable distance
    const clampedDist = Math.min(distToTarget, totalLen * 0.99);
    dirToTarget.normalize().multiplyScalar(clampedDist);

    // Law of cosines to find elbow angle
    const a = upperArmLen;
    const b = foreArmLen;
    const c = clampedDist;
    const cosAngle = (a * a + b * b - c * c) / (2 * a * b);
    const elbowAngle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

    // Midpoint between shoulder and target
    const mid = new THREE.Vector3().addVectors(shoulderPos, dirToTarget).multiplyScalar(0.5);

    // Elbow position (perpendicular to the plane)
    const planeNormal = new THREE.Vector3().crossVectors(dirToTarget, new THREE.Vector3(0, 1, 0)).normalize();
    if (planeNormal.length() < 0.001) planeNormal.set(0, 0, 1);

    const halfDist = clampedDist * 0.5;
    const elbowOffset = Math.sqrt(Math.max(0, upperArmLen * upperArmLen - halfDist * halfDist));
    const elbowTarget = new THREE.Vector3()
      .copy(mid)
      .addScaledVector(planeNormal, elbowOffset);

    // Apply rotations (simplified — full IK would use quaternions)
    this.rotateToTarget(parent, elbowTarget);
    this.rotateToTarget(endBone, target);
  }

  private rotateToTarget(bone: THREE.Bone, target: THREE.Vector3) {
    const worldPos = new THREE.Vector3();
    bone.getWorldPosition(worldPos);

    const dir = new THREE.Vector3().subVectors(target, worldPos).normalize();
    const up = new THREE.Vector3(0, 1, 0);

    const lookMat = new THREE.Matrix4();
    lookMat.lookAt(worldPos, target, up);

    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(lookMat);

    // Convert to local space
    if (bone.parent) {
      const parentWorldQuat = new THREE.Quaternion();
      (bone.parent as THREE.Object3D).getWorldQuaternion(parentWorldQuat);
      targetQuat.premultiply(parentWorldQuat.invert());
    }

    bone.quaternion.slerp(targetQuat, 0.3);
  }
}

// Hand pose presets for common sign language handshapes
export const HAND_POSES: Record<string, Record<string, number>> = {
  flat_hand: {
    'Thumb1': 0, 'Thumb2': 0, 'Thumb3': 0,
    'Index1': 0, 'Index2': 0, 'Index3': 0,
    'Middle1': 0, 'Middle2': 0, 'Middle3': 0,
    'Ring1': 0, 'Ring2': 0, 'Ring3': 0,
    'Pinky1': 0, 'Pinky2': 0, 'Pinky3': 0,
  },
  fist: {
    'Thumb1': 0.3, 'Thumb2': 0.3, 'Thumb3': 0.3,
    'Index1': 1.2, 'Index2': 1.2, 'Index3': 1.2,
    'Middle1': 1.2, 'Middle2': 1.2, 'Middle3': 1.2,
    'Ring1': 1.2, 'Ring2': 1.2, 'Ring3': 1.2,
    'Pinky1': 1.2, 'Pinky2': 1.2, 'Pinky3': 1.2,
  },
  point: {
    'Thumb1': 0.3, 'Thumb2': 0.3, 'Thumb3': 0.3,
    'Index1': 0, 'Index2': 0, 'Index3': 0,
    'Middle1': 1.2, 'Middle2': 1.2, 'Middle3': 1.2,
    'Ring1': 1.2, 'Ring2': 1.2, 'Ring3': 1.2,
    'Pinky1': 1.2, 'Pinky2': 1.2, 'Pinky3': 1.2,
  },
  open_palm: {
    'Thumb1': -0.3, 'Thumb2': -0.2, 'Thumb3': -0.1,
    'Index1': -0.2, 'Index2': -0.1, 'Index3': 0,
    'Middle1': -0.2, 'Middle2': -0.1, 'Middle3': 0,
    'Ring1': -0.2, 'Ring2': -0.1, 'Ring3': 0,
    'Pinky1': -0.2, 'Pinky2': -0.1, 'Pinky3': 0,
  },
  thumbs_up: {
    'Thumb1': -1.0, 'Thumb2': -0.5, 'Thumb3': -0.3,
    'Index1': 1.2, 'Index2': 1.2, 'Index3': 1.2,
    'Middle1': 1.2, 'Middle2': 1.2, 'Middle3': 1.2,
    'Ring1': 1.2, 'Ring2': 1.2, 'Ring3': 1.2,
    'Pinky1': 1.2, 'Pinky2': 1.2, 'Pinky3': 1.2,
  },
};

export function applyHandPose(boneMap: Map<string, THREE.Object3D>, hand: 'Left' | 'Right', pose: string) {
  const poseData = HAND_POSES[pose];
  if (!poseData) return;

  for (const [finger, angle] of Object.entries(poseData)) {
    const boneName = `mixamorig${hand}Hand${finger}`;
    const bone = boneMap.get(boneName);
    if (bone) {
      bone.rotation.x = angle;
    }
  }
}
