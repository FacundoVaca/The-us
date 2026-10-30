/* The Last of Us: Part II — fan-made mobile & web stealth tribute.
   Original art, code, and audio. No assets from the game are used. */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });
const minimap = document.getElementById('minimap');
const mctx = minimap.getContext('2d');

const ui = {
  menu: document.getElementById('menu'),
  hud: document.getElementById('hud'),
  pause: document.getElementById('pause'),
  end: document.getElementById('end'),
  health: document.getElementById('health-fill'),
  stance: document.getElementById('stance'),
  ammo: document.getElementById('ammo'),
  supplies: document.getElementById('supplies'),
  detection: document.getElementById('detection'),
  toast: document.getElementById('toast'),
  objective: document.getElementById('objective-text'),
  touch: document.getElementById('touch'),
  endEyebrow: document.getElementById('end-eyebrow'),
  endTitle: document.getElementById('end-title'),
  endText: document.getElementById('end-text'),
};

const W = 2600;
const H = 1700;
const EXTRACTION = { x: 2330, y: 560, r: 92 };
const START = { x: 470, y: 900 };

const BUILDINGS = [
  { x: 60, y: 80, w: 520, h: 260, tone: 0 },
  { x: 700, y: 70, w: 360, h: 210, tone: 1 },
  { x: 1170, y: 110, w: 300, h: 190, tone: 2 },
  { x: 1560, y: 80, w: 330, h: 200, tone: 0 },
  { x: 1980, y: 90, w: 540, h: 300, tone: 1 },
  { x: 90, y: 560, w: 300, h: 250, tone: 2 },
  { x: 70, y: 1110, w: 420, h: 330, tone: 0 },
  { x: 620, y: 560, w: 230, h: 180, tone: 1 },
  { x: 960, y: 640, w: 260, h: 200, tone: 2 },
  { x: 1450, y: 560, w: 420, h: 300, tone: 0 },
  { x: 2070, y: 760, w: 380, h: 250, tone: 1 },
  { x: 1180, y: 1110, w: 380, h: 330, tone: 2 },
  { x: 1760, y: 1120, w: 300, h: 300, tone: 0 },
  { x: 300, y: 1470, w: 600, h: 180, tone: 1 },
  { x: 1000, y: 1470, w: 380, h: 170, tone: 2 },
  { x: 2200, y: 1200, w: 300, h: 300, tone: 0 },
  { x: 60, y: 1450, w: 200, h: 200, tone: 2 },
];

const CARS = [
  { x: 820, y: 980, w: 126, h: 54, tone: '#4a4d45' },
  { x: 1180, y: 990, w: 132, h: 54, tone: '#5b4436' },
  { x: 1750, y: 862, w: 122, h: 54, tone: '#394a48' },
  { x: 1990, y: 982, w: 134, h: 54, tone: '#4d4540' },
  { x: 300, y: 986, w: 122, h: 54, tone: '#3c4a3d' },
  { x: 1460, y: 960, w: 118, h: 52, tone: '#4a4038' },
];

const BARRIERS = [
  { x: 1010, y: 875, w: 120, h: 28 },
  { x: 1580, y: 1000, w: 140, h: 28 },
  { x: 2050, y: 640, w: 34, h: 120 },
  { x: 760, y: 1046, w: 34, h: 96 },
  { x: 380, y: 760, w: 120, h: 26 },
];

const CRATES = [
  { x: 1180, y: 860, w: 46, h: 46 },
  { x: 2000, y: 690, w: 52, h: 52 },
  { x: 560, y: 1060, w: 44, h: 44 },
  { x: 1080, y: 480, w: 48, h: 48 },
];

const TREES = [
  [180, 440], [610, 420], [1080, 380], [1490, 420], [1920, 430], [2510, 470],
  [480, 700], [900, 560], [1380, 460], [2020, 500], [2500, 700], [540, 1170],
  [930, 1120], [1420, 1080], [1680, 1050], [1980, 1100], [2450, 1060],
  [140, 1020], [860, 1420], [1540, 1440], [2100, 1500],
];

const FIRES = [
  { x: 640, y: 930 },
  { x: 1870, y: 1030 },
  { x: 2240, y: 520 },
];

const SUPPLIES = [
  { x: 1130, y: 862, taken: false },
  { x: 1560, y: 1042, taken: false },
  { x: 2100, y: 690, taken: false },
  { x: 950, y: 520, taken: false },
];

const ENEMY_DEFS = [
  { path: [[760, 920], [1120, 920], [1120, 1000], [760, 1000]], speed: 54 },
  { path: [[1320, 870], [1670, 870], [1670, 940], [1320, 940]], speed: 60 },
  { path: [[1800, 480], [2050, 480], [2050, 520], [1800, 520]], speed: 50 },
  { path: [[2120, 620], [2230, 620], [2230, 700], [2120, 700]], speed: 52 },
  { path: [[2320, 470], [2390, 470], [2390, 660], [2320, 660]], speed: 46 },
  { path: [[1180, 500], [1480, 500], [1480, 565], [1180, 565]], speed: 56 },
];

const colliders = [
  ...BUILDINGS.map(b => ({ ...b, solid: true })),
  ...CARS.map(c => ({ ...c, solid: true })),
  ...BARRIERS.map(b => ({ ...b, solid: true })),
  ...CRATES.map(c => ({ ...c, solid: true })),
];

const player = {
  x: START.x, y: START.y, r: 14, angle: 0,
  hp: 100, maxHp: 100, speed: 205, sprint: 315, crouchSpeed: 112,
  clip: 6, clipSize: 6, reserve: 18, supplies: 0,
  crouched: false, sprinting: false, reloading: 0, cooldown: 0,
  hurt: 0, footstep: 0, moving: false,
};

const state = {
  mode: 'menu',
  time: 0,
  camera: { x: 0, y: 0 },
  detected: false,
  toastTimer: 0,
  bullets: [],
  particles: [],
  enemies: [],
  rain: [],
  view: { w: 1, h: 1, dpr: 1 },
  rendered: 0,
};

const input = {
  keys: new Set(),
  mouse: { x: 0, y: 0, down: false },
  move: { x: 0, y: 0 },
  axis: { x: 0, y: 0 },
  fireHeld: false,
  crouchBtn: false,
};

const RNG = mulberry32(20200619);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
const dist2 = (ax, ay, bx, by) => (ax - bx) ** 2 + (ay - by) ** 2;
const angleDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function circleHitsRect(x, y, radius, r) {
  const cx = clamp(x, r.x, r.x + r.w);
  const cy = clamp(y, r.y, r.y + r.h);
  return dist2(x, y, cx, cy) < radius * radius;
}

function blockedAt(x, y, radius = 0) {
  if (x < radius || y < radius || x > W - radius || y > H - radius) return true;
  for (const c of colliders) if (circleHitsRect(x, y, radius, c)) return true;
  return false;
}

function moveBody(body, dx, dy) {
  if (dx) {
    const nx = body.x + dx;
    if (!blockedAt(nx, body.y, body.r)) body.x = nx;
  }
  if (dy) {
    const ny = body.y + dy;
    if (!blockedAt(body.x, ny, body.r)) body.y = ny;
  }
  body.x = clamp(body.x, body.r, W - body.r);
  body.y = clamp(body.y, body.r, H - body.r);
}

function segmentBlocked(x1, y1, x2, y2, step = 22) {
  const d = Math.hypot(x2 - x1, y2 - y1);
  const n = Math.max(1, Math.ceil(d / step));
  for (let i = 1; i < n; i++) {
    const x = lerp(x1, x2, i / n);
    const y = lerp(y1, y2, i / n);
    for (const c of colliders) if (pointInRect(x, y, c)) return true;
  }
  return false;
}

