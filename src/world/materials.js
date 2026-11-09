import * as THREE from 'three'

// Deterministic PRNG so the kingdom looks identical on every load.
export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function canvasTex(size, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d'), size)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat[0], repeat[1])
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function brickDraw(rows, cols, hue) {
  return (g, S) => {
    const r = rng(7 + rows * 13 + cols)
    g.fillStyle = '#1d1b19'
    g.fillRect(0, 0, S, S)
    const h = S / rows
    const w = S / cols
    for (let y = 0; y < rows; y++) {
      const off = y % 2 ? w / 2 : 0
      for (let x = -1; x < cols + 1; x++) {
        const l = 36 + r() * 16
        g.fillStyle = `hsl(${hue + r() * 14}, ${4 + r() * 7}%, ${l}%)`
        g.fillRect(x * w + off + 1.5, y * h + 1.5, w - 3, h - 3)
        // soft shading on each stone
        g.fillStyle = 'rgba(0,0,0,0.12)'
        g.fillRect(x * w + off + 1.5, y * h + h - 5, w - 3, 3.5)
      }
    }
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.07)'
      g.fillRect(r() * S, r() * S, 2, 2)
    }
  }
}

let cache
export function getMats() {
  if (cache) return cache
  const brick = canvasTex(256, brickDraw(8, 4, 32))
  const flag = canvasTex(256, brickDraw(4, 4, 36))
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, ...o })
  cache = {
    brick,
    flag,
    stone: std({ map: brick, color: '#b9b4ab', bumpMap: brick, bumpScale: 0.6 }),
    stoneDark: std({ map: brick, color: '#7d7a76', bumpMap: brick, bumpScale: 0.6 }),
    floor: std({ map: flag, color: '#9a958c', bumpMap: flag, bumpScale: 0.5 }),
    rock: std({ color: '#6b6963', flatShading: true }),
    rockDark: std({ color: '#3f3e3b', flatShading: true }),
    snow: std({ color: '#d9dde2', flatShading: true }),
    wood: std({ color: '#5b3d27' }),
    woodDark: std({ color: '#33220f' }),
    woodLight: std({ color: '#7a5636' }),
    slate: std({ color: '#2d3340', flatShading: true }),
    gold: std({ color: '#c9a24a', metalness: 0.85, roughness: 0.32, emissive: '#3a2a08', emissiveIntensity: 0.4 }),
    iron: std({ color: '#2a2b2e', metalness: 0.7, roughness: 0.5 }),
    banner: std({ color: '#1c2a42', side: THREE.DoubleSide }),
    bannerGreen: std({ color: '#243a2c', side: THREE.DoubleSide }),
    carpet: std({ color: '#1a2438', side: THREE.DoubleSide }),
    parchment: std({ color: '#d9c9a0', side: THREE.DoubleSide }),
    leaf: std({ color: '#2d4a2b', flatShading: true }),
    leafDark: std({ color: '#1f3622', flatShading: true }),
    leafLight: std({ color: '#3e5e30', flatShading: true }),
    trunk: std({ color: '#3a2a1c' }),
    flame: new THREE.MeshBasicMaterial({ color: '#ffb347', toneMapped: false }),
    candle: std({ color: '#e8dcc0', emissive: '#ffb347', emissiveIntensity: 0.4 }),
    water: new THREE.MeshStandardMaterial({ color: '#2b4a5e', roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.82 }),
    window: new THREE.MeshBasicMaterial({ color: '#f2b366', toneMapped: false }),
    dark: std({ color: '#0e0d0c' }),
    skin: std({ color: '#d09a74', roughness: 0.8 }),
    leather: std({ color: '#6a4528', roughness: 0.85 }),
    leatherDark: std({ color: '#44291a', roughness: 0.9 }),
    cloak: std({ color: '#5a4a30', roughness: 1, side: THREE.DoubleSide }),
    cloakInner: std({ color: '#2a3524', roughness: 1, side: THREE.DoubleSide }),
    pack: std({ color: '#8a6234', roughness: 0.95 }),
    rune: new THREE.MeshStandardMaterial({ color: '#0e1a1c', emissive: '#7fd8e6', emissiveIntensity: 1.4, toneMapped: false }),
  }
  return cache
}

// Box geometry whose UVs are scaled to world size, so brick textures keep a constant scale on any wall.
const boxCache = new Map()
export function tiledBox(w, h, d, tile = 3) {
  const key = [w, h, d, tile].join('|')
  if (boxCache.has(key)) return boxCache.get(key)
  const g = new THREE.BoxGeometry(w, h, d)
  const uv = g.attributes.uv
  const dims = [
    [d, h], [d, h], // ±x
    [w, d], [w, d], // ±y
    [w, h], [w, h], // ±z
  ]
  for (let face = 0; face < 6; face++) {
    for (let v = 0; v < 4; v++) {
      const i = face * 4 + v
      uv.setXY(i, (uv.getX(i) * dims[face][0]) / tile, (uv.getY(i) * dims[face][1]) / tile)
    }
  }
  boxCache.set(key, g)
  return g
}
