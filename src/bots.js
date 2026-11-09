import * as THREE from 'three'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { damp, dampAngle, std } from './geom.js'
import { glyphTexture } from './paint.js'
import { BALCONY_SPOTS, COPY_SPOTS, LIBRARY_SPOTS, MEETING_SEATS, PANTRY_SPOTS, REC_SPOTS, REST_SPOTS, SECURITY_SPOTS, SERVER_SPOTS, routeThrough, SNACK_SPOTS, VISITORS, WAIT_SPOTS } from './layout.js'

const HIP_STAND = 0.48
const HIP_SIT = 0.4
const HIP_LOW = 0.26

const SKIN = ['#f3c7a8', '#e4aa7e', '#c6885c', '#8f5c40']
const HAIR = {
  musk: '#e7ebf2',
  'grok-bot': '#2c2826',
  'dr-eggbot': '#e6c56a',
  'helios-forge': '#8a4e2a',
  aevum: '#2a2422',
  zaolang: '#3a2a22',
  julang: '#4a3428',
  minisim: '#6a4330',
  quant: '#241f1c',
  linkup: '#3a2c24',
  wavelive: '#5c3b2e',
  vectorbt: '#2e261f',
  'agent-display': '#1f1c1a',
  apscheduler: '#4e3828',
  duckdb: '#3a2e24',
  skfolio: '#2a241f',
  ccxt: '#2c2926',
  cryptofeed: '#3a3028',
  freqtrade: '#6b3a28',
  quantstats: '#2a2228',
  'lightweight-charts': '#7a4e32',
}
const HAIR_STYLE = {
  musk: 'swept',
  'grok-bot': 'crop',
  'dr-eggbot': 'tuft',
  'helios-forge': 'quiff',
  aevum: 'bun',
  zaolang: 'tufts',
  julang: 'side',
  minisim: 'pigtails',
  quant: 'part',
  linkup: 'side',
  wavelive: 'bob',
  vectorbt: 'quiff',
  'agent-display': 'bangs',
  apscheduler: 'crop',
  duckdb: 'cap',
  skfolio: 'part',
  ccxt: 'crop',
  cryptofeed: 'beanie',
  freqtrade: 'curly',
  quantstats: 'part',
  'lightweight-charts': 'bob',
}

const geo = {
  torso: new RoundedBoxGeometry(0.36, 0.32, 0.22, 3, 0.07),
  pelvis: new RoundedBoxGeometry(0.28, 0.1, 0.18, 2, 0.04),
  belt: new RoundedBoxGeometry(0.34, 0.038, 0.2, 2, 0.012),
  collar: new RoundedBoxGeometry(0.22, 0.046, 0.16, 2, 0.014),
  panel: new RoundedBoxGeometry(0.2, 0.18, 0.02, 2, 0.01),
  skull: new THREE.SphereGeometry(0.15, 22, 16),
  neck: new THREE.CylinderGeometry(0.052, 0.058, 0.1, 12),
  ear: new THREE.SphereGeometry(0.045, 10, 8),
  nose: new THREE.SphereGeometry(0.022, 10, 8),
  blush: new THREE.SphereGeometry(0.038, 10, 8),
  hand: new THREE.SphereGeometry(0.042, 12, 10),
  shoulder: new THREE.SphereGeometry(0.055, 12, 10),
  eyeWhite: new THREE.SphereGeometry(0.046, 14, 12),
  iris: new THREE.SphereGeometry(0.025, 12, 10),
  pupil: new THREE.SphereGeometry(0.013, 10, 8),
  glint: new THREE.SphereGeometry(0.008, 8, 6),
  brow: new THREE.BoxGeometry(0.058, 0.013, 0.016),
  mouth: new THREE.TorusGeometry(0.042, 0.008, 6, 14, Math.PI),
  arm: new RoundedBoxGeometry(0.072, 0.26, 0.066, 2, 0.028),
  fore: new RoundedBoxGeometry(0.064, 0.16, 0.06, 2, 0.026),
  thigh: new RoundedBoxGeometry(0.1, 0.22, 0.092, 2, 0.034),
  shin: new RoundedBoxGeometry(0.084, 0.2, 0.078, 2, 0.03),
  shoe: new RoundedBoxGeometry(0.12, 0.06, 0.18, 2, 0.02),
  mug: new THREE.CylinderGeometry(0.026, 0.02, 0.05, 10),
  mugTop: new THREE.CylinderGeometry(0.02, 0.02, 0.01, 10),
  cuff: new THREE.BoxGeometry(0.088, 0.034, 0.08),
  hairCap: new THREE.SphereGeometry(0.15, 16, 12),
  hairBit: new THREE.SphereGeometry(0.07, 12, 10),
  brim: new THREE.BoxGeometry(0.18, 0.022, 0.09),
  band: new THREE.TorusGeometry(0.145, 0.02, 8, 18),
  glasses: new THREE.TorusGeometry(0.064, 0.009, 8, 20),
  glassesSquare: new THREE.TorusGeometry(0.058, 0.009, 6, 4),
  bridge: new THREE.BoxGeometry(0.045, 0.01, 0.01),
  lens: new THREE.BoxGeometry(0.2, 0.046, 0.012),
  hood: new THREE.SphereGeometry(0.13, 14, 12),
  tie: new THREE.BoxGeometry(0.038, 0.15, 0.016),
  knot: new THREE.BoxGeometry(0.052, 0.04, 0.02),
  pocket: new THREE.BoxGeometry(0.05, 0.032, 0.012),
  lapel: new THREE.BoxGeometry(0.05, 0.13, 0.016),
  strap: new THREE.BoxGeometry(0.012, 0.16, 0.012),
  badge: new RoundedBoxGeometry(0.09, 0.11, 0.018, 2, 0.008),
  pin: new THREE.CylinderGeometry(0.034, 0.034, 0.012, 12),
  leaf: new THREE.BoxGeometry(0.07, 0.016, 0.04),
  folderPin: new THREE.BoxGeometry(0.06, 0.045, 0.012),
  watch: new THREE.CylinderGeometry(0.028, 0.028, 0.02, 10),
  pencil: new THREE.CylinderGeometry(0.01, 0.01, 0.14, 6),
  cup: new THREE.CylinderGeometry(0.048, 0.048, 0.03, 12),
  bud: new THREE.SphereGeometry(0.028, 10, 8),
}