function roundRectPath(c, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/* ---------------- Static world ---------------- */

const bg = document.createElement('canvas');
bg.width = W;
bg.height = H;
const bctx = bg.getContext('2d');

function drawStaticWorld() {
  const g = bctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#1a231c');
  g.addColorStop(0.45, '#222a21');
  g.addColorStop(1, '#151d17');
  bctx.fillStyle = g;
  bctx.fillRect(0, 0, W, H);

  // Asphalt road
  const road = bctx.createLinearGradient(0, 800, 0, 1070);
  road.addColorStop(0, '#30322e');
  road.addColorStop(0.5, '#292b28');
  road.addColorStop(1, '#232623');
  bctx.fillStyle = road;
  bctx.fillRect(0, 812, W, 232);

  bctx.fillStyle = '#3a3d37';
  bctx.fillRect(0, 790, W, 22);
  bctx.fillRect(0, 1044, W, 24);
  bctx.fillStyle = 'rgba(10, 13, 10, 0.38)';
  bctx.fillRect(0, 812, W, 5);
  bctx.fillRect(0, 1039, W, 5);

  // Faded lane markings
  for (let x = 0; x < W; x += 150) {
    bctx.fillStyle = `rgba(190, 183, 143, ${0.1 + RNG() * 0.13})`;
    bctx.fillRect(x + 20, 922, 72, 4);
  }

  // Cracks and tar patches
  for (let i = 0; i < 340; i++) {
    const x = RNG() * W;
    const y = 820 + RNG() * 216;
    const len = 8 + RNG() * 42;
    bctx.strokeStyle = `rgba(9, 12, 10, ${0.1 + RNG() * 0.25})`;
    bctx.lineWidth = 0.7 + RNG() * 1.4;
    bctx.beginPath();
    bctx.moveTo(x, y);
    bctx.lineTo(x + len, y + (RNG() - 0.5) * 16);
    bctx.stroke();
  }

  // Puddles
  for (let i = 0; i < 34; i++) {
    const x = 40 + RNG() * (W - 80);
    const y = 828 + RNG() * 198;
    const rx = 18 + RNG() * 62;
    const ry = 4 + RNG() * 14;
    bctx.fillStyle = 'rgba(91, 118, 114, 0.13)';
    bctx.beginPath();
    bctx.ellipse(x, y, rx, ry, RNG() * 1.2, 0, Math.PI * 2);
    bctx.fill();
    bctx.strokeStyle = 'rgba(175, 194, 184, 0.09)';
    bctx.lineWidth = 1;
    bctx.beginPath();
    bctx.ellipse(x - rx * 0.16, y - ry * 0.25, rx * 0.72, ry * 0.48, 0, 0, Math.PI * 2);
    bctx.stroke();
  }

  // Grass and moss patches over every surface
  for (let i = 0; i < 900; i++) {
    const x = RNG() * W;
    const y = RNG() * H;
    if (Math.abs(y - 928) < 80) continue;
    const r = 6 + RNG() * 34;
    bctx.fillStyle = `rgba(${38 + RNG() * 36 | 0}, ${64 + RNG() * 46 | 0}, ${35 + RNG() * 30 | 0}, ${0.08 + RNG() * 0.16})`;
    bctx.beginPath();
    bctx.ellipse(x, y, r, r * (0.35 + RNG() * 0.3), RNG() * Math.PI, 0, Math.PI * 2);
    bctx.fill();
  }

  // Wet leaf litter and debris
  for (let i = 0; i < 620; i++) {
    const x = RNG() * W;
    const y = RNG() * H;
    const warm = RNG() > 0.55;
    bctx.fillStyle = warm
      ? `rgba(${96 + RNG() * 50 | 0}, ${66 + RNG() * 35 | 0}, ${28 + RNG() * 18 | 0}, ${0.16 + RNG() * 0.25})`
      : `rgba(${48 + RNG() * 34 | 0}, ${58 + RNG() * 36 | 0}, ${40 + RNG() * 24 | 0}, ${0.15 + RNG() * 0.22})`;
    bctx.save();
    bctx.translate(x, y);
    bctx.rotate(RNG() * Math.PI * 2);
    bctx.fillRect(-2 - RNG() * 4, -1, 4 + RNG() * 8, 1.5 + RNG() * 2);
    bctx.restore();
  }

  // Sidewalk grates
  for (const [x, y] of [[680, 795], [1350, 795], [1960, 1050], [420, 1050]]) {
    bctx.fillStyle = '#202521';
    bctx.fillRect(x, y, 58, 14);
    bctx.strokeStyle = 'rgba(130, 140, 128, 0.2)';
    bctx.lineWidth = 1;
    for (let k = 0; k < 5; k++) {
      bctx.beginPath();
      bctx.moveTo(x + 6 + k * 11, y + 2);
      bctx.lineTo(x + 6 + k * 11, y + 12);
      bctx.stroke();
    }
  }

  // Buildings
  for (const b of BUILDINGS) drawBuilding(b);

  // Cars
  for (const c of CARS) drawCar(c);

  // Barricades
  for (const b of BARRIERS) drawBarrier(b);

  // Crates
  for (const c of CRATES) drawCrate(c);

  // Trees / overgrowth
  for (const [x, y] of TREES) drawTree(x, y);

  // Barrels under the fire glows
  for (const f of FIRES) drawBarrel(f.x, f.y);

  // Scattered papers and spent casings
  for (let i = 0; i < 220; i++) {
    const x = RNG() * W;
    const y = RNG() * H;
    bctx.fillStyle = `rgba(190, 185, 160, ${0.05 + RNG() * 0.12})`;
    bctx.fillRect(x, y, 2 + RNG() * 5, 1 + RNG() * 2);
  }
}

function drawBuilding(b) {
  const tones = ['#2d352c', '#333a2f', '#28312a'];
  const lit = ['#8d8550', '#6f7d58', '#a37a46'];

  bctx.fillStyle = 'rgba(2, 5, 3, 0.5)';
  bctx.fillRect(b.x + 16, b.y + 20, b.w, b.h);

  const g = bctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
  g.addColorStop(0, tones[b.tone]);
  g.addColorStop(1, '#20261f');
  bctx.fillStyle = g;
  bctx.fillRect(b.x, b.y, b.w, b.h);

  bctx.strokeStyle = 'rgba(160, 168, 150, 0.14)';
  bctx.lineWidth = 5;
  bctx.strokeRect(b.x + 3, b.y + 3, b.w - 6, b.h - 6);

  // Rooftop panels
  const cols = Math.max(2, Math.floor(b.w / 78));
  const rows = Math.max(2, Math.floor(b.h / 64));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = b.x + 16 + c * ((b.w - 32) / cols);
      const y = b.y + 16 + r * ((b.h - 32) / rows);
      const w = (b.w - 32) / cols - 10;
      const h = (b.h - 32) / rows - 10;
      if (RNG() < 0.14) {
        bctx.fillStyle = '#141a14';
        bctx.fillRect(x, y, w, h);
      } else {
        bctx.fillStyle = 'rgba(10, 14, 11, 0.35)';
        bctx.fillRect(x, y, w, h);
        bctx.fillStyle = 'rgba(160, 170, 150, 0.05)';
        bctx.fillRect(x + 2, y + 2, w - 4, 3);
      }
    }
  }

  // Rooftop vents and skylights
  const units = 2 + Math.floor(RNG() * 4);
  for (let i = 0; i < units; i++) {
    const w = 20 + RNG() * 46;
    const h = 16 + RNG() * 34;
    const x = b.x + 24 + RNG() * (b.w - w - 48);
    const y = b.y + 24 + RNG() * (b.h - h - 48);
    bctx.fillStyle = '#1a201b';
    bctx.fillRect(x, y, w, h);
    bctx.fillStyle = 'rgba(150, 158, 140, 0.12)';
    bctx.fillRect(x + 3, y + 3, w - 6, 2);
    if (RNG() > 0.7) {
      bctx.fillStyle = `rgba(190, 150, 70, ${0.1 + RNG() * 0.16})`;
      bctx.fillRect(x + 5, y + h - 6, w - 10, 2);
    }
  }

  // Skylight glass, sometimes catching the grey sky
  for (let i = 0; i < 2; i++) {
    if (RNG() < 0.55) continue;
    const w = 24 + RNG() * 38;
    const h = 18 + RNG() * 26;
    const x = b.x + 20 + RNG() * (b.w - w - 40);
    const y = b.y + 20 + RNG() * (b.h - h - 40);
    bctx.fillStyle = `rgba(120, 145, 142, 0.12)`;
    bctx.fillRect(x, y, w, h);
    bctx.strokeStyle = 'rgba(12, 16, 13, 0.8)';
    bctx.lineWidth = 2;
    bctx.strokeRect(x, y, w, h);
  }

  // Moss and vines crawling over the roof
  for (let i = 0; i < 16; i++) {
    const x = b.x + RNG() * b.w;
    const y = b.y + RNG() * b.h;
    bctx.fillStyle = `rgba(${40 + RNG() * 34 | 0}, ${74 + RNG() * 40 | 0}, ${38 + RNG() * 20 | 0}, ${0.08 + RNG() * 0.15})`;
    bctx.beginPath();
    bctx.ellipse(x, y, 8 + RNG() * 30, 5 + RNG() * 16, RNG() * Math.PI, 0, Math.PI * 2);
    bctx.fill();
  }

  // Edge vines
  bctx.strokeStyle = 'rgba(44, 82, 44, 0.5)';
  for (let i = 0; i < 9; i++) {
    const x = b.x + RNG() * b.w;
    const y = b.y + b.h - 3;
    bctx.lineWidth = 1 + RNG() * 1.4;
    bctx.beginPath();
    bctx.moveTo(x, y);
    bctx.bezierCurveTo(x + 8, y + 18, x - 12, y + 34, x + 6, y + 52 + RNG() * 20);
    bctx.stroke();
  }

  // A few warm lit windows on the roof access hut
  if (b.w > 300 && b.h > 160) {
    const hx = b.x + b.w * 0.62;
    const hy = b.y + b.h * 0.58;
    const hw = 58;
    const hh = 44;
    bctx.fillStyle = '#1a1f19';
    bctx.fillRect(hx, hy, hw, hh);
    bctx.fillStyle = lit[b.tone];
    bctx.globalAlpha = 0.32;
    bctx.fillRect(hx + 8, hy + 10, 13, 10);
    bctx.globalAlpha = 1;
    bctx.strokeStyle = 'rgba(5, 8, 6, 0.7)';
    bctx.lineWidth = 2;
    bctx.strokeRect(hx, hy, hw, hh);
  }
}

