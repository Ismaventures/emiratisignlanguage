'use client';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  lookupGesture,
  lookupFingerspelling,
  type AnimationEntry,
  type FingerspellingEntry,
} from './animation-database';

export interface AnimationClipEntry {
  clip: THREE.AnimationClip;
  entry: AnimationEntry | FingerspellingEntry;
  isFingerspelling: boolean;
}

export interface QueuedAnimation {
  id: string;
  token: string;
  entry: AnimationEntry | null;
  fingerspelling: FingerspellingEntry | null;
  clip: THREE.AnimationClip | null;
}

export type AnimationState = 'idle' | 'playing' | 'blending' | 'paused';

const BLEND_DURATION = 0.3;
const PRELOAD_BATCH_SIZE = 5;

export class AnimationEngine {
  private mixer: THREE.AnimationMixer | null = null;
  private root: THREE.Object3D | null = null;
  private clipCache = new Map<string, THREE.AnimationClip>();
  private preloadedPaths = new Set<string>();
  private preloadingPaths = new Set<string>();
  private queue: QueuedAnimation[] = [];
  private currentIndex = -1;
  private currentState: AnimationState = 'idle';
  private currentAction: THREE.AnimationAction | null = null;
  private idleAction: THREE.AnimationAction | null = null;
  private idleClip: THREE.AnimationClip | null = null;
  private onStateChange?: (state: AnimationState, token: string) => void;
  private onQueueComplete?: () => void;
  private blendDuration = BLEND_DURATION;
  private loopIdle = true;
  private loader = new GLTFLoader();

  constructor() {
    if (typeof window !== 'undefined') {
      this.loader = new GLTFLoader();
    }
  }

  setRoot(root: THREE.Object3D) {
    this.root = root;
    this.mixer = new THREE.AnimationMixer(root);
    this.mixer.addEventListener('finished', this.onAnimationFinished);
  }

  setCallbacks(
    onStateChange?: (state: AnimationState, token: string) => void,
    onQueueComplete?: () => void,
  ) {
    this.onStateChange = onStateChange;
    this.onQueueComplete = onQueueComplete;
  }

  setBlendDuration(duration: number) {
    this.blendDuration = duration;
  }

  async loadClip(url: string): Promise<THREE.AnimationClip | null> {
    if (this.clipCache.has(url)) {
      return this.clipCache.get(url)!;
    }

    try {
      const gltf: any = await new Promise((resolve, reject) => {
        this.loader.load(url, resolve, undefined, reject);
      });

      const clip = gltf.animations[0] || null;
      if (clip) {
        this.clipCache.set(url, clip);
      }
      return clip;
    } catch {
      return null;
    }
  }

  async preloadAnimations(urls: string[]): Promise<void> {
    const toLoad = urls.filter(
      (url) => !this.preloadedPaths.has(url) && !this.preloadingPaths.has(url),
    );

    const batches: string[][] = [];
    for (let i = 0; i < toLoad.length; i += PRELOAD_BATCH_SIZE) {
      batches.push(toLoad.slice(i, i + PRELOAD_BATCH_SIZE));
    }

    for (const batch of batches) {
      await Promise.allSettled(
        batch.map(async (url) => {
          this.preloadingPaths.add(url);
          await this.loadClip(url);
          this.preloadedPaths.add(url);
          this.preloadingPaths.delete(url);
        }),
      );
    }
  }

  async buildQueue(text: string): Promise<QueuedAnimation[]> {
    const tokens = text
      .toUpperCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    const queue: QueuedAnimation[] = tokens.map((token) => ({
      id: `${token}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      token,
      entry: lookupGesture(token),
      fingerspelling: null,
      clip: null,
    }));

    const urlsToPreload: string[] = [];
    for (const item of queue) {
      if (item.entry) {
        urlsToPreload.push(item.entry.glbPath);
      }
    }

    this.preloadAnimations(urlsToPreload);

    const clips = await Promise.all(
      queue.map(async (item) => {
        if (item.entry) {
          const clip = await this.loadClip(item.entry.glbPath);
          return { id: item.id, clip };
        }
        return { id: item.id, clip: null };
      }),
    );

    for (const item of queue) {
      const found = clips.find((c) => c.id === item.id);
      if (found?.clip) {
        item.clip = found.clip;
      } else {
        item.fingerspelling = lookupFingerspelling(item.token[0]) || null;
        if (item.fingerspelling) {
          const fpClip = await this.loadClip(item.fingerspelling.glbPath);
          item.clip = fpClip;
        }
      }
    }

    this.queue = queue;
    this.currentIndex = -1;
    return queue;
  }

  play() {
    if (this.queue.length === 0) return;
    this.currentIndex = 0;
    this.playCurrent();
  }

  private playCurrent() {
    if (this.currentIndex < 0 || this.currentIndex >= this.queue.length) {
      this.currentState = 'idle';
      this.playIdle();
      this.onQueueComplete?.();
      return;
    }

    const item = this.queue[this.currentIndex];
    if (!item.clip || !this.mixer || !this.root) {
      this.skip();
      return;
    }

    this.currentState = 'playing';
    this.onStateChange?.('playing', item.token);

    if (this.currentAction) {
      this.currentAction.fadeOut(this.blendDuration);
    }

    const action = this.mixer.clipAction(item.clip, this.root);
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;

    if (this.currentAction && this.blendDuration > 0) {
      action.reset().setEffectiveWeight(0);
      action.crossFadeFrom(this.currentAction, this.blendDuration, false);
    }

    action.play();
    this.currentAction = action;
  }

  private onAnimationFinished = (e: { action: THREE.AnimationAction }) => {
    if (e.action === this.currentAction) {
      this.currentIndex++;
      this.playCurrent();
    }
  };

  skip() {
    this.currentIndex++;
    this.playCurrent();
  }

  pause() {
    if (this.currentAction) {
      this.currentAction.paused = true;
      this.currentState = 'paused';
      this.onStateChange?.('paused', '');
    }
  }

  resume() {
    if (this.currentAction) {
      this.currentAction.paused = false;
      this.currentState = 'playing';
      this.onStateChange?.('playing', this.queue[this.currentIndex]?.token || '');
    }
  }

  stop() {
    if (this.currentAction) {
      this.currentAction.fadeOut(this.blendDuration);
      this.currentAction = null;
    }
    this.currentIndex = -1;
    this.queue = [];
    this.currentState = 'idle';
    this.playIdle();
  }

  private playIdle() {
    if (!this.idleClip || !this.mixer || !this.root) return;

    if (this.idleAction) {
      this.idleAction.fadeOut(this.blendDuration);
    }

    const action = this.mixer.clipAction(this.idleClip, this.root);
    action.reset();
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.play();
    this.idleAction = action;
  }

  async setIdleAnimation(url: string) {
    const clip = await this.loadClip(url);
    if (clip) {
      this.idleClip = clip;
      if (this.currentState === 'idle') {
        this.playIdle();
      }
    }
  }

  getState(): AnimationState {
    return this.currentState;
  }

  getQueue(): QueuedAnimation[] {
    return [...this.queue];
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getCurrentToken(): string {
    if (this.currentIndex >= 0 && this.currentIndex < this.queue.length) {
      return this.queue[this.currentIndex].token;
    }
    return '';
  }

  getProgress(): number {
    if (this.queue.length === 0) return 0;
    return this.currentIndex / this.queue.length;
  }

  update(delta: number) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }

  dispose() {
    this.stop();
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.root!);
    }
    this.clipCache.clear();
    this.preloadedPaths.clear();
    this.preloadingPaths.clear();
  }
}