const bangTex = glyphTexture('bang')
const checkTex = glyphTexture('check')
const materialCache = new Map()

const scleraMat = std('#f7f4ee', 0.4)
const irisMat = std('#3a2a22', 0.45)
const pupilMat = std('#1a1412', 0.35)
const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false })
const browMat = std('#3a322c', 0.7)
const mouthMat = std('#a85a52', 0.65)
const blushMat = std('#e7a090', 0.9, { transparent: true, opacity: 0.38, depthWrite: false })
const pantsMat = std('#3c4350', 0.94)
const suitPantsMat = std('#6a717c', 0.9)
const shoeMat = std('#2a2724', 0.68, { metalness: 0.06 })
const shirtWhite = std('#f4f1ea', 0.8)
const tieMat = std('#8d3a48', 0.5)
const goldMat = std('#d7b56a', 0.4, { metalness: 0.45 })
const inkMat = std('#241f1a', 0.55)
const lensMat = std('#1c2830', 0.15, { metalness: 0.2, transparent: true, opacity: 0.22, depthWrite: false })
const leafMat = std('#2f6a3c', 0.7)
const sunMat = std('#e2b340', 0.45, { metalness: 0.25 })
const folderMat = std('#d7c49a', 0.8)
const pencilMat = std('#e6c56a', 0.6)
const capBrimMat = std('#c9842a', 0.7)
const mugMat = std('#f4efe6', 0.55)
const coffeeMat = std('#6b3e2a', 0.45)

function sharedMat(hex, roughness = 0.7, extra = {}) {
  const key = [
    hex,
    roughness,
    extra.metalness ?? 0,
    extra.opacity ?? 1,
    extra.transparent ? 1 : 0,
    extra.depthWrite === false ? 0 : 1,
    extra.emissive || '',
    extra.emissiveIntensity || 0,
  ].join('|')
  let material = materialCache.get(key)
  if (!material) {
    material = std(hex, roughness, extra)
    materialCache.set(key, material)
  }
  return material
}

function shadeHex(hex, factor) {
  const color = new THREE.Color(hex)
  color.multiplyScalar(factor)
  return `#${color.getHexString()}`
}

function mesh(geometry, material, shadow = false) {
  const item = new THREE.Mesh(geometry, material)
  item.castShadow = shadow
  item.receiveShadow = shadow
  return item
}

function makeMug() {
  const group = new THREE.Group()
  const cup = mesh(geo.mug, mugMat, true)
  const top = mesh(geo.mugTop, coffeeMat)
  top.position.y = 0.02
  group.add(cup, top)
  group.visible = false
  return group
}

function skinIndex(id) {
  let h = 0
  for (let i = 0; i < id.length; i += 1) h = (h * 33 + id.charCodeAt(i)) >>> 0
  return h % SKIN.length
}

function badgeSprite(texture) {
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(0.34, 0.34, 1)
  sprite.visible = false
  sprite.position.y = 1.05
  sprite.center.set(0.5, 0)
  return sprite
}

function addEye(parent, x, y, z) {
  const eye = new THREE.Group()
  eye.position.set(x, y, z)
  const white = mesh(geo.eyeWhite, scleraMat)
  white.scale.set(1, 1.05, 0.62)
  const iris = mesh(geo.iris, irisMat)
  iris.position.z = 0.026
  const pupil = mesh(geo.pupil, pupilMat)
  pupil.position.z = 0.034
  const glint = mesh(geo.glint, glintMat)
  glint.position.set(0.012, 0.012, 0.04)
  eye.add(white, iris, pupil, glint)
  parent.add(eye)
  return eye
}

function addFace(head, skinMat) {
  const eyeL = addEye(head, -0.06, 0.02, 0.125)
  const eyeR = addEye(head, 0.06, 0.02, 0.125)
  const browL = mesh(geo.brow, browMat)
  browL.position.set(-0.06, 0.088, 0.15)
  browL.rotation.z = -0.16
  const browR = mesh(geo.brow, browMat)
  browR.position.set(0.06, 0.088, 0.15)
  browR.rotation.z = 0.16
  const nose = mesh(geo.nose, skinMat)
  nose.position.set(0, -0.004, 0.155)
  nose.scale.set(0.85, 0.7, 1.1)
  const mouth = mesh(geo.mouth, mouthMat)
  mouth.position.set(0, -0.062, 0.145)
  mouth.rotation.z = Math.PI
  head.add(browL, browR, nose, mouth)
  for (const side of [-1, 1]) {
    const blush = mesh(geo.blush, blushMat)
    blush.position.set(side * 0.092, -0.028, 0.12)
    blush.scale.set(1, 0.62, 0.4)
    head.add(blush)
  }
  return { eyeL, eyeR, browL, browR, mouth }
}

