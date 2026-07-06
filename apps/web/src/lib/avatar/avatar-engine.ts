'use client';

export interface AvatarPose {
  leftHandX: number;
  leftHandY: number;
  rightHandX: number;
  rightHandY: number;
  leftElbowBend: number;
  rightElbowBend: number;
  leftFingers: number[];
  rightFingers: number[];
}

const DEFAULT_POSE: AvatarPose = {
  leftHandX: -0.25,
  leftHandY: 0.15,
  rightHandX: 0.25,
  rightHandY: 0.15,
  leftElbowBend: 0.3,
  rightElbowBend: 0.3,
  leftFingers: [0.2, 0.25, 0.25, 0.25, 0.2],
  rightFingers: [0.2, 0.25, 0.25, 0.25, 0.2],
};

interface DrawConfig {
  cx: number;
  cy: number;
  scale: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export class AvatarEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentPose: AvatarPose = { ...DEFAULT_POSE };
  private targetPose: AvatarPose = { ...DEFAULT_POSE };
  private breathe = 0;
  private animId = 0;
  private config: DrawConfig = { cx: 0, cy: 0, scale: 1 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
  }

  resize() {
    const dpr = devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.config = {
      cx: rect.width / 2,
      cy: rect.height * 0.52,
      scale: Math.min(rect.width / 320, rect.height / 500),
    };
  }

  setPose(pose: Partial<AvatarPose>, smoothing = 0.12) {
    Object.assign(this.targetPose, pose);
    const l = (a: number, b: number) => lerp(a, b, smoothing);
    this.currentPose.leftHandX = l(this.currentPose.leftHandX, this.targetPose.leftHandX);
    this.currentPose.leftHandY = l(this.currentPose.leftHandY, this.targetPose.leftHandY);
    this.currentPose.rightHandX = l(this.currentPose.rightHandX, this.targetPose.rightHandX);
    this.currentPose.rightHandY = l(this.currentPose.rightHandY, this.targetPose.rightHandY);
    this.currentPose.leftElbowBend = l(this.currentPose.leftElbowBend, this.targetPose.leftElbowBend);
    this.currentPose.rightElbowBend = l(this.currentPose.rightElbowBend, this.targetPose.rightElbowBend);
    for (let i = 0; i < 5; i++) {
      this.currentPose.leftFingers[i] = l(this.currentPose.leftFingers[i], this.targetPose.leftFingers[i]);
      this.currentPose.rightFingers[i] = l(this.currentPose.rightFingers[i], this.targetPose.rightFingers[i]);
    }
  }

