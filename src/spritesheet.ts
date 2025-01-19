// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { Definition, Direction, SpriteDefinition } from "./definition";
import { Sprite } from "./Sprite";

export class SpriteSheet {
  image: HTMLImageElement = new Image();
  loadPromise?: Promise<void>;
  spriteDefinitions: SpriteDefinition[] = [];
  sprites: Sprite[] = [];
  taggedSprites: { [tag: string]: Sprite } = {};
  loaded = false;

  get count() {
    return this.spriteDefinitions.length;
  }

  constructor(public definition: Definition) {
    Object.entries(definition.frames).forEach(([name, frame]) => {
      const [, index] = name.match(REGEX) ?? [];
      this.spriteDefinitions[parseInt(index)] = frame;
    });
  }

  getImage(): HTMLImageElement {
    return this.image;
  }

  getSprite(index: number) {
    return this.sprites[index] ?? (this.sprites[index] = new Sprite(this, [index]));
  }

  getTaggedSprite(tag: string) {
    if (this.taggedSprites[tag]) {
      return this.taggedSprites[tag];
    }
    const tagDefinition = this.definition.meta.frameTags.find((t) => t.name === tag);
    if (tagDefinition) {
      const { from, to } = tagDefinition;
      const dir = Math.sign(to - from) || 1;
      const frames = [];
      for (let i = from; i <= to; i += dir) {
        frames.push(i);
      }
      return this.taggedSprites[tag] = new Sprite(this, this.calculateFrames(frames, tagDefinition.direction));
    }
    return;
  }

  calculateFrames(frames: number[], direction: Direction) {
    const f = [...frames];
    switch (direction) {
      case "reverse":
        f.reverse();
        break;
      case "pingpong":
        for (let i = frames.length - 2; i >= 1; i--) {
          f.push(frames[i]);
        }
        break;
      case "pingpong_reverse":
        f.reverse();
        for (let i = 1; i < frames.length - 1; i++) {
          f.push(frames[i]);
        }
        break;
    }
    return f;
  }

  getTags() {
    return this.definition.meta.frameTags;
  }

  async load() {
    if (!this.loadPromise && !this.loaded) {
      this.loadPromise = new Promise<void>(async (resolve, reject) => {
        await new Promise<void>((resolve, reject) => {
          this.image = new Image();
          this.image.onload = () => resolve();
          this.image.onerror = reject;
          this.image.src = this.definition.meta.image;
        });
        resolve();
        this.loadPromise = undefined;
      });
    }
    await this.loadPromise;
    return this;
  }
}

const REGEX = /.*\s(\d+).aseprite/;

export async function loadSpriteSheet(path: string): Promise<Definition | undefined> {
  const json = await fetch(path).then((res) => res.json()) as Partial<Definition>;
  return json as Definition;
}