function addHair(head, style, material, def) {
  const group = new THREE.Group()
  const cap = mesh(geo.hairCap, material, true)
  cap.scale.set(1.08, 0.62, 1.06)
  cap.position.set(0, 0.1, -0.02)

  if (style === 'crop' || style === 'part') {
    if (style === 'part') cap.position.x = 0.03
    group.add(cap)
  } else if (style === 'swept') {
    cap.scale.set(1.2, 0.78, 1.16)
    cap.position.set(0.03, 0.13, -0.04)
    const sweep = mesh(geo.hairBit, material, true)
    sweep.scale.set(1.35, 1, 0.85)
    sweep.position.set(0.1, 0.16, 0.02)
    sweep.rotation.z = -0.55
    group.add(cap, sweep)
  } else if (style === 'quiff') {
    const front = mesh(geo.hairBit, material, true)
    front.scale.set(0.9, 1.15, 0.7)
    front.position.set(0, 0.16, 0.05)
    front.rotation.x = -0.4
    group.add(cap, front)
  } else if (style === 'bun') {
    cap.scale.set(1.02, 0.48, 1.02)
    const bun = mesh(geo.hairBit, material, true)
    bun.scale.set(1.15, 1.05, 1.1)
    bun.position.set(0, 0.16, -0.06)
    group.add(cap, bun)
  } else if (style === 'tufts') {
    cap.scale.set(1.02, 0.42, 1.02)
    for (const side of [-1, 1]) {
      const tuft = mesh(geo.hairBit, material, true)
      tuft.scale.set(0.7, 1.05, 0.7)
      tuft.position.set(side * 0.08, 0.18, 0)
      group.add(tuft)
    }
    group.add(cap)
  } else if (style === 'tuft') {
    const tuft = mesh(geo.hairBit, material, true)
    tuft.scale.set(0.7, 0.85, 0.7)
    tuft.position.set(0.02, 0.16, 0.02)
    group.add(tuft)
  } else if (style === 'side') {
    const lock = mesh(geo.hairBit, material, true)
    lock.scale.set(0.7, 1.35, 0.65)
    lock.position.set(0.12, 0.02, 0.02)
    lock.rotation.z = -0.35
    group.add(cap, lock)
  } else if (style === 'bob') {
    cap.scale.set(1.12, 0.78, 1.12)
    cap.position.set(0, 0.06, -0.01)
    group.add(cap)
  } else if (style === 'pigtails') {
    cap.scale.set(1.02, 0.5, 1.02)
    for (const side of [-1, 1]) {
      const tail = mesh(geo.hairBit, material, true)
      tail.scale.set(0.85, 1.1, 0.85)
      tail.position.set(side * 0.14, -0.02, 0)
      group.add(tail)
    }
    group.add(cap)
  } else if (style === 'bangs') {
    const fringe = mesh(geo.hairBit, material, true)
    fringe.scale.set(1.45, 0.42, 0.55)
    fringe.position.set(0, 0.075, 0.1)
    group.add(cap, fringe)
  } else if (style === 'curly') {
    cap.scale.set(1.04, 0.5, 1.04)
    const spots = [[-0.08, 0.14, 0.04], [0.08, 0.15, 0.02], [0, 0.17, -0.04], [0.1, 0.08, -0.06]]
    for (const [x, y, z] of spots) {
      const curl = mesh(geo.hairBit, material, true)
      curl.scale.setScalar(0.72)
      curl.position.set(x, y, z)
      group.add(curl)
    }
    group.add(cap)
  } else if (style === 'cap') {
    const crown = mesh(geo.hairCap, sharedMat(def.color, 0.62), true)
    crown.scale.set(1.1, 0.58, 1.1)
    crown.position.set(0, 0.11, -0.01)
    const brim = mesh(geo.brim, capBrimMat, true)
    brim.position.set(0, 0.06, 0.12)
    group.add(crown, brim)
  } else if (style === 'beanie') {
    const hat = mesh(geo.hairCap, sharedMat(def.color, 0.7), true)
    hat.scale.set(1.12, 0.82, 1.12)
    hat.position.set(0, 0.08, -0.01)
    const fold = mesh(geo.band, sharedMat(shadeHex(def.color, 0.72), 0.75))
    fold.rotation.x = Math.PI / 2
    fold.position.y = 0.02
    group.add(hat, fold)
  } else {
    group.add(cap)
  }
  head.add(group)
}

function addGlasses(head, kind) {
  if (kind === 'bar') {
    const bar = mesh(geo.lens, lensMat)
    bar.position.set(0, 0.028, 0.168)
    const rim = mesh(geo.bridge, goldMat)
    rim.scale.set(4.6, 1, 1)
    rim.position.set(0, 0.05, 0.172)
    head.add(bar, rim)
    return
  }
  const ringGeo = kind === 'square' ? geo.glassesSquare : geo.glasses
  const material = kind === 'gold' ? goldMat : inkMat
  for (const x of [-0.06, 0.06]) {
    const ring = mesh(ringGeo, material)
    ring.position.set(x, 0.02, 0.168)
    head.add(ring)
  }
  const bridge = mesh(geo.bridge, material)
  bridge.position.set(0, 0.02, 0.168)
  head.add(bridge)
}

function addHeadphones(head) {
  const band = mesh(geo.band, inkMat)
  band.rotation.z = Math.PI
  band.rotation.y = Math.PI / 2
  band.position.y = 0.06
  band.scale.set(1.05, 1.15, 1.05)
  head.add(band)
  for (const x of [-0.155, 0.155]) {
    const cup = mesh(geo.cup, inkMat)
    cup.rotation.z = Math.PI / 2
    cup.position.set(x, 0.0, 0)
    head.add(cup)
  }
}

