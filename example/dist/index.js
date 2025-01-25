// ../dist/index.js
class f {
  spriteSheet;
  frames;
  spriteDefinitions;
  onFrameChange;
  constructor(e, i) {
    this.spriteSheet = e;
    this.frames = i;
    this.spriteDefinitions = e.spriteDefinitions;
  }
  getSpriteDefinition(e = 0) {
    return this.spriteDefinitions[this.frames[e % this.frames.length]];
  }
  draw(e, i, t, r = 0, n = 1) {
    let a = this.getSpriteDefinition(r), { x: o, y: h, w: m, h: p } = a.frame;
    e.drawImage(this.spriteSheet.getImage(), o, h, m, p, i, t, m * n, p * n);
  }
  makeCanvas(e = 0, i = 1) {
    let { w: t, h: r } = this.getSpriteDefinition(e).frame, n = document.createElement("canvas"), a = n.getContext("2d");
    if (n.classList.add("sprite-canvas"), n.width = t * i, n.height = r * i, this.draw(a, 0, 0, e, i), this.onFrameChange?.(e), this.frames.length > 1) {
      let o = performance.now(), h = this.spriteDefinitions[this.frames[e]], m = () => {
        let g = performance.now() - o, c = Math.floor(g / h.duration) % this.frames.length;
        a.clearRect(0, 0, n.width, n.height), this.draw(a, 0, 0, c, i), this.onFrameChange?.(c), requestAnimationFrame(m);
      };
      m();
    }
    return n;
  }
  async makeBlob(e, i = 1) {
    return new Promise((t) => {
      this.makeCanvas(e, i).toBlob((r) => t(r));
    });
  }
  generateDiv(e = 0) {
    let i = this.getSpriteDefinition(e), t = document.createElement("div");
    if (t.classList.add("sprite"), t.style.backgroundImage = `url(${this.spriteSheet.definition.meta.image})`, t.style.backgroundPosition = `-${i.frame.x}px -${i.frame.y}px`, t.style.minWidth = `${i.frame.w}px`, t.style.minHeight = `${i.frame.h}px`, t.style.backgroundSize = `${this.spriteSheet.definition.meta.size.w}px ${this.spriteSheet.definition.meta.size.h}px`, this.frames.length > 1) {
      let r = 0, n = "@keyframes animateSprite {";
      for (let o = 0;o < this.frames.length; o++) {
        let h = this.frames[o], m = this.spriteDefinitions[h], p = o / this.frames.length * 100;
        n += `${p}% { background-position: -${m.frame.x}px -${m.frame.y}px; } `, r += m.duration;
      }
      n += "}";
      let a = document.createElement("style");
      a.innerText = n, document.head.appendChild(a), t.style.animation = `animateSprite ${r}ms steps(1) infinite`;
    }
    return t;
  }
}