function drawCar(c) {
  bctx.save();
  bctx.fillStyle = 'rgba(2, 4, 3, 0.45)';
  roundRectPath(bctx, c.x + 6, c.y + 8, c.w, c.h, 12);
  bctx.fill();

  bctx.fillStyle = c.tone;
  roundRectPath(bctx, c.x, c.y, c.w, c.h, 11);
  bctx.fill();

  bctx.fillStyle = 'rgba(16, 22, 20, 0.85)';
  roundRectPath(bctx, c.x + c.w * 0.22, c.y + 6, c.w * 0.42, c.h - 12, 6);
  bctx.fill();

  bctx.strokeStyle = 'rgba(170, 178, 160, 0.2)';
  bctx.lineWidth = 1.2;
  roundRectPath(bctx, c.x + 2, c.y + 2, c.w - 4, c.h - 4, 9);
  bctx.stroke();

  bctx.fillStyle = '#121614';
  bctx.fillRect(c.x + 12, c.y - 2, 16, 5);
  bctx.fillRect(c.x + 12, c.y + c.h - 3, 16, 5);
  bctx.fillRect(c.x + c.w - 28, c.y - 2, 16, 5);
  bctx.fillRect(c.x + c.w - 28, c.y + c.h - 3, 16, 5);

  if (RNG() > 0.45) {
    bctx.fillStyle = 'rgba(140, 92, 48, 0.22)';
    bctx.beginPath();
    bctx.ellipse(c.x + c.w * 0.6, c.y + c.h * 0.5, c.w * 0.24, c.h * 0.28, 0.4, 0, Math.PI * 2);
    bctx.fill();
  }
  bctx.restore();
}

function drawBarrier(b) {
  bctx.fillStyle = 'rgba(2, 4, 3, 0.4)';
  bctx.fillRect(b.x + 4, b.y + 5, b.w, b.h);
  bctx.fillStyle = '#4a473a';
  bctx.fillRect(b.x, b.y, b.w, b.h);
  bctx.fillStyle = 'rgba(30, 33, 25, 0.6)';
  for (let i = 0; i < b.w; i += 18) bctx.fillRect(b.x + i, b.y + 4, 9, b.h - 8);
  bctx.strokeStyle = 'rgba(190, 180, 130, 0.16)';
  bctx.lineWidth = 1;
  bctx.strokeRect(b.x, b.y, b.w, b.h);
}

function drawCrate(c) {
  bctx.fillStyle = 'rgba(2, 4, 3, 0.4)';
  bctx.fillRect(c.x + 4, c.y + 5, c.w, c.h);
  bctx.fillStyle = '#4a3f2d';
  bctx.fillRect(c.x, c.y, c.w, c.h);
  bctx.strokeStyle = 'rgba(20, 16, 10, 0.7)';
  bctx.lineWidth = 2;
  bctx.strokeRect(c.x + 3, c.y + 3, c.w - 6, c.h - 6);
  bctx.beginPath();
  bctx.moveTo(c.x + 4, c.y + 4);
  bctx.lineTo(c.x + c.w - 4, c.y + c.h - 4);
  bctx.moveTo(c.x + c.w - 4, c.y + 4);
  bctx.lineTo(c.x + 4, c.y + c.h - 4);
  bctx.stroke();
}

function drawTree(x, y) {
  bctx.fillStyle = 'rgba(2, 4, 3, 0.36)';
  bctx.beginPath();
  bctx.ellipse(x + 8, y + 10, 36, 22, 0.4, 0, Math.PI * 2);
  bctx.fill();

  bctx.strokeStyle = '#2b241b';
  bctx.lineWidth = 8;
  bctx.beginPath();
  bctx.moveTo(x, y);
  bctx.lineTo(x + 4, y + 44);
  bctx.stroke();

  for (let i = 0; i < 18; i++) {
    const a = RNG() * Math.PI * 2;
    const d = RNG() * 44;
    const px = x + Math.cos(a) * d;
    const py = y - 6 + Math.sin(a) * d * 0.7;
    const r = 10 + RNG() * 22;
    bctx.fillStyle = `rgba(${30 + RNG() * 36 | 0}, ${62 + RNG() * 48 | 0}, ${31 + RNG() * 30 | 0}, ${0.3 + RNG() * 0.35})`;
    bctx.beginPath();
    bctx.arc(px, py, r, 0, Math.PI * 2);
    bctx.fill();
  }
}