function addLanyard(hips, def) {
  for (const side of [-1, 1]) {
    const strap = mesh(geo.strap, goldMat)
    strap.position.set(side * 0.045, 0.28, 0.1)
    strap.rotation.z = side * 0.22
    hips.add(strap)
  }
  const badge = mesh(geo.badge, goldMat)
  badge.position.set(0, 0.16, 0.13)
  const face = mesh(geo.pocket, sharedMat(def.color, 0.6))
  face.scale.set(1.2, 2.2, 1)
  face.position.set(0, 0.16, 0.142)
  hips.add(badge, face)
}

function addPin(hips, kind) {
  const group = new THREE.Group()
  group.position.set(0.09, 0.24, 0.14)
  if (kind === 'sun') {
    const sun = mesh(geo.pin, sunMat)
    sun.rotation.x = Math.PI / 2
    group.add(sun)
  } else if (kind === 'leaf') {
    const leaf = mesh(geo.leaf, leafMat)
    leaf.rotation.z = 0.5
    group.add(leaf)
  } else if (kind === 'chevron') {
    for (const side of [-1, 1]) {
      const arm = mesh(geo.bridge, goldMat)
      arm.position.set(side * 0.016, 0.01, 0)
      arm.rotation.z = side * -0.7
      arm.scale.set(0.8, 1, 1)
      group.add(arm)
    }
  } else if (kind === 'folder') {
    group.add(mesh(geo.folderPin, folderMat))
  }
  hips.add(group)
}

function addSuit(hips, clothMat) {
  const panel = mesh(geo.panel, shirtWhite)
  panel.scale.set(0.4, 0.95, 1)
  panel.position.set(0, 0.22, 0.125)
  const tie = mesh(geo.tie, tieMat)
  tie.scale.set(1.35, 1.15, 1)
  tie.position.set(0, 0.17, 0.142)
  const knot = mesh(geo.knot, tieMat)
  knot.position.set(0, 0.275, 0.148)
  const pocket = mesh(geo.pocket, goldMat)
  pocket.position.set(0.1, 0.24, 0.14)
  const collar = mesh(geo.collar, shirtWhite)
  collar.scale.set(0.72, 0.7, 0.62)
  collar.position.set(0, 0.37, 0.07)
  hips.add(panel, tie, knot, pocket, collar)
  for (const side of [-1, 1]) {
    const lapel = mesh(geo.lapel, clothMat)
    lapel.position.set(side * 0.07, 0.28, 0.132)
    lapel.rotation.z = side * -0.42
    hips.add(lapel)
  }
}

function addOutfit(hips, head, armL, def, clothMat) {
  const kind = def.accessory
  if (def.outfit === 'jacket') addSuit(hips, clothMat)
  if (kind === 'glasses') addGlasses(head, 'round')
  else if (kind === 'square-glasses' || kind === 'bars') addGlasses(head, 'square')
  else if (kind === 'visor') addGlasses(head, 'gold')
  else if (kind === 'screen-visor') addGlasses(head, 'bar')
  else if (kind === 'headphones') addHeadphones(head)
  else if (kind === 'earpiece') {
    const bud = mesh(geo.bud, goldMat)
    bud.position.set(0.16, 0.0, 0.03)
    head.add(bud)
  } else if (kind === 'antenna') addLanyard(hips, def)
  else if (kind === 'clock') {
    const watch = mesh(geo.watch, goldMat)
    watch.rotation.z = Math.PI / 2
    watch.position.set(0, -0.2, 0.03)
    armL.add(watch)
  } else if (kind === 'stroke') {
    const pencil = mesh(geo.pencil, pencilMat)
    pencil.position.set(0.15, 0.08, 0)
    pencil.rotation.z = -0.55
    const tip = mesh(geo.bud, inkMat)
    tip.scale.setScalar(0.35)
    tip.position.set(0.2, 0.14, 0)
    head.add(pencil, tip)
  } else if (kind === 'sun' || kind === 'leaf' || kind === 'chevron' || kind === 'folder') {
    addPin(hips, kind)
  } else if (kind === 'halo') {
    const panel = mesh(geo.panel, shirtWhite)
    panel.scale.set(0.48, 0.9, 1)
    panel.position.set(0, 0.22, 0.125)
    hips.add(panel)
  } else if (kind === 'arrows') {
    const hood = mesh(geo.hood, clothMat, true)
    hood.position.set(0, 0.34, -0.1)
    hood.scale.set(1.05, 1.05, 0.72)
    const pocket = mesh(geo.panel, sharedMat(shadeHex(def.color, 0.78), 0.9))
    pocket.scale.set(0.7, 0.32, 1)
    pocket.position.set(0, 0.15, 0.125)
    hips.add(hood, pocket)
  }

  if (def.body === 'egg') {
    const band = mesh(geo.collar, goldMat)
    band.position.set(0, 0.34, 0.06)
    hips.add(band)
  } else if (def.outfit !== 'jacket') {
    const band = mesh(geo.collar, sharedMat(shadeHex(def.color, 0.78), 0.86))
    band.position.set(0, 0.34, 0.055)
    hips.add(band)
  }
}