class u {
  definition;
  image = new Image;
  loadPromise;
  spriteDefinitions = [];
  sprites = [];
  taggedSprites = {};
  loaded = false;
  get count() {
    return this.spriteDefinitions.length;
  }
  constructor(e) {
    this.definition = e;
    Object.entries(e.frames).forEach(([i, t]) => {
      let [, r] = i.match(l) ?? [];
      this.spriteDefinitions[parseInt(r)] = t;
    });
  }
  getImage() {
    return this.image;
  }
  getSprite(e) {
    return this.sprites[e] ?? (this.sprites[e] = new f(this, [e]));
  }
  getTaggedSprite(e) {
    if (this.taggedSprites[e])
      return this.taggedSprites[e];
    let i = this.definition.meta.frameTags.find((t) => t.name === e);
    if (i) {
      let { from: t, to: r } = i, n = Math.sign(r - t) || 1, a = [];
      for (let o = t;o <= r; o += n)
        a.push(o);
      return this.taggedSprites[e] = new f(this, this.calculateFrames(a, i.direction));
    }
    return;
  }
  calculateFrames(e, i) {
    let t = [...e];
    switch (i) {
      case "reverse":
        t.reverse();
        break;
      case "pingpong":
        for (let r = e.length - 2;r >= 1; r--)
          t.push(e[r]);
        break;
      case "pingpong_reverse":
        t.reverse();
        for (let r = 1;r < e.length - 1; r++)
          t.push(e[r]);
        break;
    }
    return t;
  }
  getTags() {
    return this.definition.meta.frameTags;
  }
  async load() {
    if (!this.loadPromise && !this.loaded)
      this.loadPromise = new Promise(async (e, i) => {
        await new Promise((t, r) => {
          this.image = new Image, this.image.onload = () => t(), this.image.onerror = r, this.image.src = this.definition.meta.image;
        }), e(), this.loadPromise = undefined;
      });
    return await this.loadPromise, this;
  }
}
var l = /.*\s(\d+).aseprite/;
async function y(e) {
  return await fetch(e).then((t) => t.json());
}
var d;
((s) => {
  s.NORMAL = "normal";
  s.MULTIPLY = "multiply";
  s.SCREEN = "screen";
  s.OVERLAY = "overlay";
  s.DARKEN = "darken";
  s.LIGHTEN = "lighten";
  s.COLOR_DODGE = "color-dodge";
  s.COLOR_BURN = "color-burn";
  s.HARD_LIGHT = "hard-light";
  s.SOFT_LIGHT = "soft-light";
  s.DIFFERENCE = "difference";
  s.EXCLUSION = "exclusion";
  s.HUE = "hue";
  s.SATURATION = "saturation";
  s.COLOR = "color";
  s.LUMINOSITY = "luminosity";
})(d ||= {});
var b;
((n) => {
  n.FORWARD = "forward";
  n.REVERSE = "reverse";
  n.PINGPONG = "pingpong";
  n.PINGPONG_REVERSE = "pingpong_reverse";
})(b ||= {});

// src/index.ts
var sheet = await new u(await y("random-iso.json")).load();
function generateDivs() {
  const divs = document.createElement("div");
  divs.className = "sprite-sheet";
  for (let i = 0;i < sheet.count; i++) {
    const div = divs.appendChild(sheet.getSprite(i).generateDiv());
    const label = div.appendChild(document.createElement("div"));
    label.style.fontSize = "100px";
    label.textContent = i.toString();
  }
  for (let tag of sheet.getTags()) {
    const div = divs.appendChild(sheet.getTaggedSprite(tag.name).generateDiv());
    const label = div.appendChild(document.createElement("div"));
    label.style.fontSize = "100px";
    label.textContent = tag.name;
    label.style.backgroundColor = tag.color;
  }
  return divs;
}
var divs = generateDivs();
function drawFrame(ctx, index, x, y2) {
  sheet.getSprite(index).draw(ctx, x, y2, 0, 0.3);
  ctx.font = "24px sans-serif";
  ctx.fillText(index.toString(), x, y2 + 24);
}
function makeCanvasFromSprite(sprite, label, color) {
  const canvas = sprite.makeCanvas(0, 0.3);
  canvas.style.width = `${canvas.width / 2}px`;
  canvas.style.height = `${canvas.height / 2}px`;
  sprite.onFrameChange = () => {
    canvas.getContext("2d").font = "24px sans-serif";
    if (color) {
      canvas.getContext("2d").fillStyle = color;
      canvas.getContext("2d").fillRect(0, 0, 100, 30);
    }
    canvas.getContext("2d").fillStyle = "black";
    canvas.getContext("2d").fillText(label, 0, 24);
  };
  return canvas;
}
function makeCanvas(index) {
  return makeCanvasFromSprite(sheet.getSprite(index), index.toString());
}
function makeCanvasFromTag(tag) {
  return makeCanvasFromSprite(sheet.getTaggedSprite(tag), tag, sheet.getTags().find((t) => t.name === tag).color);
}
async function makeBlob(index) {
  return sheet.getSprite(index).makeBlob(0, 0.3);
}
var spriteCount = sheet.count;
var tags = sheet.getTags().map((tag) => tag.name);
export {
  tags,
  spriteCount,
  makeCanvasFromTag,
  makeCanvas,
  makeBlob,
  drawFrame,
  divs
};