function drawBarrel(x, y) {
  bctx.fillStyle = 'rgba(2, 4, 3, 0.45)';
  bctx.beginPath();
  bctx.ellipse(x + 6, y + 8, 18, 15, 0, 0, Math.PI * 2);
  bctx.fill();
  bctx.fillStyle = '#383328';
  bctx.beginPath();
  bctx.arc(x, y, 16, 0, Math.PI * 2);
  bctx.fill();
  bctx.strokeStyle = 'rgba(150, 135, 95, 0.25)';
  bctx.lineWidth = 2;
  bctx.beginPath();
  bctx.arc(x, y, 12, 0, Math.PI * 2);
  bctx.stroke();
}

drawStaticWorld();

/* ---------------- Resize ---------------- */

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  state.view = { w, h, dpr };
  canvas.width = Math.max(1, Math.floor(w * dpr));
  canvas.height = Math.max(1, Math.floor(h * dpr));
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (state.mode === 'menu') {
    state.camera.x = clamp(1180 - w / 2, 0, Math.max(0, W - w));
    state.camera.y = clamp(830 - h / 2, 0, Math.max(0, H - h));
  }
}

window.addEventListener('resize', resize);
resize();

/* ---------------- Audio (tiny original synth cues) ---------------- */

let audio = null;
function ensureAudio() {
  if (audio) return;
  try {
    audio = new (window.AudioContext || window.webkitAudioContext)();
  } catch { audio = null; }
}
function tone(freq, dur, type = 'sine', gain = 0.05) {
  if (!audio) return;
  const t = audio.currentTime;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(audio.destination);
  osc.start(t);
  osc.stop(t + dur);
}

/* ---------------- Game setup ---------------- */

function makeEnemy(def) {
  const [x, y] = def.path[0];
  return {
    x, y, r: 14, angle: 0, hp: 100, maxHp: 100,
    path: def.path, speed: def.speed, target: 1,
    state: 'patrol', alerted: 0, lost: 0, cooldown: 0,
    wait: 0, stuck: 0, lastX: x, lastY: y, hurt: 0,
    vision: def.vision || 370, fov: def.fov || 1.15,
  };
}

function resetGame() {
  player.x = START.x;
  player.y = START.y;
  player.angle = 0;
  player.hp = player.maxHp;
  player.clip = player.clipSize;
  player.reserve = 18;
  player.supplies = 0;
  player.crouched = false;
  player.sprinting = false;
  player.reloading = 0;
  player.cooldown = 0;
  player.hurt = 0;
  player.footstep = 0;

  state.time = 0;
  state.detected = false;
  state.bullets = [];
  state.particles = [];
  state.enemies = ENEMY_DEFS.map(makeEnemy);
  state.camera.x = clamp(player.x - state.view.w / 2, 0, Math.max(0, W - state.view.w));
  state.camera.y = clamp(player.y - state.view.h / 2, 0, Math.max(0, H - state.view.h));
  for (const s of SUPPLIES) s.taken = false;
  input.fireHeld = false;
  input.crouchBtn = false;
  input.move.x = 0;
  input.move.y = 0;
  input.axis.x = 0;
  input.axis.y = 0;
  ui.health.style.width = '100%';
  ui.objective.textContent = 'Reach the extraction point';
  setStanceUI();
  updateAmmoUI();
  ui.supplies.textContent = '0 SUPPLIES';
}

function startGame() {
  ensureAudio();
  resetGame();
  state.mode = 'playing';
  ui.menu.classList.add('hidden');
  ui.pause.classList.add('hidden');
  ui.end.classList.add('hidden');
  ui.hud.classList.remove('hidden');
  ui.touch.classList.remove('hidden');
  ui.detection.classList.add('hidden');
  document.body.dataset.playing = 'true';
  window.__gameState = 'playing';
  showToast('Move quietly. Reach the extraction point.', 3800);
  tone(110, 0.35, 'sine', 0.035);
}

function pauseGame() {
  if (state.mode !== 'playing') return;
  state.mode = 'paused';
  ui.pause.classList.remove('hidden');
  document.body.dataset.playing = 'paused';
  window.__gameState = 'paused';
}

function resumeGame() {
  if (state.mode !== 'paused') return;
  state.mode = 'playing';
  ui.pause.classList.add('hidden');
  document.body.dataset.playing = 'true';
  window.__gameState = 'playing';
}

function endGame(won) {
  state.mode = won ? 'won' : 'dead';
  document.body.dataset.playing = state.mode;
  window.__gameState = state.mode;
  ui.end.classList.remove('hidden');
  if (won) {
    ui.endEyebrow.textContent = 'EXTRACTION REACHED';
    ui.endTitle.textContent = 'You made it out.';
    ui.endText.textContent = `You carried ${player.supplies} supplies through the patrol. The rain keeps falling on a city that forgot how to be kind.`;
    tone(392, 0.9, 'sine', 0.04);
    setTimeout(() => tone(523, 1.1, 'sine', 0.035), 180);
  } else {
    ui.endEyebrow.textContent = 'YOU DIED';
    ui.endTitle.textContent = 'The city takes another one.';
    ui.endText.textContent = 'Stay crouched behind cover. Let the patrol pass. Try again.';
    tone(82, 1.2, 'sawtooth', 0.03);
  }
}

/* ---------------- UI helpers ---------------- */

let toastTimeout = 0;
function showToast(text, ms = 2600) {
  ui.toast.textContent = text;
  ui.toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => ui.toast.classList.remove('show'), ms);
}

function setStanceUI() {
  if (player.crouched) {
    ui.stance.textContent = 'CROUCHED';
    ui.stance.style.color = '#b9c46a';
  } else if (player.sprinting) {
    ui.stance.textContent = 'SPRINTING';
    ui.stance.style.color = '#d7a17f';
  } else {
    ui.stance.textContent = 'STANDING';
    ui.stance.style.color = '#e7e3d8';
  }
}

function updateAmmoUI() {
  ui.ammo.textContent = `${player.clip} / ${player.reserve}`;
  ui.ammo.style.color = player.clip === 0 ? '#d7896a' : '#e7e3d8';
}

/* ---------------- Input ---------------- */

const MOVE_KEYS = {
  KeyW: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
};

window.addEventListener('keydown', (e) => {
  if (MOVE_KEYS[e.code] || ['Space', 'ShiftLeft', 'ShiftRight', 'KeyC', 'KeyR', 'Escape', 'KeyP'].includes(e.code)) {
    e.preventDefault();
  }
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (state.mode === 'playing') pauseGame();
    else if (state.mode === 'paused') resumeGame();
    return;
  }
  if (state.mode === 'menu' && (e.code === 'Enter' || e.code === 'Space')) {
    startGame();
    return;
  }
  if (state.mode !== 'playing') return;
  input.keys.add(e.code);
  if (e.code === 'KeyC') {
    player.crouched = !player.crouched;
    if (player.crouched) player.sprinting = false;
    setStanceUI();
  }
  if (e.code === 'KeyR') reload();
});

window.addEventListener('keyup', (e) => {
  input.keys.delete(e.code);
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') player.sprinting = false;
});

canvas.addEventListener('pointermove', (e) => {
  input.mouse.x = e.clientX;
  input.mouse.y = e.clientY;
});

