import { SpriteDefinition } from "./definition";
import { SpriteSheet } from "./spritesheet";


export class Sprite {
  spriteDefinitions: SpriteDefinition[];
  onFrameChange?: (frame: number) => void;

  constructor(private spriteSheet: SpriteSheet, private frames: number[]) {
    this.spriteDefinitions = spriteSheet.spriteDefinitions;
  }

  getSpriteDefinition(frame: number = 0) {
    return this.spriteDefinitions[this.frames[frame % this.frames.length]];
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number = 0, scale: number = 1) {
    const spriteDefinition = this.getSpriteDefinition(frame);
    const { x: sx, y: sy, w, h } = spriteDefinition.frame;
    ctx.drawImage(this.spriteSheet.getImage(), sx, sy, w, h, x, y, w * scale, h * scale);
  }

  makeCanvas(frame: number = 0, scale: number = 1) {
    const { w, h } = this.getSpriteDefinition(frame).frame;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.classList.add("sprite-canvas");
    canvas.width = w * scale;
    canvas.height = h * scale;
    this.draw(ctx, 0, 0, frame, scale);
    this.onFrameChange?.(frame);

    if (this.frames.length > 1) {
      const animStart = performance.now();
      const def = this.spriteDefinitions[this.frames[frame]];
      const animate = () => {
        const now = performance.now();
        const elapsed = now - animStart;
        const frame = Math.floor((elapsed / def.duration)) % this.frames.length;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.draw(ctx, 0, 0, frame, scale);
        this.onFrameChange?.(frame);
        requestAnimationFrame(animate);
      };
      animate();
    }
    return canvas;
  }

  async makeBlob(frame: number, scale: number = 1) {
    return new Promise<Blob>((resolve) => {
      this.makeCanvas(frame, scale).toBlob((blob) => resolve(blob!));
    });
  }

  generateDiv(frame: number = 0) {
    const spriteDefinition = this.getSpriteDefinition(frame);
    const div = document.createElement('div');
    div.classList.add('sprite');
    div.style.backgroundImage = `url(${this.spriteSheet.definition.meta.image})`;
    div.style.backgroundPosition = `-${spriteDefinition.frame.x}px -${spriteDefinition.frame.y}px`;
    div.style.minWidth = `${spriteDefinition.frame.w}px`;
    div.style.minHeight = `${spriteDefinition.frame.h}px`;
    div.style.backgroundSize = `${this.spriteSheet.definition.meta.size.w}px ${this.spriteSheet.definition.meta.size.h}px`;

    if (this.frames.length > 1) {
      // Add CSS animation
      let duration = 0;
      let keyframes = `@keyframes animateSprite {`;
      for (let i = 0; i < this.frames.length; i++) {
        const f = this.frames[i];
        const def = this.spriteDefinitions[f];
        const percentage = (i / this.frames.length) * 100;
        keyframes += `${percentage}% { background-position: -${def.frame.x}px -${def.frame.y}px; } `;
        duration += def.duration;
      }
      keyframes += `}`;
      console.log(keyframes);
      const styleSheet = document.createElement("style");
      styleSheet.innerText = keyframes;
      document.head.appendChild(styleSheet);

      div.style.animation = `animateSprite ${duration}ms steps(1) infinite`;
    }
    return div;
  }
}
