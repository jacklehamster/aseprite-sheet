// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { loadSpriteSheet, SpriteSheet } from "aseprite-sheet";
import { Sprite } from "../../dist/Sprite";


const sheet = await (new SpriteSheet((await loadSpriteSheet("random-iso.json"))!)).load();

function generateDivs() {
  const divs = document.createElement('div');
  divs.className = 'sprite-sheet';
  for (let i = 0; i < sheet.count; i++) {
    const div = divs.appendChild(sheet.getSprite(i).generateDiv());
    const label = div.appendChild(document.createElement('div'));
    label.style.fontSize = '100px';
    label.textContent = i.toString();
  }

  for (let tag of sheet.getTags()) {
    const div = divs.appendChild(sheet.getTaggedSprite(tag.name)!.generateDiv());
    const label = div.appendChild(document.createElement('div'));
    label.style.fontSize = '100px';
    label.textContent = tag.name;
    label.style.backgroundColor = tag.color;
  }

  return divs;
}

export const divs = generateDivs();


export function drawFrame(ctx: CanvasRenderingContext2D, index: number, x: number, y: number) {
  sheet.getSprite(index).draw(ctx, x, y, 0, .3);
  ctx.font = '24px sans-serif';
  ctx.fillText(index.toString(), x, y + 24);
}

function makeCanvasFromSprite(sprite: Sprite, label: string, color?: string) {
  const canvas = sprite.makeCanvas(0, .3);
  canvas.style.width = `${canvas.width / 2}px`;
  canvas.style.height = `${canvas.height / 2}px`;
  sprite.onFrameChange = () => {
    canvas.getContext('2d')!.font = '24px sans-serif';
    if (color) {
      canvas.getContext('2d')!.fillStyle = color;
      canvas.getContext('2d')!.fillRect(0, 0, 100, 30);
    }
    canvas.getContext('2d')!.fillStyle = 'black';
    canvas.getContext('2d')!.fillText(label, 0, 24);
  };
  return canvas;
}

export function makeCanvas(index: number) {
  return makeCanvasFromSprite(sheet.getSprite(index), index.toString());
}

export function makeCanvasFromTag(tag: string) {
  return makeCanvasFromSprite(sheet.getTaggedSprite(tag)!, tag, sheet.getTags().find((t) => t.name === tag)!.color);
}

export async function makeBlob(index: number) {
  return sheet.getSprite(index).makeBlob(0, .3);
}

export const spriteCount = sheet.count;
export const tags = sheet.getTags().map((tag) => tag.name);