export function createBot(def, place) {
  const root = new THREE.Group()
  root.name = def.id
  root.position.set(place.lounge.x, 0, place.lounge.z)
  root.userData.botId = def.id

  const jacket = def.outfit === 'jacket'
  const clothHex = jacket ? def.accent : def.color
  const clothMat = std(clothHex, jacket ? 0.6 : 0.88, { metalness: jacket ? 0.05 : 0.02 })
  const skinMat = sharedMat(SKIN[skinIndex(def.id)], 0.68, { metalness: 0.02 })
  const hairMat = sharedMat(HAIR[def.id] || '#3a2e28', 0.62)
  const glow = [clothMat]

  const hips = new THREE.Group()
  root.add(hips)

  const pelvis = mesh(geo.pelvis, jacket ? suitPantsMat : pantsMat, true)
  pelvis.position.y = 0.08
  const torso = mesh(geo.torso, clothMat, true)
  torso.position.y = 0.22
  if (def.id === 'musk') torso.scale.x = 1.08
  const belt = mesh(geo.belt, shoeMat)
  belt.position.y = 0.1
  belt.scale.set(1.02, 1, 1.28)
  const neck = mesh(geo.neck, skinMat, true)
  neck.position.y = 0.5
  neck.scale.y = 1.55
  torso.position.y = 0.28
  torso.scale.y = 1.12
  torso.scale.x *= 0.94
  hips.add(pelvis, torso, belt, neck)

  const head = new THREE.Group()
  head.position.y = def.body === 'egg' ? 0.72 : 0.7
  const skull = mesh(geo.skull, skinMat, true)
  head.add(skull)
  for (const side of [-1, 1]) {
    const ear = mesh(geo.ear, skinMat)
    ear.position.set(side * 0.145, 0, 0)
    ear.scale.set(0.5, 0.82, 0.38)
    head.add(ear)
  }
  const face = addFace(head, skinMat)
  addHair(head, HAIR_STYLE[def.id] || 'crop', hairMat, def)
  const headScale = def.body === 'egg' ? 0.9 : 0.8
  if (def.body === 'egg') head.scale.set(headScale, headScale * 1.08, headScale)
  else head.scale.setScalar(def.id === 'musk' ? headScale * 1.04 : headScale)
  hips.add(head)

  const reach = def.id === 'musk' ? 0.23 : 0.2
  function limb(side, y, length, geometry, material) {
    const pivot = new THREE.Group()
    pivot.position.set(side * reach, y, 0)
    const limbMesh = mesh(geometry, material, true)
    limbMesh.position.y = -length / 2
    pivot.add(limbMesh)
    hips.add(pivot)
    return pivot
  }

  const armL = limb(-1, 0.36, 0.26, geo.arm, clothMat)
  const armR = limb(1, 0.36, 0.26, geo.arm, clothMat)
  const cuffMat = jacket ? shirtWhite : sharedMat(shadeHex(clothHex, 0.74), 0.86)
  const elbows = []
  const mugs = []
  for (const arm of [armL, armR]) {
    arm.children[0].scale.y = 0.62
    arm.children[0].position.y = -0.08
    const elbow = new THREE.Group()
    elbow.position.y = -0.17
    const fore = mesh(geo.fore, clothMat, true)
    fore.position.y = -0.08
    const cuff = mesh(geo.cuff, cuffMat)
    cuff.position.y = -0.14
    const hand = mesh(geo.hand, skinMat, true)
    hand.position.set(0, -0.18, 0.02)
    hand.scale.set(0.9, 0.85, 0.8)
    const mug = makeMug()
    mug.position.set(0.02, -0.16, 0.05)
    elbow.add(fore, cuff, hand, mug)
    arm.add(elbow)
    elbows.push(elbow)
    mugs.push(mug)
    const shoulder = mesh(geo.shoulder, clothMat, true)
    shoulder.position.copy(arm.position)
    shoulder.scale.set(0.9, 0.85, 0.9)
    hips.add(shoulder)
  }
  const elbowL = elbows[0]
  const elbowR = elbows[1]
  const mug = mugs[0]

  const folder = mesh(new THREE.BoxGeometry(0.14, 0.035, 0.18), folderMat, true)
  folder.position.set(0.04, -0.16, 0.06)
  folder.visible = false
  elbowR.add(folder)

  const legMat = jacket ? suitPantsMat : pantsMat
  function addLeg(x) {
    const pivot = new THREE.Group()
    pivot.position.set(x, 0.05, 0)
    const thigh = mesh(geo.thigh, legMat, true)
    thigh.position.y = -0.11
    const knee = new THREE.Group()
    knee.position.y = -0.22
    const shin = mesh(geo.shin, legMat, true)
    shin.position.y = -0.1
    const shoe = mesh(geo.shoe, shoeMat, true)
    shoe.position.set(0, -0.2, 0.03)
    knee.add(shin, shoe)
    pivot.add(thigh, knee)
    hips.add(pivot)
    return { pivot, knee }
  }
  const leftLeg = addLeg(-0.09)
  const rightLeg = addLeg(0.09)
  const legL = leftLeg.pivot
  const legR = rightLeg.pivot
  const kneeL = leftLeg.knee
  const kneeR = rightLeg.knee

  addOutfit(hips, head, armL, def, clothMat)

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.34, 0.46, 40),
    new THREE.MeshBasicMaterial({ color: '#1e3d36', side: THREE.DoubleSide, toneMapped: false }),
  )
  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.03
  ring.visible = false
  ring.userData.botId = def.id
  root.add(ring)

  const bang = badgeSprite(bangTex)
  const check = badgeSprite(checkTex)
  bang.userData.botId = def.id
  check.userData.botId = def.id
  hips.add(bang, check)

  const tag = document.createElement('div')
  tag.className = 'tag'
  const nameEl = document.createElement('span')
  nameEl.className = 'tag-name'
  nameEl.textContent = def.name
  const stateEl = document.createElement('span')
  stateEl.className = 'tag-state'
  stateEl.hidden = true
  tag.append(nameEl, stateEl)
  const label = new CSS2DObject(tag)
  label.center.set(0.5, 1)
  label.position.set(0, 1.28, 0)
  label.visible = false
  hips.add(label)

  hips.position.y = place.lounge.low ? HIP_LOW : HIP_SIT
  legL.rotation.x = -1.02
  legR.rotation.x = -1.02
  kneeL.rotation.x = 1.15
  kneeR.rotation.x = 1.15
  armL.rotation.x = -0.35
  armR.rotation.x = -0.35
  elbowL.rotation.x = -0.35
  elbowR.rotation.x = -0.35

  const bot = {
    def,
    root,
    hips,
    head,
    armL,
    armR,
    legL,
    legR,
    eyeL: face.eyeL,
    eyeR: face.eyeR,
    browL: face.browL,
    browR: face.browR,
    mouth: face.mouth,
    ring,
    bang,
    check,
    label,
    stateEl,
    glow,
    lounge: place.lounge,
    desk: place.desk,
    visitor: VISITORS[Math.floor(hashPhase(def.id) * 2) % VISITORS.length],
    state: 'idle',
    place: 'rest',
    meetIndex: 0,
    task: '',
    carrying: false,
    hold: 0,
    holdStarted: false,
    folder,
    yaw: place.lounge.yaw,
    faceYaw: place.lounge.yaw,
    goals: [new THREE.Vector3(place.lounge.x, 0, place.lounge.z)],
    routeKey: 'idle',
    pose: 'sit',
    low: !!place.lounge.low,
    spinLeft: 0,
    checkTimer: 0,
    phase: hashPhase(def.id),
    quietUntil: 0,
    handoffCloud: 0,
    lookAt: null,
    gaze: null,
    moving: false,
    kneeL,
    kneeR,
    elbowL,
    elbowR,
    mug,
    cup: 'none',
    spot: 0,
    beat: '',
    fact: 'plan',
    follow: '',
    returnPlace: 'desk',
    bark: '',
    receiving: false,
    receiveYaw: 0,
    homeYaw: place.lounge.yaw,
    decided: false,
  }
  root.rotation.y = bot.yaw
  tagBotId(root, def.id)
  return bot
}

