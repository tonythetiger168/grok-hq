import * as THREE from 'three'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { damp, dampAngle, std } from './geom.js'
import { glyphTexture } from './paint.js'
import { CORNER, DOOR, MEETING_SEATS, VISITORS, WAIT_SPOTS } from './layout.js'

const HIP_STAND = 0.4
const HIP_SIT = 0.36
const HIP_LOW = 0.2

const scleraMat = std('#f4f1ea', 0.55)
const pupilMat = std('#1c1916', 0.4)
const bangTex = glyphTexture('bang')
const checkTex = glyphTexture('check')

function limbColor(hex) {
  const color = new THREE.Color(hex)
  const hsl = { h: 0, s: 0, l: 0 }
  color.getHSL(hsl)
  return color.multiplyScalar(hsl.l > 0.72 ? 0.9 : 0.8)
}

function roundedMesh(w, h, d, radius, material) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, radius), material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
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
  sprite.position.y = 0.9
  sprite.center.set(0.5, 0)
  return sprite
}

function addEye(parent, x, z, y) {
  const eye = new THREE.Group()
  eye.position.set(x, y, z)
  const white = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.09, 0.04), scleraMat)
  white.castShadow = false
  const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.048, 0.03), pupilMat)
  pupil.position.z = 0.02
  pupil.castShadow = false
  eye.add(white)
  eye.add(pupil)
  parent.add(eye)
  return eye
}

function addAccessory(head, def, accent) {
  const ink = std('#241f1a', 0.7)
  const gold = std(def.accent || '#d7b56a', 0.55)
  const kind = def.accessory

  if (kind === 'antenna') {
    for (const x of [-0.08, 0.08]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8), gold)
      pole.position.set(x, 0.24, 0)
      pole.castShadow = true
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), gold)
      tip.position.set(x, 0.34, 0)
      tip.castShadow = true
      head.add(pole, tip)
    }
  } else if (kind === 'glasses') {
    for (const x of [-0.08, 0.08]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 8, 16), ink)
      ring.position.set(x, 0.02, 0.16)
      head.add(ring)
    }
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.012), ink)
    bridge.position.set(0, 0.02, 0.16)
    head.add(bridge)
  } else if (kind === 'visor') {
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.07, 0.04), std('#1b1f24', 0.35))
    visor.position.set(0, 0.02, 0.16)
    head.add(visor)
  } else if (kind === 'sun') {
    const sun = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 20), gold)
    sun.rotation.x = Math.PI / 2
    sun.position.set(0, 0.02, -0.16)
    sun.castShadow = true
    head.add(sun)
  } else if (kind === 'halo') {
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 8, 24), gold)
    halo.rotation.x = Math.PI / 2
    halo.position.y = 0.28
    head.add(halo)
  } else if (kind === 'horns') {
    for (const side of [-1, 1]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.16, 8), accent)
      horn.position.set(side * 0.1, 0.22, 0)
      horn.rotation.z = side * -0.35
      horn.castShadow = true
      head.add(horn)
    }
  } else if (kind === 'fin') {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.2), accent)
    fin.position.set(0.18, 0.04, -0.02)
    fin.rotation.z = -0.3
    fin.castShadow = true
    head.add(fin)
  } else if (kind === 'leaf') {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 6), std('#2f6a3c', 0.7))
    stem.position.set(0, 0.22, 0)
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.08), std('#2f6a3c', 0.8))
    leaf.position.set(0.04, 0.3, 0)
    leaf.rotation.z = 0.4
    head.add(stem, leaf)
  } else if (kind === 'square-glasses') {
    for (const x of [-0.08, 0.08]) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.02), ink)
      frame.position.set(x, 0.02, 0.155)
      const hole = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.038, 0.025), std('#d5e4ef', 0.25, { transparent: true, opacity: 0.35 }))
      hole.position.set(x, 0.02, 0.17)
      head.add(frame, hole)
    }
  } else if (kind === 'earpiece') {
    const bud = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), gold)
    bud.position.set(0.18, 0.0, 0.04)
    head.add(bud)
  } else if (kind === 'headphones') {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 8, 18, Math.PI), ink)
    band.rotation.z = Math.PI
    band.rotation.y = Math.PI / 2
    band.position.y = 0.08
    head.add(band)
    for (const x of [-0.16, 0.16]) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), ink)
      cup.rotation.z = Math.PI / 2
      cup.position.set(x, 0.0, 0)
      head.add(cup)
    }
  } else if (kind === 'chevron' || kind === 'arrows') {
    const count = kind === 'arrows' ? 2 : 1
    for (let i = 0; i < count; i += 1) {
      const mark = new THREE.Group()
      mark.position.set(0, 0.24 + i * 0.08, 0.02)
      for (const side of [-1, 1]) {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.025), gold)
        arm.position.set(side * 0.04, 0.03, 0)
        arm.rotation.z = side * -0.7
        mark.add(arm)
      }
      head.add(mark)
    }
  } else if (kind === 'screen-visor') {
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.09, 0.03),
      std('#24343c', 0.3, { transparent: true, opacity: 0.78 }),
    )
    visor.position.set(0, 0.03, 0.16)
    head.add(visor)
  } else if (kind === 'clock') {
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16), std('#f7f4ee', 0.6))
    face.rotation.x = Math.PI / 2
    face.position.set(0, 0.22, 0.02)
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.06, 0.012), ink)
    hand.position.set(0, 0.25, 0.04)
    head.add(face, hand)
  } else if (kind === 'bill') {
    const bill = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.12), std('#f0a04a', 0.7))
    bill.position.set(0, -0.02, 0.2)
    head.add(bill)
  } else if (kind === 'folder') {
    const folder = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.03), std('#d7c49a', 0.8))
    folder.position.set(0, -0.02, -0.18)
    const tab = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.03), std('#c4a56a', 0.8))
    tab.position.set(-0.03, 0.06, -0.18)
    head.add(folder, tab)
  } else if (kind === 'dish') {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), ink)
    pole.position.set(0, 0.24, 0)
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 14), gold)
    dish.rotation.x = 0.6
    dish.position.set(0, 0.33, 0.03)
    head.add(pole, dish)
  } else if (kind === 'candle') {
    const green = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.05), std('#3f8f62', 0.7))
    green.position.set(-0.05, 0.24, 0)
    const red = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.05), std('#b85a4a', 0.7))
    red.position.set(0.05, 0.22, 0)
    head.add(green, red)
  } else if (kind === 'bars') {
    const heights = [0.08, 0.14, 0.11]
    heights.forEach((h, i) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, h, 0.04), gold)
      bar.position.set(-0.06 + i * 0.06, 0.16 + h / 2, 0.02)
      head.add(bar)
    })
  } else if (kind === 'stroke') {
    const stroke = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.025, 0.025), gold)
    stroke.position.set(0, 0.24, 0.02)
    stroke.rotation.z = -0.45
    head.add(stroke)
  }

  if (def.collar) {
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.22), gold)
    collar.position.set(0, -0.16, 0)
    head.add(collar)
  }
}

