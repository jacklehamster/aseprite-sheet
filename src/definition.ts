export interface SpriteDefinition {
  frame: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  rotated?: boolean;
  trimmed?: boolean;
  spriteSourceSize: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  sourceSize: {
    w: number;
    h: number;
  };
  duration: number;
}

export enum BlendMode {
  NORMAL = "normal",
  MULTIPLY = "multiply",
  SCREEN = "screen",
  OVERLAY = "overlay",
  DARKEN = "darken",
  LIGHTEN = "lighten",
  COLOR_DODGE = "color-dodge",
  COLOR_BURN = "color-burn",
  HARD_LIGHT = "hard-light",
  SOFT_LIGHT = "soft-light",
  DIFFERENCE = "difference",
  EXCLUSION = "exclusion",
  HUE = "hue",
  SATURATION = "saturation",
  COLOR = "color",
  LUMINOSITY = "luminosity",
}

export enum Direction {
  FORWARD = "forward",
  REVERSE = "reverse",
  PINGPONG = "pingpong",
  PINGPONG_REVERSE = "pingpong_reverse",
}

export interface Definition {
  meta: {
    app: string;
    version: string;
    image: string;
    format: string;
    size: {
      w: number;
      h: number;
    };
    scale: string;
    frameTags: {
      name: string;
      from: number;
      to: number;
      direction: Direction;
      color: string;
    }[];
    layers: {
      name: string;
      opacity: number;
      blendMode: BlendMode;
    }[];
    slices: Array<any>;
  },
  frames: {
    [key: string]: SpriteDefinition;
  }
}