function tagBotId(object, id) {
  object.traverse((child) => {
    if (child.isMesh || child.isSprite) child.userData.botId = id
  })
}

function hashPhase(id) {
  let h = 0
  for (let i = 0; i < id.length; i += 1) h = (h * 33 + id.charCodeAt(i)) >>> 0
  return (h % 1000) / 1000 * Math.PI * 2
}

function routeTo(from, dest) {
  const via = routeThrough(from.x, from.z, dest.x, dest.z)
  const goals = via.map((point) => new THREE.Vector3(point.x, 0, point.z))
  goals.push(dest.clone())
  return goals
}

function spotGoal(list, index) {
  const spot = list[(index || 0) % list.length]
  return { dest: new THREE.Vector3(spot.x, 0, spot.z), yaw: spot.yaw, pose: spot.pose || 'sit' }
}

function syncRoute(bot) {
  const place = bot.place || 'rest'
  if (place === 'handoff') {
    if (bot.routeKey !== 'handoff' && bot.routeKey !== 'handoff-back') {
      bot.routeKey = 'handoff'
      bot.carrying = true
      bot.hold = 0
      bot.holdStarted = false
      const visitor = new THREE.Vector3(bot.visitor.x, 0, bot.visitor.z)
      bot.goals = routeTo(bot.root.position, visitor)
      bot.faceYaw = bot.visitor.yaw
      bot.pose = 'stand'
      bot.low = false
      bot.homeYaw = bot.faceYaw
    }
    return
  }
  if (bot.routeKey === 'handoff' || bot.routeKey === 'handoff-back') {
    bot.carrying = false
    bot.holdStarted = false
  }
  if (bot.routeKey === place) return
  bot.routeKey = place
  let dest
  let yaw
  let pose = 'sit'
  let low = false
  if (place === 'meeting') {
    const seat = MEETING_SEATS[(bot.meetIndex || 0) % MEETING_SEATS.length]
    dest = new THREE.Vector3(seat.x, 0, seat.z)
    yaw = seat.yaw
  } else if (place === 'wait-meeting') {
    const spot = WAIT_SPOTS[Math.floor(bot.phase * 2) % WAIT_SPOTS.length]
    dest = new THREE.Vector3(spot.x, 0, spot.z)
    yaw = spot.yaw
    pose = 'stand'
  } else if (place === 'wait-desk') {
    dest = bot.desk.stand.clone()
    yaw = bot.desk.yaw
    pose = 'stand'
  } else {
    const spot = spotFor(bot, place)
    dest = spot.dest
    yaw = spot.yaw
    pose = spot.pose
    low = spot.low
  }
  bot.goals = routeTo(bot.root.position, dest)
  bot.faceYaw = yaw
  bot.pose = pose
  bot.low = low
  bot.homeYaw = yaw
}

function spotFor(bot, place) {
  if (place === 'desk' || place === 'musk-desk') {
    return { dest: new THREE.Vector3(bot.desk.x, 0, bot.desk.z), yaw: bot.desk.yaw, pose: 'sit', low: false }
  }
  if (place === 'library') {
    const spot = spotGoal(LIBRARY_SPOTS, bot.spot)
    return { ...spot, low: false }
  }
  if (place === 'servers') {
    const spot = spotGoal(SERVER_SPOTS, bot.spot)
    return { ...spot, pose: 'stand', low: false }
  }
  if (place === 'security') {
    const spot = spotGoal(SECURITY_SPOTS, bot.spot)
    return { ...spot, low: false }
  }
  if (place === 'pantry') {
    const spot = spotGoal(PANTRY_SPOTS, bot.spot)
    return { ...spot, pose: 'stand', low: false }
  }
  if (place === 'snack') {
    const spot = spotGoal(SNACK_SPOTS, bot.spot)
    return { ...spot, low: false }
  }
  if (place === 'copy') {
    const spot = spotGoal(COPY_SPOTS, bot.spot)
    return { ...spot, pose: 'stand', low: false }
  }
  if (place === 'lounge') {
    const spot = spotGoal(REST_SPOTS, bot.spot)
    return { ...spot, low: false }
  }
  if (place === 'rec') {
    const spot = spotGoal(REC_SPOTS, bot.spot)
    return { ...spot, pose: 'stand', low: false }
  }
  if (place === 'balcony') {
    const spot = spotGoal(BALCONY_SPOTS, bot.spot)
    return { ...spot, low: false }
  }
  return {
    dest: new THREE.Vector3(bot.lounge.x, 0, bot.lounge.z),
    yaw: bot.lounge.yaw,
    pose: 'sit',
    low: !!bot.lounge.low,
  }
}

