// ../dist/index.js
class p {
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
  draw(e, i, t, n = 0, r = 1) {
    let o = this.getSpriteDefinition(n), { x: s, y: m, w: a, h } = o.frame;
    e.drawImage(this.spriteSheet.getImage(), s, m, a, h, i, t, a * r, h * r);
  }
  makeCanvas(e = 0, i = 1) {
    let { w: t, h: n } = this.getSpriteDefinition(e).frame, r = document.createElement("canvas"), o = r.getContext("2d");
    if (r.classList.add("sprite-canvas"), r.width = t * i, r.height = n * i, this.draw(o, 0, 0, e, i), this.onFrameChange?.(e), this.frames.length > 1) {
      let s = performance.now(), m = this.spriteDefinitions[this.frames[e]], a = () => {
        let c = performance.now() - s, f = Math.floor(c / m.duration) % this.frames.length;
        o.clearRect(0, 0, r.width, r.height), this.draw(o, 0, 0, f, i), this.onFrameChange?.(f), requestAnimationFrame(a);
      };
      a();
    }
    return r;
  }
  async makeBlob(e, i = 1) {
    return new Promise((t) => {
      this.makeCanvas(e, i).toBlob((n) => t(n));
    });
  }
  generateDiv(e = 0) {
    let i = this.getSpriteDefinition(e), t = document.createElement("div");
    if (t.classList.add("sprite"), t.style.backgroundImage = `url(${this.spriteSheet.definition.meta.image})`, t.style.backgroundPosition = `-${i.frame.x}px -${i.frame.y}px`, t.style.minWidth = `${i.frame.w}px`, t.style.minHeight = `${i.frame.h}px`, t.style.backgroundSize = `${this.spriteSheet.definition.meta.size.w}px ${this.spriteSheet.definition.meta.size.h}px`, this.frames.length > 1) {
      let n = 0, r = "@keyframes animateSprite {";
      for (let s = 0;s < this.frames.length; s++) {
        let m = this.frames[s], a = this.spriteDefinitions[m], h = s / this.frames.length * 100;
        r += `${h}% { background-position: -${a.frame.x}px -${a.frame.y}px; } `, n += a.duration;
      }
      r += "}", console.log(r);
      let o = document.createElement("style");
      o.innerText = r, document.head.appendChild(o), t.style.animation = `animateSprite ${n}ms steps(1) infinite`;
    }
    return t;
  }
}

class d {
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
      let [, n] = i.match(g) ?? [];
      this.spriteDefinitions[parseInt(n)] = t;
    });
  }
  getImage() {
    return this.image;
  }
  getSprite(e) {
    return this.sprites[e] ?? (this.sprites[e] = new p(this, [e]));
  }
  getTaggedSprite(e) {
    if (this.taggedSprites[e])
      return this.taggedSprites[e];
    let i = this.definition.meta.frameTags.find((t) => t.name === e);
    if (i) {
      let { from: t, to: n } = i, r = Math.sign(n - t) || 1, o = [];
      for (let s = t;s <= n; s += r)
        o.push(s);
      return this.taggedSprites[e] = new p(this, this.calculateFrames(o, i.direction));
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
        for (let n = e.length - 2;n >= 1; n--)
          t.push(e[n]);
        break;
      case "pingpong_reverse":
        t.reverse();
        for (let n = 1;n < e.length - 1; n++)
          t.push(e[n]);
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
        await new Promise((t, n) => {
          this.image = new Image, this.image.onload = () => t(), this.image.onerror = n, this.image.src = this.definition.meta.image;
        }), e(), this.loadPromise = undefined;
      });
    return await this.loadPromise, this;
  }
}
var g = /.*\s(\d+).aseprite/;
async function S(e) {
  return await fetch(e).then((t) => t.json());
}

// src/index.ts
var sheet = await new d(await S("random-iso.json")).load();
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
function drawFrame(ctx, index, x, y) {
  sheet.getSprite(index).draw(ctx, x, y, 0, 0.3);
  ctx.font = "24px sans-serif";
  ctx.fillText(index.toString(), x, y + 24);
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