canvas.addEventListener('pointerdown', (e) => {
  if (state.mode !== 'playing') return;
  if (e.pointerType === 'mouse') {
    input.mouse.x = e.clientX;
    input.mouse.y = e.clientY;
    input.mouse.down = true;
    input.fireHeld = true;
  }
});

window.addEventListener('pointerup', () => {
  input.mouse.down = false;
  input.fireHeld = false;
  document.querySelectorAll('.touch-btn').forEach(btn => btn.classList.remove('is-down'));
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

/* Virtual joystick */
const joystick = document.getElementById('joystick');
const knob = document.getElementById('knob');
let joyPointer = null;

function updateJoystickFromEvent(e) {
  const rect = joystick.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let dx = e.clientX - cx;
  let dy = e.clientY - cy;
  const max = rect.width * 0.32;
  const len = Math.hypot(dx, dy) || 1;
  if (len > max) { dx = dx / len * max; dy = dy / len * max; }
  input.move.x = dx / max;
  input.move.y = dy / max;
  knob.style.transform = `translate(${dx}px, ${dy}px)`;
}

joystick.addEventListener('pointerdown', (e) => {
  if (state.mode !== 'playing') return;
  e.preventDefault();
  joyPointer = e.pointerId;
  joystick.setPointerCapture(e.pointerId);
  updateJoystickFromEvent(e);
});

joystick.addEventListener('pointermove', (e) => {
  if (joyPointer !== e.pointerId) return;
  e.preventDefault();
  updateJoystickFromEvent(e);
});

function endJoystick(e) {
  if (joyPointer !== e.pointerId) return;
  joyPointer = null;
  input.move.x = 0;
  input.move.y = 0;
  knob.style.transform = 'translate(0px, 0px)';
}
joystick.addEventListener('pointerup', endJoystick);
joystick.addEventListener('pointercancel', endJoystick);

const fireBtn = document.getElementById('btn-fire');
const crouchBtn = document.getElementById('btn-crouch');

fireBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (state.mode !== 'playing') return;
  input.fireHeld = true;
  fireBtn.classList.add('is-down');
});
fireBtn.addEventListener('pointerup', (e) => {
  e.preventDefault();
  input.fireHeld = false;
  fireBtn.classList.remove('is-down');
});
fireBtn.addEventListener('pointercancel', () => {
  input.fireHeld = false;
  fireBtn.classList.remove('is-down');
});

crouchBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (state.mode !== 'playing') return;
  player.crouched = !player.crouched;
  if (player.crouched) player.sprinting = false;
  crouchBtn.classList.toggle('is-down', player.crouched);
  setStanceUI();
});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('resume-btn').addEventListener('click', resumeGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('restart-pause-btn').addEventListener('click', startGame);

/* ---------------- Combat ---------------- */

function reload() {
  if (player.reloading > 0 || player.clip >= player.clipSize || player.reserve <= 0) return;
  player.reloading = 1.05;
  showToast('Reloading…', 900);
  tone(220, 0.05, 'square', 0.02);
}

function nearestEnemy(maxDist = 560) {
  let best = null;
  let bestD = maxDist * maxDist;
  for (const e of state.enemies) {
    if (e.hp <= 0) continue;
    const d = dist2(player.x, player.y, e.x, e.y);
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
}

function aimAngle() {
  const mobileAim = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760;
  if (mobileAim) {
    const target = nearestEnemy(640);
    if (target) return Math.atan2(target.y - player.y, target.x - player.x);
    if (Math.hypot(input.move.x, input.move.y) > 0.1) return Math.atan2(input.move.y, input.move.x);
    return player.angle;
  }
  const sx = player.x - state.camera.x;
  const sy = player.y - state.camera.y;
  return Math.atan2(input.mouse.y - sy, input.mouse.x - sx);
}

function fire() {
  if (state.mode !== 'playing' || player.cooldown > 0 || player.reloading > 0) return;
  if (player.clip <= 0) {
    if (player.reserve > 0) reload();
    else showToast('Out of ammo. Find supplies.', 1500);
    return;
  }
  player.angle = aimAngle();
  player.clip--;
  player.cooldown = 0.2;
  updateAmmoUI();
  const spread = (Math.random() - 0.5) * 0.035;
  const a = player.angle + spread;
  const mx = player.x + Math.cos(a) * 20;
  const my = player.y + Math.sin(a) * 20;
  state.bullets.push({ x: mx, y: my, vx: Math.cos(a) * 1220, vy: Math.sin(a) * 1220, life: 0.72, friendly: true, damage: 52 });
  burst(mx, my, 5, '#ffcf83', 90);
  state.camera.shake = 3;
  tone(130, 0.08, 'square', 0.035);
  if (player.clip === 0 && player.reserve > 0) setTimeout(reload, 140);
  for (const e of state.enemies) {
    if (e.hp > 0 && dist2(e.x, e.y, player.x, player.y) < 620 * 620) alertEnemy(e, 0.7);
  }
}

function explodeEnemyShot(x, y, a) {
  state.bullets.push({
    x, y, vx: Math.cos(a) * 640, vy: Math.sin(a) * 640,
    life: 1.25, friendly: false, damage: 9,
  });
  burst(x, y, 3, '#ff9d5c', 70);
  tone(90, 0.05, 'sawtooth', 0.018);
}

function alertEnemy(e, amount) {
  e.alerted = Math.max(e.alerted, amount);
  if (e.state !== 'chase') {
    e.state = 'chase';
    e.lost = 0;
  }
}

function burst(x, y, n, color, speed) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = speed * (0.3 + Math.random() * 0.7);
    state.particles.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 0.25 + Math.random() * 0.35, max: 0.6,
      color, size: 1 + Math.random() * 2.4,
    });
  }
}

function takeDamage(n) {
  if (state.mode !== 'playing') return;
  player.hp = Math.max(0, player.hp - n);
  player.hurt = 0.35;
  ui.health.style.width = `${(player.hp / player.maxHp) * 100}%`;
  burst(player.x, player.y, 6, '#8e2f2a', 80);
  if (player.hp <= 0) endGame(false);
}

/* ---------------- Update ---------------- */