export function updateBot(bot, dt, elapsed, reduce) {
  syncRoute(bot)
  if (bot.receiving) bot.faceYaw = bot.receiveYaw
  if (bot.routeKey !== 'handoff') {
    bot.handoffCloud = 0
    bot.decided = false
  }
  const pos = bot.root.position
  const goal = bot.goals[0]
  const dx = goal.x - pos.x
  const dz = goal.z - pos.z
  const dist = Math.hypot(dx, dz)
  let moving = dist > 0.05
  if (dist <= 0.05) {
    pos.x = goal.x
    pos.z = goal.z
    if (bot.goals.length > 1) {
      bot.goals.shift()
      moving = true
    }
  } else {
    const hurry = bot.fact === 'sandbox-leak' && (bot.carrying || bot.routeKey === 'handoff')
    const speed = (reduce ? 28 : 6.4) * (hurry ? 1.85 : 1)
    const step = Math.min(dist, speed * dt)
    pos.x += (dx / dist) * step
    pos.z += (dz / dist) * step
    bot.yaw = dampAngle(bot.yaw, Math.atan2(dx, dz), reduce ? 18 : 8, dt)
  }

  if (!moving && bot.routeKey === 'handoff' && bot.goals.length <= 1) {
    if (!bot.holdStarted) {
      bot.holdStarted = true
      bot.hold = reduce ? 0.8 : 8.2
      bot.spinLeft = Math.PI * 2
    }
    bot.hold -= dt
    if (bot.hold <= 0) {
      bot.carrying = false
      bot.routeKey = 'handoff-back'
      const back = spotFor(bot, bot.returnPlace || 'lobby')
      bot.goals = routeTo(bot.root.position, back.dest)
      bot.faceYaw = back.yaw
      bot.pose = back.pose
      bot.low = back.low
      bot.homeYaw = back.yaw
      moving = true
    }
  }

  if (!moving && bot.spinLeft > 0) {
    const step = Math.min(bot.spinLeft, (reduce ? 14 : 5.2) * dt)
    bot.spinLeft -= step
    bot.yaw += step
    if (bot.spinLeft <= 0) bot.checkTimer = 1.15
  } else if (!moving) {
    bot.yaw = dampAngle(bot.yaw, bot.faceYaw, reduce ? 16 : 6, dt)
    if (bot.checkTimer > 0) bot.checkTimer -= dt
  }
  bot.root.rotation.y = bot.yaw
  bot.moving = moving

  const target = {
    hip: HIP_STAND,
    legL: 0.08,
    legR: -0.08,
    kneeL: 0.12,
    kneeR: 0.12,
    armLx: 0.12,
    armRx: 0.12,
    armLz: 0.04,
    armRz: -0.04,
    elbowL: -0.28,
    elbowR: -0.28,
    headX: 0,
    headY: 0,
  }
  const wave = Math.sin(elapsed * 6 + bot.phase)

  if (moving) {
    const step = Math.sin(elapsed * 9.5 + bot.phase)
    target.hip = HIP_STAND
    target.legL = step * 0.7
    target.legR = -step * 0.7
    target.kneeL = Math.max(0, -step) * 0.9
    target.kneeR = Math.max(0, step) * 0.9
    target.armLx = -step * 0.35
    target.armRx = step * 0.35
    target.elbowL = -0.35
    target.elbowR = -0.35
  } else if (bot.pose === 'sit') {
    target.hip = bot.low ? HIP_LOW : HIP_SIT
    target.legL = -1.02
    target.legR = -1.02
    target.kneeL = 1.15
    target.kneeR = 1.15
    target.armLx = -0.4
    target.armRx = -0.4
    target.elbowL = -0.35
    target.elbowR = -0.35
    target.headY = Math.sin(elapsed * 0.55 + bot.phase) * 0.25
    target.headX = Math.sin(elapsed * 0.4 + bot.phase * 1.3) * 0.05
    if (bot.state === 'working' && (bot.place === 'desk' || bot.place === 'musk-desk')) {
      target.armLx = -1.02 + Math.sin(elapsed * 14 + bot.phase) * 0.14
      target.armRx = -1.02 + Math.sin(elapsed * 14 + bot.phase + 1.35) * 0.14
      target.armLz = 0.16
      target.armRz = -0.16
      target.headX = 0.28
      target.headY = Math.sin(elapsed * 1.1 + bot.phase) * 0.06
    } else if (bot.state === 'idle') {
      const cycle = (elapsed + bot.phase) % 9
      if (!reduce && cycle > 7.7 && cycle < 8.6) {
        target.armRx = -2.05
        target.armRz = -0.15
      }
    }
  } else {
    target.hip = HIP_STAND
    target.headY = Math.sin(elapsed * 0.8 + bot.phase) * 0.18
    if (bot.state === 'waiting') {
      target.armRx = -0.25
      target.armRz = 2.05 + wave * 0.32
      target.headY = 0.15
    } else if (bot.state === 'error') {
      target.headX = 0.32
      target.armLx = 0.25
      target.armRx = 0.25
    }
  }

  if (bot.carrying) {
    target.armRx = -0.85
    target.armRz = -0.2
    target.elbowR = -0.7
  }
  if (!moving && bot.place === 'copy') {
    target.armRx = -0.75
    target.elbowR = -0.45
    target.headX = 0.22
  }
  const sipping = (bot.cup === 'sip' || bot.cup === 'hand') && !bot.carrying
  if (sipping && bot.cup === 'sip' && !moving) {
    target.armLx = -1.15
    target.armLz = 0.4
    target.elbowL = -0.85
    if (!bot.lookAt) target.headX = 0.2
  } else if (sipping) {
    target.armLx = -0.4
    target.armLz = 0.5
    target.elbowL = -0.5
  }
  if (bot.mug) bot.mug.visible = sipping

  if (!moving && bot.spinLeft <= 0 && bot.lookAt) {
    const lx = bot.lookAt.x - pos.x
    const lz = bot.lookAt.z - pos.z
    if (lx * lx + lz * lz > 0.04) {
      const want = Math.atan2(lx, lz)
      let rel = Math.atan2(Math.sin(want - bot.yaw), Math.cos(want - bot.yaw))
      if (rel > 0.75) rel = 0.75
      if (rel < -0.75) rel = -0.75
      target.headY = rel
      target.headX = 0.02
    }
  } else if (!moving && bot.gaze === 'up' && bot.state !== 'error') {
    target.headX = -0.18
    target.headY *= 0.4
  }
  if (bot.receiving && !moving) {
    target.armRx = -0.9
    target.armRz = 0.2
    target.elbowR = -0.55
  }

  if (!moving) {
    target.hip += Math.sin(elapsed * 1.5 + bot.phase) * (reduce ? 0 : 0.006)
  } else if (!reduce) {
    target.hip += Math.abs(Math.sin(elapsed * 9.5 + bot.phase)) * 0.02
  }

  const lambda = reduce ? 16 : moving ? 14 : 8
  bot.hips.position.y = damp(bot.hips.position.y, target.hip, lambda, dt)
  bot.legL.rotation.x = damp(bot.legL.rotation.x, target.legL, lambda, dt)
  bot.legR.rotation.x = damp(bot.legR.rotation.x, target.legR, lambda, dt)
  bot.armL.rotation.x = damp(bot.armL.rotation.x, target.armLx, lambda, dt)
  bot.armR.rotation.x = damp(bot.armR.rotation.x, target.armRx, lambda, dt)
  bot.armL.rotation.z = dampAngle(bot.armL.rotation.z, target.armLz, lambda, dt)
  bot.armR.rotation.z = dampAngle(bot.armR.rotation.z, target.armRz, lambda, dt)
  if (bot.kneeL) {
    bot.kneeL.rotation.x = damp(bot.kneeL.rotation.x, target.kneeL, lambda, dt)
    bot.kneeR.rotation.x = damp(bot.kneeR.rotation.x, target.kneeR, lambda, dt)
  }
  if (bot.elbowL) {
    bot.elbowL.rotation.x = damp(bot.elbowL.rotation.x, target.elbowL, lambda, dt)
    bot.elbowR.rotation.x = damp(bot.elbowR.rotation.x, target.elbowR, lambda, dt)
  }
  bot.head.rotation.x = damp(bot.head.rotation.x, target.headX, 8, dt)
  bot.head.rotation.y = dampAngle(bot.head.rotation.y, target.headY, 6, dt)

  const blink = (elapsed * 0.35 + bot.phase) % 4.8
  const shut = !reduce && blink > 4.55
  const eyeScale = shut ? 0.12 : 1
  bot.eyeL.scale.y = eyeScale
  bot.eyeR.scale.y = eyeScale

  if (bot.browL) {
    let lz = -0.16
    let rz = 0.16
    let lift = 0
    if (bot.state === 'error') {
      lz = 0.32
      rz = -0.32
    } else if (bot.state === 'waiting') {
      lz = -0.02
      rz = 0.02
      lift = 0.018
    }
    bot.browL.rotation.z = damp(bot.browL.rotation.z, lz, 6, dt)
    bot.browR.rotation.z = damp(bot.browR.rotation.z, rz, 6, dt)
    bot.browL.position.y = damp(bot.browL.position.y, 0.088 + lift, 6, dt)
    bot.browR.position.y = bot.browL.position.y
  }
  if (bot.mouth) {
    const smile = bot.state === 'error' ? 0.4 : 1
    bot.mouth.scale.y = damp(bot.mouth.scale.y || 1, smile, 6, dt)
  }

  if (bot.folder) bot.folder.visible = !!bot.carrying
  bot.bang.visible = bot.state === 'error'
  if (bot.state === 'error') bot.bang.position.y = 1.05 + Math.sin(elapsed * 3 + bot.phase) * 0.04
  bot.check.visible = bot.state === 'done' && !moving && (bot.spinLeft > 0 || bot.checkTimer > 0)
}

export function setBotHighlight(bot, mode) {
  const intensity = mode === 'selected' ? 0.16 : mode === 'hover' ? 0.07 : 0
  for (const material of bot.glow) {
    material.emissive.set(intensity ? bot.def.color : '#000000')
    material.emissiveIntensity = intensity
  }
  bot.ring.visible = mode === 'selected'
}

export function focusPoint(bot, target) {
  bot.head.getWorldPosition(target)
  target.y += 0.08
  return target
}