export function createBot(def, place) {
  const root = new THREE.Group()
  root.name = def.id
  root.position.set(place.lounge.x, 0, place.lounge.z)
  root.userData.botId = def.id

  const torsoMat = std(def.outfit === 'jacket' ? def.accent : def.color, 0.94)
  const headMat = std(def.color, 0.94)
  const limbMat = std(limbColor(def.color), 0.94)
  const accent = std(def.accent || def.color, 0.6)
  const glow = [torsoMat, headMat, limbMat]

  const hips = new THREE.Group()
  root.add(hips)

  const head = new THREE.Group()
  if (def.body === 'egg') {
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 18), torsoMat)
    shell.scale.set(1.02, 1.18, 0.96)
    shell.position.y = 0.2
    shell.castShadow = true
    shell.receiveShadow = true
    hips.add(shell)
    const yolk = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), accent)
    yolk.position.set(0, 0.18, 0.18)
    yolk.castShadow = true
    hips.add(yolk)
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 16), headMat)
    skull.position.y = 0.02
    skull.castShadow = true
    head.add(skull)
    head.position.y = 0.5
  } else {
    const torso = roundedMesh(0.4, 0.32, 0.26, 0.06, torsoMat)
    torso.position.y = 0.2
    hips.add(torso)
    const skull = roundedMesh(0.36, 0.3, 0.32, 0.07, headMat)
    skull.castShadow = true
    head.add(skull)
    head.position.y = 0.52
  }
  hips.add(head)

  const eyeZ = def.body === 'egg' ? 0.15 : 0.17
  const eyeY = def.body === 'egg' ? 0.03 : 0.03
  const eyeL = addEye(head, -0.07, eyeZ, eyeY)
  const eyeR = addEye(head, 0.07, eyeZ, eyeY)
  addAccessory(head, def, accent)

  function limb(side, y, length, girth) {
    const pivot = new THREE.Group()
    pivot.position.set(side * 0.24, y, 0)
    const mesh = roundedMesh(girth, length, girth * 0.95, 0.03, limbMat)
    mesh.position.y = -length / 2
    pivot.add(mesh)
    hips.add(pivot)
    return pivot
  }

  const armL = limb(-1, 0.3, 0.26, 0.09)
  const armR = limb(1, 0.3, 0.26, 0.09)
  const folder = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.035, 0.18),
    std('#d7c49a', 0.8),
  )
  folder.position.set(0.02, -0.3, 0.08)
  folder.visible = false
  folder.castShadow = true
  armR.add(folder)
  const legL = limb(-0.45, 0.02, 0.3, 0.12)
  legL.position.x = -0.1
  const legR = limb(0.45, 0.02, 0.3, 0.12)
  legR.position.x = 0.1
  for (const leg of [legL, legR]) {
    const foot = roundedMesh(0.13, 0.06, 0.16, 0.02, limbMat)
    foot.position.set(0, -0.33, 0.03)
    leg.add(foot)
  }

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
  label.position.set(0, 0.92, 0)
  label.visible = false
  hips.add(label)

  hips.position.y = place.lounge.low ? HIP_LOW : HIP_SIT
  legL.rotation.x = -1.12
  legR.rotation.x = -1.12
  armL.rotation.x = -0.45
  armR.rotation.x = -0.45

  const bot = {
    def,
    root,
    hips,
    head,
    armL,
    armR,
    legL,
    legR,
    eyeL,
    eyeR,
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

function insideCorner(point) {
  return point.x > CORNER.x0 && point.x < CORNER.x1 && point.z > CORNER.z0 && point.z < CORNER.z1
}

function routeTo(from, dest) {
  const goals = []
  const door = new THREE.Vector3(DOOR.x, 0, DOOR.z)
  const target = dest.clone()
  if ((insideCorner(from) || insideCorner(target)) && from.distanceTo(door) > 0.4 && target.distanceTo(door) > 0.4) {
    goals.push(door)
  }
  goals.push(target)
  return goals
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
  if (place === 'rest') {
    dest = new THREE.Vector3(bot.lounge.x, 0, bot.lounge.z)
    yaw = bot.lounge.yaw
    low = !!bot.lounge.low
  } else if (place === 'meeting') {
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
    dest = new THREE.Vector3(bot.desk.x, 0, bot.desk.z)
    yaw = bot.desk.yaw
  }
  bot.goals = routeTo(bot.root.position, dest)
  bot.faceYaw = yaw
  bot.pose = pose
  bot.low = low
}

export function updateBot(bot, dt, elapsed, reduce) {
  syncRoute(bot)
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
    const speed = reduce ? 28 : 6.4
    const step = Math.min(dist, speed * dt)
    pos.x += (dx / dist) * step
    pos.z += (dz / dist) * step
    bot.yaw = dampAngle(bot.yaw, Math.atan2(dx, dz), reduce ? 18 : 8, dt)
  }

  if (!moving && bot.routeKey === 'handoff' && bot.goals.length <= 1) {
    if (!bot.holdStarted) {
      bot.holdStarted = true
      bot.hold = reduce ? 0.35 : 1.15
      bot.spinLeft = Math.PI * 2
    }
    bot.hold -= dt
    if (bot.hold <= 0) {
      bot.carrying = false
      bot.routeKey = 'handoff-back'
      const seat = new THREE.Vector3(bot.lounge.x, 0, bot.lounge.z)
      bot.goals = routeTo(bot.root.position, seat)
      bot.faceYaw = bot.lounge.yaw
      bot.pose = 'sit'
      bot.low = !!bot.lounge.low
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

  const target = {
    hip: HIP_STAND,
    legL: 0.05,
    legR: -0.05,
    armLx: 0.12,
    armRx: 0.12,
    armLz: 0.04,
    armRz: -0.04,
    headX: 0,
    headY: 0,
  }
  const wave = Math.sin(elapsed * 6 + bot.phase)

  if (moving) {
    const step = Math.sin(elapsed * 9.5 + bot.phase)
    target.hip = HIP_STAND
    target.legL = step * 0.55
    target.legR = -step * 0.55
    target.armLx = -step * 0.4
    target.armRx = step * 0.4
  } else if (bot.pose === 'sit') {
    target.hip = bot.low ? HIP_LOW : HIP_SIT
    target.legL = -1.12
    target.legR = -1.12
    target.armLx = -0.5
    target.armRx = -0.5
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
    target.armRx = -1.05
    target.armRz = -0.25
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
  bot.head.rotation.x = damp(bot.head.rotation.x, target.headX, 8, dt)
  bot.head.rotation.y = dampAngle(bot.head.rotation.y, target.headY, 6, dt)

  const blink = (elapsed * 0.35 + bot.phase) % 4.8
  const shut = !reduce && blink > 4.55
  const eyeScale = shut ? 0.12 : 1
  bot.eyeL.scale.y = eyeScale
  bot.eyeR.scale.y = eyeScale

  if (bot.folder) bot.folder.visible = !!bot.carrying
  bot.bang.visible = bot.state === 'error'
  if (bot.state === 'error') bot.bang.position.y = 0.9 + Math.sin(elapsed * 3 + bot.phase) * 0.04
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
  bot.root.getWorldPosition(target)
  target.y += 0.72
  return target
}