function update(dt) {
  state.time += dt;

  if (state.mode === 'menu') {
    state.camera.x = clamp(1180 - state.view.w / 2, 0, Math.max(0, W - state.view.w));
    state.camera.y = clamp(830 - state.view.h / 2, 0, Math.max(0, H - state.view.h));
    updateParticles(dt);
    updateRain(dt);
    return;
  }

  if (state.mode === 'paused' || state.mode === 'won' || state.mode === 'dead') {
    updateRain(dt);
    return;
  }

  if (state.mode !== 'playing') return;

  // Movement
  let mx = 0;
  let my = 0;
  if (input.keys.has('KeyW') || input.keys.has('ArrowUp')) my -= 1;
  if (input.keys.has('KeyS') || input.keys.has('ArrowDown')) my += 1;
  if (input.keys.has('KeyA') || input.keys.has('ArrowLeft')) mx -= 1;
  if (input.keys.has('KeyD') || input.keys.has('ArrowRight')) mx += 1;
  mx += input.move.x;
  my += input.move.y;
  const mag = Math.hypot(mx, my);
  if (mag > 1) { mx /= mag; my /= mag; }
  player.moving = mag > 0.06;

  const sprintKey = input.keys.has('ShiftLeft') || input.keys.has('ShiftRight');
  player.sprinting = sprintKey && !player.crouched && player.moving;
  const speed = player.crouched ? player.crouchSpeed : player.sprinting ? player.sprint : player.speed;
  if (player.moving) {
    moveBody(player, mx * speed * dt, my * speed * dt);
    player.footstep += dt * (player.sprinting ? 10 : player.crouched ? 3 : 6);
    if (player.footstep > 1) {
      player.footstep = 0;
      if (!player.crouched) {
        state.particles.push({
          x: player.x + (Math.random() - 0.5) * 10, y: player.y + 8,
          vx: (Math.random() - 0.5) * 18, vy: (Math.random() - 0.5) * 18,
          life: 0.4, max: 0.4, color: 'rgba(150,155,135,0.3)', size: 1.4,
        });
      }
    }
  }
  setStanceUI();

  if (player.cooldown > 0) player.cooldown -= dt;
  if (player.hurt > 0) player.hurt -= dt;
  if (player.reloading > 0) {
    player.reloading -= dt;
    if (player.reloading <= 0) {
      const need = player.clipSize - player.clip;
      const take = Math.min(need, player.reserve);
      player.clip += take;
      player.reserve -= take;
      updateAmmoUI();
      tone(300, 0.05, 'square', 0.02);
    }
  }

  if (input.fireHeld) fire();

  // Supplies
  for (const s of SUPPLIES) {
    if (s.taken) continue;
    if (dist2(player.x, player.y, s.x, s.y) < 34 * 34) {
      s.taken = true;
      player.supplies++;
      player.reserve = Math.min(36, player.reserve + 6);
      ui.supplies.textContent = `${player.supplies} SUPPLIES`;
      updateAmmoUI();
      showToast('Supplies recovered. +6 rounds.', 1800);
      burst(s.x, s.y, 10, '#b9c46a', 90);
      tone(520, 0.12, 'sine', 0.025);
    }
  }

  // Player bullets
  for (const b of state.bullets) {
    if (!b.friendly) continue;
    const steps = Math.max(1, Math.ceil(Math.hypot(b.vx, b.vy) * dt / 12));
    for (let i = 0; i < steps && b.life > 0; i++) {
      b.x += (b.vx * dt) / steps;
      b.y += (b.vy * dt) / steps;
      b.life -= dt / steps;
      if (blockedAt(b.x, b.y, 1)) {
        burst(b.x, b.y, 4, '#a89f7d', 70);
        b.life = 0;
        break;
      }
      for (const e of state.enemies) {
        if (e.hp <= 0) continue;
        if (dist2(b.x, b.y, e.x, e.y) < (e.r + 4) ** 2) {
          e.hp -= b.damage;
          e.hurt = 0.3;
          alertEnemy(e, 1);
          burst(b.x, b.y, 8, '#8e2f2a', 110);
          b.life = 0;
          tone(70, 0.1, 'sawtooth', 0.02);
          break;
        }
      }
    }
  }

  // Enemy AI
  let anyDetected = false;
  for (const e of state.enemies) {
    if (e.hp <= 0) continue;
    if (e.hurt > 0) e.hurt -= dt;
    if (e.cooldown > 0) e.cooldown -= dt;

    const d = Math.hypot(player.x - e.x, player.y - e.y);
    const toPlayer = Math.atan2(player.y - e.y, player.x - e.x);
    const inFov = Math.abs(angleDiff(toPlayer, e.angle)) < e.fov / 2;
    const effectiveRange = e.vision * (player.crouched ? 0.58 : player.sprinting ? 1.22 : 1);
    const canSee = d < effectiveRange && inFov && !segmentBlocked(e.x, e.y, player.x, player.y);

    if (canSee) {
      alertEnemy(e, 1);
      e.lost = 0;
    }

    if (e.state === 'chase') {
      anyDetected = true;
      if (!canSee) e.lost += dt;
      else e.lost = 0;
      if (e.lost > 5) {
        e.state = 'patrol';
        e.alerted = 0;
        e.wait = 0.8;
      }

      if (d > 42) {
        const a = Math.atan2(player.y - e.y, player.x - e.x);
        e.angle = lerpAngle(e.angle, a, 8 * dt);
        const sp = e.speed * 1.85;
        moveBody(e, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt);
      } else if (e.cooldown <= 0) {
        e.cooldown = 1.15;
        takeDamage(18);
        tone(95, 0.12, 'sawtooth', 0.03);
      }

      if (canSee && d > 120 && d < 520 && e.cooldown <= 0) {
        e.cooldown = 1.35 + Math.random() * 0.7;
        e.angle = lerpAngle(e.angle, toPlayer, 1);
        explodeEnemyShot(e.x + Math.cos(e.angle) * 18, e.y + Math.sin(e.angle) * 18, e.angle + (Math.random() - 0.5) * 0.18);
      }
      continue;
    }

    // Patrol
    if (e.wait > 0) {
      e.wait -= dt;
      continue;
    }
    const [tx, ty] = e.path[e.target];
    const td = Math.hypot(tx - e.x, ty - e.y);
    if (td < 14) {
      e.target = (e.target + 1) % e.path.length;
      e.wait = 0.4 + Math.random() * 1.2;
      continue;
    }
    const a = Math.atan2(ty - e.y, tx - e.x);
    e.angle = lerpAngle(e.angle, a, 5 * dt);
    const beforeX = e.x;
    const beforeY = e.y;
    moveBody(e, Math.cos(a) * e.speed * dt, Math.sin(a) * e.speed * dt);
    if (Math.hypot(e.x - beforeX, e.y - beforeY) < 0.1) {
      e.stuck += dt;
      if (e.stuck > 1.2) {
        e.target = (e.target + 1) % e.path.length;
        e.wait = 0.3;
        e.stuck = 0;
      }
    } else {
      e.stuck = 0;
    }
  }

  state.detected = anyDetected;
  ui.detection.classList.toggle('hidden', !anyDetected);

  // Enemy bullets
  for (const b of state.bullets) {
    if (b.friendly) continue;
    const steps = Math.max(1, Math.ceil(Math.hypot(b.vx, b.vy) * dt / 10));
    for (let i = 0; i < steps && b.life > 0; i++) {
      b.x += (b.vx * dt) / steps;
      b.y += (b.vy * dt) / steps;
      b.life -= dt / steps;
      if (blockedAt(b.x, b.y, 1)) {
        burst(b.x, b.y, 3, '#9d9277', 60);
        b.life = 0;
        break;
      }
      if (dist2(b.x, b.y, player.x, player.y) < (player.r + 4) ** 2) {
        takeDamage(b.damage);
        b.life = 0;
        break;
      }
    }
  }
  state.bullets = state.bullets.filter(b => b.life > 0 && b.x > -50 && b.x < W + 50 && b.y > -50 && b.y < H + 50);

  updateParticles(dt);
  updateRain(dt);

  // Camera
  const targetX = clamp(player.x - state.view.w / 2, 0, Math.max(0, W - state.view.w));
  const targetY = clamp(player.y - state.view.h / 2, 0, Math.max(0, H - state.view.h));
  const follow = 1 - Math.pow(0.001, dt);
  state.camera.x = lerp(state.camera.x, targetX, follow);
  state.camera.y = lerp(state.camera.y, targetY, follow);

  // Extraction
  const ex = EXTRACTION.x;
  const ey = EXTRACTION.y;
  if (dist2(player.x, player.y, ex, ey) < EXTRACTION.r * EXTRACTION.r) {
    endGame(true);
  }

  // Objective hint
  const dEx = Math.hypot(player.x - ex, player.y - ey);
  if (dEx < 500) ui.objective.textContent = 'The extraction point is close';
  else if (player.supplies >= 2) ui.objective.textContent = 'Reach the extraction point';
  else ui.objective.textContent = `Reach the extraction point · ${Math.round(dEx)}m`;
}