  startRender() {
    const loop = () => {
      this.breathe += 0.015;
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  stopRender() {
    cancelAnimationFrame(this.animId);
  }

  draw() {
    const { ctx, config } = this;
    const { cx, cy, scale } = config;
    ctx.clearRect(0, 0, this.canvas.width / (devicePixelRatio || 1), this.canvas.height / (devicePixelRatio || 1));

    const breathOffset = Math.sin(this.breathe) * 1.5;

    ctx.save();
    ctx.translate(cx, cy + breathOffset);
    ctx.scale(scale, scale);

    this.drawBody();
    this.drawArms();
    this.drawNeck();
    this.drawHead();

    ctx.restore();
  }

  private drawBody() {
    const { ctx } = this;

    // Kandura (white robe) - torso
    ctx.fillStyle = '#f5f5f0';
    ctx.beginPath();
    ctx.moveTo(-55, -20);
    ctx.quadraticCurveTo(-60, 60, -50, 140);
    ctx.lineTo(50, 140);
    ctx.quadraticCurveTo(60, 60, 55, -20);
    ctx.closePath();
    ctx.fill();

    // Collar V
    ctx.strokeStyle = '#e0e0d8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-12, -18);
    ctx.lineTo(0, 15);
    ctx.lineTo(12, -18);
    ctx.stroke();

    // Collar band
    ctx.fillStyle = '#e8e8e0';
    ctx.beginPath();
    ctx.ellipse(0, -18, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shoulder seams
    ctx.strokeStyle = '#e8e8e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-55, -20);
    ctx.quadraticCurveTo(-50, -15, -40, -10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(55, -20);
    ctx.quadraticCurveTo(50, -15, 40, -10);
    ctx.stroke();
  }

  private drawArms() {
    const { ctx } = this;
    const p = this.currentPose;

    // Left arm
    this.drawArm(
      { x: -55, y: -15 },
      p.leftHandX * 200, p.leftHandY * -200 + 40,
      p.leftElbowBend,
      p.leftFingers,
      false,
    );

    // Right arm
    this.drawArm(
      { x: 55, y: -15 },
      p.rightHandX * 200, p.rightHandY * -200 + 40,
      p.rightElbowBend,
      p.rightFingers,
      true,
    );
  }

  private drawArm(
    shoulder: { x: number; y: number },
    handOffsetX: number,
    handOffsetY: number,
    bendAmount: number,
    fingerCurls: number[],
    isRight: boolean,
  ) {
    const { ctx } = this;

    const elbowX = shoulder.x + handOffsetX * 0.5;
    const elbowY = shoulder.y + handOffsetY * 0.3 + 60 + bendAmount * 40;
    const handX = shoulder.x + handOffsetX;
    const handY = shoulder.y + handOffsetY;

    // Sleeve
    ctx.fillStyle = '#f5f5f0';
    ctx.beginPath();
    ctx.moveTo(shoulder.x, shoulder.y);
    const sleeveEnd = { x: lerp(shoulder.x, elbowX, 0.7), y: lerp(shoulder.y, elbowY, 0.7) };
    ctx.quadraticCurveTo(
      lerp(shoulder.x, elbowX, 0.3) + (isRight ? -15 : 15),
      lerp(shoulder.y, elbowY, 0.3),
      sleeveEnd.x,
      sleeveEnd.y,
    );
    ctx.lineWidth = 24;
    ctx.strokeStyle = '#f5f5f0';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Forearm (skin)
    ctx.beginPath();
    ctx.moveTo(sleeveEnd.x, sleeveEnd.y);
    ctx.quadraticCurveTo(
      lerp(elbowX, handX, 0.5) + (isRight ? 8 : -8),
      lerp(elbowY, handY, 0.5),
      handX,
      handY,
    );
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#d4a574';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Elbow joint
    ctx.fillStyle = '#d09868';
    ctx.beginPath();
    ctx.arc(sleeveEnd.x, sleeveEnd.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Hand
    this.drawHand(handX, handY, fingerCurls, isRight);
  }

  private drawHand(x: number, y: number, curls: number[], isRight: boolean) {
    const { ctx } = this;
    const flip = isRight ? -1 : 1;

    // Palm
    ctx.fillStyle = '#d4a574';
    ctx.beginPath();
    ctx.ellipse(x, y, 12, 15, flip * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Fingers
    const fingerData = [
      { angle: flip * -0.6, len: 22, xOff: flip * 8 },
      { angle: flip * -0.2, len: 28, xOff: flip * 4 },
      { angle: flip * 0.05, len: 30, xOff: 0 },
      { angle: flip * 0.3, len: 28, xOff: flip * -4 },
      { angle: flip * 0.6, len: 22, xOff: flip * -8 },
    ];

    for (let i = 0; i < 5; i++) {
      const f = fingerData[i];
      const curl = curls[i] || 0.2;
      const baseAngle = f.angle + flip * 0.1;
      const curlAngle = curl * Math.PI * 0.5;

      const midX = x + f.xOff + Math.sin(baseAngle - curlAngle) * f.len * 0.5;
      const midY = y - Math.cos(baseAngle - curlAngle) * f.len * 0.5;
      const tipX = x + f.xOff + Math.sin(baseAngle - curlAngle * 1.5) * f.len;
      const tipY = y - Math.cos(baseAngle - curlAngle * 1.5) * f.len;

      ctx.strokeStyle = '#d4a574';
      ctx.lineWidth = i === 0 ? 6 : 4.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x + f.xOff, y);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
      ctx.stroke();

      // Fingertip
      ctx.fillStyle = '#c89060';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Thumb
    const thumbAngle = flip * (0.8 + curls[0] * 0.5);
    const thumbTipX = x + flip * 14 + Math.sin(thumbAngle) * 14;
    const thumbTipY = y + 5 - Math.cos(thumbAngle) * 14;
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + flip * 10, y + 5);
    ctx.quadraticCurveTo(
      x + flip * 16, y + 8,
      thumbTipX,
      thumbTipY,
    );
    ctx.stroke();

    ctx.fillStyle = '#c89060';
    ctx.beginPath();
    ctx.arc(thumbTipX, thumbTipY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawNeck() {
    const { ctx } = this;

    ctx.fillStyle = '#d4a574';
    ctx.beginPath();
    ctx.moveTo(-14, -20);
    ctx.lineTo(-12, -45);
    ctx.lineTo(12, -45);
    ctx.lineTo(14, -20);
    ctx.closePath();
    ctx.fill();
  }

  private drawHead() {
    const { ctx } = this;

    // ── HAIR (under ghutra) ──
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(0, -55, 42, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── FACE ──
    ctx.fillStyle = '#d4a574';
    ctx.beginPath();
    ctx.ellipse(0, -52, 38, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks blush
    ctx.fillStyle = 'rgba(200, 130, 100, 0.15)';
    ctx.beginPath();
    ctx.ellipse(-22, -42, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(22, -42, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── EYES ──
    for (const side of [-1, 1]) {
      const ex = side * 14;

      // Sclera
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(ex, -54, 9, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris
      ctx.fillStyle = '#2c1810';
      ctx.beginPath();
      ctx.ellipse(ex, -54, 5.5, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.arc(ex, -54, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlight
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(ex - 1.5, -56, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Upper eyelid line
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(ex, -54, 9.5, 7, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Eyelashes
      ctx.lineWidth = 1.2;
      for (let i = -2; i <= 2; i++) {
        const lx = ex + i * 3.5;
        ctx.beginPath();
        ctx.moveTo(lx, -61);
        ctx.lineTo(lx + i * 0.3, -63);
        ctx.stroke();
      }
    }

    // ── EYEBROWS ──
    for (const side of [-1, 1]) {
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(side * 24, -65);
      ctx.quadraticCurveTo(side * 14, -69, side * 5, -64);
      ctx.stroke();
    }

    // ── NOSE ──
    ctx.strokeStyle = '#c09060';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-2, -48);
    ctx.quadraticCurveTo(-4, -38, -1, -35);
    ctx.quadraticCurveTo(0, -34, 1, -35);
    ctx.quadraticCurveTo(4, -38, 2, -48);
    ctx.stroke();

    // Nostrils
    ctx.fillStyle = '#c09060';
    ctx.beginPath();
    ctx.ellipse(-3, -35, 2, 1.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3, -35, 2, 1.2, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // ── MOUTH ──
    ctx.fillStyle = '#c07060';
    ctx.beginPath();
    ctx.moveTo(-10, -28);
    ctx.quadraticCurveTo(-5, -25, 0, -26);
    ctx.quadraticCurveTo(5, -25, 10, -28);
    ctx.quadraticCurveTo(5, -30, 0, -29);
    ctx.quadraticCurveTo(-5, -30, -10, -28);
    ctx.fill();

    // Mouth highlight
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.ellipse(0, -27, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── EARS ──
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#d4a574';
      ctx.beginPath();
      ctx.ellipse(side * 38, -50, 6, 10, side * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c09060';
      ctx.beginPath();
      ctx.ellipse(side * 38, -50, 3.5, 6, side * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── GHUTRA (headscarf) ──
    this.drawGhutra();

    // ── AGAL (black cord) ──
    this.drawAgal();
  }

  private drawGhutra() {
    const { ctx } = this;

    // Top drape
    ctx.fillStyle = '#fafafa';
    ctx.beginPath();
    ctx.moveTo(-45, -60);
    ctx.quadraticCurveTo(-48, -90, -30, -100);
    ctx.quadraticCurveTo(-15, -108, 0, -106);
    ctx.quadraticCurveTo(15, -108, 30, -100);
    ctx.quadraticCurveTo(48, -90, 45, -60);
    ctx.quadraticCurveTo(42, -75, 30, -82);
    ctx.quadraticCurveTo(15, -88, 0, -86);
    ctx.quadraticCurveTo(-15, -88, -30, -82);
    ctx.quadraticCurveTo(-42, -75, -45, -60);
    ctx.closePath();
    ctx.fill();

    // Left side drape
    ctx.fillStyle = '#f0f0ea';
    ctx.beginPath();
    ctx.moveTo(-44, -60);
    ctx.quadraticCurveTo(-50, -40, -48, -15);
    ctx.lineTo(-40, -15);
    ctx.quadraticCurveTo(-42, -40, -38, -58);
    ctx.closePath();
    ctx.fill();

    // Right side drape
    ctx.beginPath();
    ctx.moveTo(44, -60);
    ctx.quadraticCurveTo(50, -40, 48, -15);
    ctx.lineTo(40, -15);
    ctx.quadraticCurveTo(42, -40, 38, -58);
    ctx.closePath();
    ctx.fill();

    // Back drape (behind neck)
    ctx.fillStyle = '#e8e8e2';
    ctx.beginPath();
    ctx.moveTo(-35, -50);
    ctx.quadraticCurveTo(-38, -30, -36, -10);
    ctx.lineTo(36, -10);
    ctx.quadraticCurveTo(38, -30, 35, -50);
    ctx.closePath();
    ctx.fill();

    // Front drape folds
    ctx.strokeStyle = '#e0e0d8';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-20, -85);
    ctx.quadraticCurveTo(-25, -65, -30, -40);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20, -85);
    ctx.quadraticCurveTo(25, -65, 30, -40);
    ctx.stroke();

    // Ghutra edge shadow
    ctx.strokeStyle = '#d8d8d0';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-45, -60);
    ctx.quadraticCurveTo(-48, -90, -30, -100);
    ctx.quadraticCurveTo(-15, -108, 0, -106);
    ctx.quadraticCurveTo(15, -108, 30, -100);
    ctx.quadraticCurveTo(48, -90, 45, -60);
    ctx.stroke();
  }

  private drawAgal() {
    const { ctx } = this;

    // Main agal ring
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.ellipse(0, -82, 32, 10, 0, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();

    // Back ring
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, -82, 32, 10, 0, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Hanging tassels
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 25, -76);
      ctx.quadraticCurveTo(side * 28, -60, side * 24, -40);
      ctx.stroke();

      // Tassel end
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(side * 24, -40);
        ctx.lineTo(side * (22 + i * 2), -34);
        ctx.stroke();
      }
    }

    // Agal texture lines
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 0.8;
    for (let i = -3; i <= 3; i++) {
      const tx = i * 8;
      ctx.beginPath();
      ctx.moveTo(tx, -86);
      ctx.lineTo(tx, -78);
      ctx.stroke();
    }
  }

  getCanvas() { return this.canvas; }
}