function lerpAngle(a, b, t) {
  return a + angleDiff(b, a) * Math.min(1, t);
}

function updateParticles(dt) {
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.94;
    p.vy *= 0.94;
    p.life -= dt;
  }
  state.particles = state.particles.filter(p => p.life > 0);
}

function updateRain(dt) {
  if (state.rain.length === 0) {
    for (let i = 0; i < 240; i++) {
      state.rain.push({ x: Math.random(), y: Math.random(), z: 0.35 + Math.random() * 0.9, len: 8 + Math.random() * 22 });
    }
  }
  for (const r of state.rain) {
    r.y += dt * (0.22 + r.z * 0.5);
    r.x += dt * 0.045;
    if (r.y > 1.05 || r.x > 1.05) {
      r.y = -0.05 - Math.random() * 0.1;
      r.x = Math.random();
      r.z = 0.35 + Math.random() * 0.9;
    }
  }
}

/* ---------------- Render ---------------- */

function render() {
  const { w, h, dpr } = state.view;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const cam = state.camera;
  const sx = clamp(cam.x, 0, Math.max(0, W - w));
  const sy = clamp(cam.y, 0, Math.max(0, H - h));
  ctx.drawImage(bg, sx, sy, Math.min(w, W), Math.min(h, H), 0, 0, Math.min(w, W), Math.min(h, H));

  ctx.save();
  ctx.translate(-sx, -sy);

  drawExtraction();
  drawFires();
  drawSupplies();
  drawEnemyVision();
  drawEnemies();
  if (state.mode !== 'menu' && state.mode !== 'dead') drawPlayer();
  drawBullets();
  drawParticles();
  drawRain();
  ctx.restore();

  drawScreenLighting(w, h);

  if (state.mode !== 'menu') drawMinimap();

  state.rendered++;
  if (state.rendered >= 3 && !window.__gameReady) {
    window.__gameReady = true;
    canvas.dataset.ready = 'true';
    document.body.dataset.ready = 'true';
  }
  if (state.mode === 'playing') {
    window.__gameState = 'playing';
  }
}

function drawExtraction() {
  const pulse = (Math.sin(state.time * 2.2) + 1) / 2;
  const { x, y, r } = EXTRACTION;
  const g = ctx.createRadialGradient(x, y, 10, x, y, r + 30);
  g.addColorStop(0, 'rgba(185, 196, 106, 0.16)');
  g.addColorStop(0.6, 'rgba(185, 196, 106, 0.07)');
  g.addColorStop(1, 'rgba(185, 196, 106, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r + 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(210, 218, 160, ${0.28 + pulse * 0.3})`;
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(225, 229, 198, 0.8)';
  ctx.font = '600 13px "Helvetica Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '4px';
  ctx.fillText('EXTRACTION', x, y - r - 16);

  // Smoke flare
  for (let i = 0; i < 4; i++) {
    const t = (state.time * 0.35 + i * 0.25) % 1;
    ctx.fillStyle = `rgba(185, 196, 106, ${0.18 * (1 - t)})`;
    ctx.beginPath();
    ctx.arc(x + Math.sin(t * 6 + i) * 8, y - t * 40, 5 + t * 14, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFires() {
  for (const f of FIRES) {
    const flicker = 0.75 + Math.sin(state.time * 11 + f.x) * 0.14 + Math.sin(state.time * 23 + f.y) * 0.08;
    const g = ctx.createRadialGradient(f.x, f.y, 4, f.x, f.y, 105);
    g.addColorStop(0, `rgba(255, 170, 76, ${0.26 * flicker})`);
    g.addColorStop(0.4, `rgba(214, 102, 42, ${0.12 * flicker})`);
    g.addColorStop(1, 'rgba(214, 102, 42, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 105, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 196, 104, ${0.55 + flicker * 0.25})`;
    ctx.beginPath();
    ctx.ellipse(f.x, f.y - 4, 7 * flicker, 12 * flicker, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 232, 160, ${0.5 * flicker})`;
    ctx.beginPath();
    ctx.ellipse(f.x, f.y - 2, 3 * flicker, 6 * flicker, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSupplies() {
  for (const s of SUPPLIES) {
    if (s.taken) continue;
    const bob = Math.sin(state.time * 2.4 + s.x) * 3;
    ctx.save();
    ctx.translate(s.x, s.y + bob);
    ctx.fillStyle = 'rgba(185, 196, 106, 0.16)';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(210, 218, 160, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#b9c46a';
    ctx.fillRect(-4, -6, 8, 12);
    ctx.fillRect(-6, -4, 12, 8);
    ctx.restore();
  }
}

function drawEnemyVision() {
  for (const e of state.enemies) {
    if (e.hp <= 0) continue;
    const chasing = e.state === 'chase';
    const range = e.vision * (player.crouched ? 0.58 : player.sprinting ? 1.22 : 1);
    const grad = ctx.createRadialGradient(e.x, e.y, 12, e.x, e.y, range);
    if (chasing) {
      grad.addColorStop(0, 'rgba(168, 62, 48, 0.18)');
      grad.addColorStop(1, 'rgba(168, 62, 48, 0)');
    } else {
      grad.addColorStop(0, 'rgba(196, 180, 120, 0.09)');
      grad.addColorStop(1, 'rgba(196, 180, 120, 0)');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(e.x, e.y);
    ctx.arc(e.x, e.y, range, e.angle - e.fov / 2, e.angle + e.fov / 2);
    ctx.closePath();
    ctx.fill();
  }
}

function drawEnemies() {
  for (const e of state.enemies) {
    if (e.hp <= 0) continue;
    ctx.save();
    ctx.translate(e.x, e.y);

    ctx.fillStyle = 'rgba(3, 5, 4, 0.45)';
    ctx.beginPath();
    ctx.ellipse(3, 7, 17, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(e.angle);
    // legs
    ctx.fillStyle = '#2f332b';
    ctx.fillRect(-7, -10, 11, 7);
    ctx.fillRect(-7, 3, 11, 7);
    // torso
    ctx.fillStyle = e.state === 'chase' ? '#6f3a2c' : '#4c4332';
    roundRectPath(ctx, -8, -9, 19, 18, 6);
    ctx.fill();
    // backpack
    ctx.fillStyle = '#2b3027';
    ctx.fillRect(-14, -7, 8, 14);
    // head
    ctx.fillStyle = '#a98a6d';
    ctx.beginPath();
    ctx.arc(9, 0, 6.5, 0, Math.PI * 2);
    ctx.fill();
    // hair
    ctx.fillStyle = '#2b241c';
    ctx.beginPath();
    ctx.arc(7, 0, 6.6, Math.PI * 0.55, Math.PI * 1.45);
    ctx.fill();
    // rifle
    ctx.fillStyle = '#161915';
    ctx.fillRect(8, -1.6, 23, 3.4);
    ctx.restore();

    // health pip when hurt
    if (e.hp < e.maxHp) {
      const w = 30;
      ctx.fillStyle = 'rgba(5, 8, 6, 0.7)';
      ctx.fillRect(e.x - w / 2, e.y - 27, w, 3);
      ctx.fillStyle = '#b45f3c';
      ctx.fillRect(e.x - w / 2, e.y - 27, w * (e.hp / e.maxHp), 3);
    }
    // alert marker
    if (e.state === 'chase') {
      ctx.fillStyle = 'rgba(220, 150, 120, 0.9)';
      ctx.font = 'bold 16px "Helvetica Neue", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', e.x, e.y - 34);
    }
  }
}

function drawPlayer() {
  const p = player;
  ctx.save();
  ctx.translate(p.x, p.y);

  // flashlight / aim cone
  const cone = ctx.createRadialGradient(0, 0, 14, 0, 0, 185);
  cone.addColorStop(0, 'rgba(220, 224, 198, 0.08)');
  cone.addColorStop(1, 'rgba(220, 224, 198, 0)');
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, 185, p.angle - 0.24, p.angle + 0.24);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(3, 5, 4, 0.5)';
  ctx.beginPath();
  ctx.ellipse(3, 8, 18, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(p.angle);

  // legs
  ctx.fillStyle = '#2a2f2a';
  const stride = p.moving ? Math.sin(state.time * 12) * 5 : 0;
  ctx.fillRect(-8, -11 + stride * 0.3, 13, 7);
  ctx.fillRect(-8, 4 - stride * 0.3, 13, 7);
  // backpack
  ctx.fillStyle = '#3a3a2e';
  roundRectPath(ctx, -17, -8, 11, 16, 4);
  ctx.fill();
  // torso
  ctx.fillStyle = p.hurt > 0 ? '#7d3c33' : '#4d5843';
  roundRectPath(ctx, -9, -10, 20, 20, 7);
  ctx.fill();
  // shoulder strap
  ctx.strokeStyle = 'rgba(30, 30, 23, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.lineTo(8, 8);
  ctx.stroke();
  // arms
  ctx.fillStyle = '#5d6650';
  ctx.fillRect(4, -7, 13, 5);
  ctx.fillRect(4, 2, 13, 5);
  // head
  ctx.fillStyle = '#c2a183';
  ctx.beginPath();
  ctx.arc(10, 0, 7.4, 0, Math.PI * 2);
  ctx.fill();
  // hair
  ctx.fillStyle = '#4a3526';
  ctx.beginPath();
  ctx.arc(8, 0, 7.5, Math.PI * 0.52, Math.PI * 1.48);
  ctx.fill();
  // weapon
  ctx.fillStyle = '#151814';
  ctx.fillRect(9, -1.7, 30, 3.4);
  ctx.fillStyle = '#3a2f24';
  ctx.fillRect(14, -3.2, 9, 6.4);
  // muzzle flash
  if (p.cooldown > 0.13) {
    ctx.fillStyle = 'rgba(255, 214, 140, 0.9)';
    ctx.beginPath();
    ctx.moveTo(39, 0);
    ctx.lineTo(49, -5);
    ctx.lineTo(46, 0);
    ctx.lineTo(49, 5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawBullets() {
  for (const b of state.bullets) {
    const a = Math.atan2(b.vy, b.vx);
    ctx.strokeStyle = b.friendly ? 'rgba(255, 222, 160, 0.95)' : 'rgba(255, 145, 90, 0.95)';
    ctx.lineWidth = b.friendly ? 2 : 1.6;
    ctx.beginPath();
    ctx.moveTo(b.x - Math.cos(a) * 14, b.y - Math.sin(a) * 14);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawRain() {
  const { w, h } = state.view;
  const cam = state.camera;
  ctx.save();
  ctx.strokeStyle = 'rgba(194, 208, 200, 0.16)';
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  for (const r of state.rain) {
    const x = r.x * (w + 200) - 100 + (cam.x * 0.02) % 50;
    const y = r.y * (h + 200) - 100;
    ctx.globalAlpha = 0.35 + r.z * 0.55;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3.5 * r.z, y + r.len * r.z);
    ctx.stroke();
  }
  ctx.restore();
}

function drawScreenLighting(w, h) {
  const time = state.time;
  // soft overcast light shafts
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const shaft = ctx.createLinearGradient(w * 0.15, 0, w * 0.7, h);
  shaft.addColorStop(0, 'rgba(156, 174, 148, 0.055)');
  shaft.addColorStop(0.5, 'rgba(156, 174, 148, 0.012)');
  shaft.addColorStop(1, 'rgba(156, 174, 148, 0)');
  ctx.fillStyle = shaft;
  ctx.fillRect(0, 0, w, h);

  // fire warmth on screen edge when near a barrel
  for (const f of FIRES) {
    const fx = f.x - state.camera.x;
    const fy = f.y - state.camera.y;
    if (fx < -200 || fy < -200 || fx > w + 200 || fy > h + 200) continue;
    const g = ctx.createRadialGradient(fx, fy, 20, fx, fy, 260);
    g.addColorStop(0, `rgba(255, 154, 74, ${0.06 + Math.sin(time * 11 + f.x) * 0.012})`);
    g.addColorStop(1, 'rgba(255, 154, 74, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  if (player.hurt > 0 && state.mode !== 'menu') {
    ctx.fillStyle = `rgba(120, 20, 16, ${player.hurt * 0.35})`;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawMinimap() {
  const size = minimap.width;
  mctx.clearRect(0, 0, size, size);
  mctx.fillStyle = 'rgba(8, 12, 9, 0.9)';
  mctx.fillRect(0, 0, size, size);

  const pad = 6;
  const scale = Math.min((size - pad * 2) / W, (size - pad * 2) / H);
  const ox = (size - W * scale) / 2;
  const oy = (size - H * scale) / 2;
  const mapX = x => ox + x * scale;
  const mapY = y => oy + y * scale;

  mctx.fillStyle = 'rgba(78, 82, 70, 0.5)';
  mctx.fillRect(mapX(0), mapY(812), W * scale, 232 * scale);

  mctx.fillStyle = 'rgba(120, 132, 112, 0.35)';
  for (const b of BUILDINGS) mctx.fillRect(mapX(b.x), mapY(b.y), b.w * scale, b.h * scale);

  mctx.fillStyle = 'rgba(185, 196, 106, 0.9)';
  mctx.beginPath();
  mctx.arc(mapX(EXTRACTION.x), mapY(EXTRACTION.y), 3.5, 0, Math.PI * 2);
  mctx.fill();

  for (const e of state.enemies) {
    if (e.hp <= 0) continue;
    mctx.fillStyle = e.state === 'chase' ? '#d1674a' : 'rgba(211, 167, 120, 0.85)';
    mctx.beginPath();
    mctx.arc(mapX(e.x), mapY(e.y), 2.2, 0, Math.PI * 2);
    mctx.fill();
  }

  mctx.fillStyle = '#f0ecdf';
  mctx.beginPath();
  mctx.arc(mapX(player.x), mapY(player.y), 3, 0, Math.PI * 2);
  mctx.fill();
  mctx.strokeStyle = 'rgba(240, 236, 223, 0.4)';
  mctx.lineWidth = 1;
  mctx.beginPath();
  mctx.moveTo(mapX(player.x), mapY(player.y));
  mctx.lineTo(mapX(player.x) + Math.cos(player.angle) * 8, mapY(player.y) + Math.sin(player.angle) * 8);
  mctx.stroke();

  mctx.strokeStyle = 'rgba(231, 227, 216, 0.18)';
  mctx.strokeRect(0.5, 0.5, size - 1, size - 1);
}

/* ---------------- Loop ---------------- */

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

// Let the browser paint the title world first, then begin.
document.body.dataset.ready = 'false';
window.__gameReady = false;
window.__gameState = 'menu';
requestAnimationFrame(frame);

// expose for capture/debug without changing gameplay
window.__tlou = { state, player, startGame, pauseGame, resumeGame };
