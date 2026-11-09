import * as THREE from 'three'
import { box, cyl, std, worldPoint } from './geom.js'
import {
  BOUNDS,
  CORNER,
  DESKS,
  DOOR_GAP,
  LOUNGE,
  LOUNGE_CHAIR_COLORS,
  MEETING_SEATS,
  MEETING_TABLE,
  PLANTS,
  REST_TABLE,
  COPIER,
  PORTALS,
  SIGNS,
  SNACK_BARS,
  SOFA_COLORS,
  ZONES,
} from './layout.js'
import {
  carpetTexture,
  clockCanvas,
  digitalClockTexture,
  glassWordTexture,
  nameplateTexture,
  signTexture,
  skyTexture,
  usageTexture,
} from './paint.js'
import { deskScreenMaterial, researchScreenMaterial } from './screens.js'

const WOOD = '#e4d7c6'
const WOOD_TOP = '#d7b48a'
const WOOD_LEG = '#8d684c'

function basic(map, extra = {}) {
  return new THREE.MeshBasicMaterial({
    map,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    ...extra,
  })
}

function addCarpetLabel(parent, text, x, z, width) {
  if (!text) return
  const tex = carpetTexture(text)
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, width * 0.18), basic(tex))
  mesh.rotation.x = -Math.PI / 2
  mesh.position.set(x, 0.028, z)
  mesh.renderOrder = 2
  parent.add(mesh)
}

function addSign(parent, sign, frameMat, boardMat) {
  const post = cyl(parent, 0.035, 0.04, 1.22, sign.x, 0.61, sign.z, frameMat, 8)
  post.castShadow = true
  const board = new THREE.Group()
  board.position.set(sign.x, 1.42, sign.z)
  parent.add(board)
  box(board, sign.sub ? 1.7 : 1.45, 0.52, 0.05, 0, 0, 0, boardMat)
  const tex = signTexture(sign.title, sign.sub)
  const face = new THREE.Mesh(new THREE.PlaneGeometry(sign.sub ? 1.58 : 1.32, 0.42), basic(tex, { transparent: false, depthWrite: true }))
  face.position.z = 0.03
  board.add(face)
}

function addChair(parent, x, z, yaw, color, lounge = false) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  group.rotation.y = yaw
  const fabric = std(color, 0.94)
  const leg = std('#2c2926', 0.62)
  const seatW = lounge ? 0.5 : 0.42
  const seatD = lounge ? 0.48 : 0.4
  box(group, seatW, 0.08, seatD, 0, 0.34, 0.02, fabric)
  box(group, seatW, lounge ? 0.32 : 0.36, 0.07, 0, 0.56, -0.18, fabric)
  box(group, 0.08, 0.22, seatD, -seatW / 2 - 0.01, 0.44, 0.02, fabric)
  box(group, 0.08, 0.22, seatD, seatW / 2 + 0.01, 0.44, 0.02, fabric)
  for (const [lx, lz] of [[-0.16, -0.12], [0.16, -0.12], [-0.16, 0.12], [0.16, 0.12]]) {
    box(group, 0.045, 0.32, 0.045, lx, 0.16, lz, leg)
  }
  parent.add(group)
  return group
}

function addSofa(parent, seats, color) {
  const yaw = seats[0].yaw
  const cx = seats.reduce((sum, seat) => sum + seat.x, 0) / seats.length
  const cz = seats.reduce((sum, seat) => sum + seat.z, 0) / seats.length
  const group = new THREE.Group()
  group.position.set(cx, 0, cz)
  group.rotation.y = yaw
  parent.add(group)
  group.updateMatrixWorld()
  const locals = seats.map((seat) => group.worldToLocal(new THREE.Vector3(seat.x, 0, seat.z)))
  const minX = Math.min(...locals.map((point) => point.x))
  const maxX = Math.max(...locals.map((point) => point.x))
  const mid = (minX + maxX) / 2
  const len = Math.max(maxX - minX + 1.0, 1.1)
  const fabric = std(color, 0.96)
  const wood = std(WOOD_LEG, 0.72)
  box(group, len, 0.14, 0.52, mid, 0.3, 0, fabric)
  box(group, len, 0.36, 0.11, mid, 0.54, -0.22, fabric)
  box(group, 0.1, 0.26, 0.52, minX - 0.5, 0.42, 0, fabric)
  box(group, 0.1, 0.26, 0.52, maxX + 0.5, 0.42, 0, fabric)
  for (const lx of [minX - 0.2, maxX + 0.2]) {
    for (const lz of [-0.16, 0.16]) box(group, 0.06, 0.24, 0.06, lx, 0.12, lz, wood)
  }
}

function addCushion(parent, seat) {
  const group = new THREE.Group()
  group.position.set(seat.x, 0, seat.z)
  group.rotation.y = seat.yaw
  const fabric = std(seat.bot === 'quantstats' ? '#c46a4a' : '#e4d2b8', 0.96)
  box(group, 0.52, 0.14, 0.52, 0, 0.1, 0, fabric)
  parent.add(group)
}

function workstation(parent, spec, bot, mats, screens) {
  const group = new THREE.Group()
  const deskPoint = worldPoint(spec.x, spec.z, spec.yaw, 0, 0.78)
  group.position.set(deskPoint.x, 0, deskPoint.z)
  group.rotation.y = spec.yaw
  parent.add(group)

  box(group, 1.18, 0.06, 0.62, 0, 0.49, 0, mats.desk)
  for (const [lx, lz] of [[-0.5, -0.22], [0.5, -0.22], [-0.5, 0.22], [0.5, 0.22]]) {
    box(group, 0.05, 0.46, 0.05, lx, 0.23, lz, mats.deskLeg)
  }
  box(group, 0.08, 0.16, 0.08, 0, 0.62, 0.16, mats.metal)
  box(group, 0.68, 0.44, 0.045, 0, 0.9, 0.18, mats.bezel)
  const screenMat = deskScreenMaterial((spec.x + spec.z) * 0.17)
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.34), screenMat)
  screen.position.set(0, 0.9, 0.15)
  screen.rotation.y = Math.PI
  group.add(screen)
  screens.push({ id: spec.id, mat: screenMat })

  box(group, 0.36, 0.025, 0.14, 0, 0.535, -0.12, mats.keys)

  const plateTex = nameplateTexture(bot.name, bot.color)
  const plate = new THREE.Sprite(new THREE.SpriteMaterial({
    map: plateTex,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  }))
  plate.position.set(0, 1.38, 0.12)
  plate.scale.set(1.22, 0.3, 1)
  plate.userData.botId = spec.id
  group.add(plate)

  if (spec.extras === 'files') {
    for (let i = 0; i < 3; i += 1) {
      const file = box(group, 0.16, 0.012, 0.12, -0.38, 0.54 + i * 0.016, 0.08, std(['#d7c4a4', '#e7d5c8', '#c9b79a'][i], 0.9))
      file.userData.botId = spec.id
    }
  }
  if (spec.extras === 'studio') {
    const tray = box(group, 0.46, 0.03, 0.22, 0.28, 0.54, 0.08, std('#efe6d6', 0.85))
    tray.userData.botId = spec.id
    const swatches = ['#3c4f73', '#e09a4e', '#2f6f6a', '#d46a4c', '#e2b23a']
    swatches.forEach((color, index) => {
      const cube = box(group, 0.06, 0.06, 0.06, 0.12 + index * 0.08, 0.59, 0.08, std(color, 0.8))
      cube.userData.botId = spec.id
    })
  }

  group.traverse((child) => {
    if (child.isMesh || child.isSprite) child.userData.botId = spec.id
  })

  const chair = addChair(parent, spec.x, spec.z, spec.yaw, bot.color, false)
  chair.traverse((child) => {
    if (child.isMesh) child.userData.botId = spec.id
  })

  const stand = worldPoint(spec.x, spec.z, spec.yaw, 0.56, 0.05)
  return {
    x: spec.x,
    z: spec.z,
    yaw: spec.yaw,
    stand: new THREE.Vector3(stand.x, 0, stand.z),
    via: spec.via ? spec.via[0] : null,
  }
}

function addWindows(parent, mats) {
  const z = BOUNDS.z0 + 0.02
  const x0 = BOUNDS.x0 + 0.5
  const x1 = BOUNDS.x1 - 0.5
  const width = x1 - x0
  box(parent, width, 0.1, 0.12, 0, 0.28, z, mats.mullion, true)
  box(parent, width, 0.1, 0.12, 0, 1.46, z, mats.mullion, true)
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(width, 1.08), mats.window)
  glass.position.set(0, 0.87, z)
  glass.receiveShadow = false
  glass.castShadow = false
  parent.add(glass)
  for (let x = x0; x <= x1 + 0.01; x += 2.4) {
    box(parent, 0.05, 1.2, 0.08, x, 0.88, z, mats.mullion, true)
  }
}

function addGlassPanel(parent, width, height, x, y, z, ry, mats, frost) {
  const material = frost ? mats.frost : mats.glass
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material)
  mesh.position.set(x, y, z)
  mesh.rotation.y = ry
  mesh.castShadow = false
  mesh.receiveShadow = false
  parent.add(mesh)
  return mesh
}

function addCornerOffice(parent, mats) {
  const x = CORNER.x1
  const z0 = CORNER.z0
  const z1 = CORNER.z1
  const door0 = DOOR_GAP.z0
  const door1 = DOOR_GAP.z1
  addGlassPanel(parent, door0 - z0 - 0.08, 0.5, x, 0.34, (z0 + door0) / 2, Math.PI / 2, mats, true)
  addGlassPanel(parent, door0 - z0 - 0.08, 0.78, x, 1.02, (z0 + door0) / 2, Math.PI / 2, mats, false)
  addGlassPanel(parent, z1 - door1 - 0.08, 0.5, x, 0.34, (door1 + z1) / 2, Math.PI / 2, mats, true)
  addGlassPanel(parent, z1 - door1 - 0.08, 0.78, x, 1.02, (door1 + z1) / 2, Math.PI / 2, mats, false)
  box(parent, 0.08, 1.5, 0.08, x, 0.75, door0, mats.frame, false)
  box(parent, 0.08, 1.5, 0.08, x, 0.75, door1, mats.frame, false)
  box(parent, 0.08, 0.08, door1 - door0, x, 1.46, (door0 + door1) / 2, mats.frame, false)

  const south = CORNER.z1
  const width = CORNER.x1 - CORNER.x0
  const midX = (CORNER.x0 + CORNER.x1) / 2
  box(parent, width, 0.08, 0.08, midX, 1.46, south, mats.frame, false)
  box(parent, width, 0.08, 0.08, midX, 0.08, south, mats.frame, false)
  addGlassPanel(parent, width - 0.1, 0.5, midX, 0.34, south, 0, mats, true)
  addGlassPanel(parent, width - 0.1, 0.78, midX, 1.02, south, 0, mats, false)

  const word = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.72), basic(glassWordTexture()))
  word.position.set(midX, 1.12, south + 0.06)
  parent.add(word)

  const shelf = new THREE.Group()
  shelf.position.set(CORNER.x0 + 0.85, 0, CORNER.z0 + 1.45)
  shelf.rotation.y = Math.PI / 2
  parent.add(shelf)
  box(shelf, 1.3, 0.08, 0.28, 0, 0.7, 0, std(WOOD_TOP, 0.8))
  box(shelf, 1.3, 0.08, 0.28, 0, 1.05, 0, std(WOOD_TOP, 0.8))
  box(shelf, 0.06, 1.15, 0.28, -0.64, 0.58, 0, std(WOOD_LEG, 0.75))
  box(shelf, 0.06, 1.15, 0.28, 0.64, 0.58, 0, std(WOOD_LEG, 0.75))
  const bookColors = ['#3c4f73', '#e09a4e', '#2f6f6a', '#d46a4c', '#6b4c9a', '#3e8f6e']
  bookColors.forEach((color, index) => {
    box(shelf, 0.08, 0.22, 0.18, -0.42 + index * 0.16, 0.85, 0, std(color, 0.8))
  })
}

function addResearch(parent, research) {
  const z = -5.15
  const xs = [11.3, 12.5]
  box(parent, 2.1, 0.08, 0.28, 11.9, 0.62, z + 0.16, std('#d9c7a4', 0.85))
  for (const lx of [10.95, 12.85]) {
    box(parent, 0.06, 0.62, 0.22, lx, 0.31, z + 0.16, std(WOOD_LEG, 0.75))
  }
  xs.forEach((x, index) => {
    box(parent, 1.15, 0.72, 0.05, x, 1.12, z, std('#1c1e20', 0.6))
    const mat = researchScreenMaterial(index * 1.7)
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 0.6), mat)
    screen.position.set(x, 1.12, z + 0.03)
    parent.add(screen)
    research.push(mat)
  })
}

function addServers(parent, leds) {
  const tile = std('#d5e4ee', 0.85)
  for (let x = 14.15; x <= 16.2; x += 0.55) {
    box(parent, 0.02, 0.012, 4.8, x, 0.03, -6.6, tile, false)
  }
  for (let z = -8.8; z <= -4.4; z += 0.55) {
    box(parent, 2.3, 0.012, 0.02, 15.2, 0.03, z, tile, false)
  }
  const cable = std('#243044', 0.5)
  box(parent, 0.04, 0.02, 3.4, 14.7, 0.04, -6.7, cable, false)
  box(parent, 1.1, 0.02, 0.04, 15.2, 0.04, -5.2, cable, false)
  const spots = [[15.85, -8.15], [15.85, -6.65], [15.85, -5.15]]
  const bodyMat = std('#1e2a36', 0.5, { metalness: 0.12 })
  spots.forEach(([x, z], rack) => {
    const group = new THREE.Group()
    group.position.set(x, 0, z)
    parent.add(group)
    box(group, 0.62, 1.5, 0.42, 0, 0.75, 0, bodyMat, true)
    for (let row = 0; row < 7; row += 1) {
      const warm = row % 5 === 0
      const led = std('#10202c', 0.4)
      led.emissive = new THREE.Color(warm ? '#e07a3d' : '#7ec8ff')
      led.emissiveIntensity = 0.7
      led.userData.phase = rack * 1.3 + row * 0.55
      led.userData.warm = warm
      led.userData.alarm = rack === 1
      const lamp = box(group, 0.4, 0.016, 0.02, 0, 0.22 + row * 0.17, 0.22, led, false)
      lamp.castShadow = false
      leds.push(led)
    }
  })
  const beacon = std('#3a2018', 0.4)
  beacon.emissive = new THREE.Color('#7ec8ff')
  beacon.emissiveIntensity = 0.08
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), beacon)
  lamp.position.set(15.85, 1.64, -6.65)
  lamp.castShadow = false
  parent.add(lamp)
  leds.beacon = beacon
  const cool = new THREE.PointLight('#9ecbff', 0.35, 4.2, 2)
  cool.position.set(14.8, 1.4, -6.6)
  parent.add(cool)
}

function addSecurityRoom(parent) {
  const desk = std('#f7f1e6', 0.75)
  const leg = std('#6b4c38', 0.7)
  const group = new THREE.Group()
  group.position.set(15.85, 0, -2.45)
  parent.add(group)
  box(group, 0.56, 0.08, 1.15, 0, 0.74, 0, desk, true)
  for (const [lx, lz] of [[-0.2, -0.45], [0.2, -0.45], [-0.2, 0.45], [0.2, 0.45]]) {
    box(group, 0.06, 0.7, 0.06, lx, 0.35, lz, leg, true)
  }
  addChair(parent, 15.15, -2.45, Math.PI / 2, '#c46a4a', false)

  const bezel = std('#241f1a', 0.6)
  const screenMat = (color) => new THREE.MeshBasicMaterial({ color, toneMapped: false, side: THREE.DoubleSide })
  const calm = screenMat('#3fba7a')
  const alert = screenMat('#3fba7a')
  for (const [z, mat] of [[-2.95, calm], [-1.95, alert]]) {
    box(parent, 0.06, 0.46, 0.64, 16.38, 1.16, z, bezel, false)
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.32), mat)
    face.position.set(16.33, 1.16, z)
    face.rotation.y = Math.PI / 2
    face.castShadow = false
    parent.add(face)
  }

  box(parent, 0.62, 0.48, 0.06, 14.15, 1.18, -3.58, std('#fffaf3', 0.9), false)
  box(parent, 0.7, 0.56, 0.05, 14.15, 1.18, -3.62, std('#6b4c38', 0.7), false)
  for (const [dz, color] of [[-0.16, '#3fba7a'], [0, '#e2b340'], [0.16, '#7ec8ff']]) {
    const tick = std(color, 0.4)
    tick.emissive = new THREE.Color(color)
    tick.emissiveIntensity = 0.35
    box(parent, 0.12, 0.08, 0.02, 14.15 + dz, 1.18, -3.54, tick, false)
  }

  const lampMat = std('#3a2018', 0.4)
  lampMat.emissive = new THREE.Color('#e2b340')
  lampMat.emissiveIntensity = 0.3
  cyl(parent, 0.02, 0.02, 0.16, 15.85, 0.82, -1.95, std('#241f1a', 0.6), 8, false)
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), lampMat)
  lamp.position.set(15.85, 0.94, -1.95)
  lamp.castShadow = false
  parent.add(lamp)
  return { calm, alert, lamp: lampMat }
}

function addUsage(parent) {
  const group = new THREE.Group()
  group.position.set(-12.55, 0.7, 7.35)
  group.rotation.y = Math.PI / 2
  group.scale.setScalar(0.55)
  parent.add(group)
  box(group, 3.15, 1.7, 0.08, 0, 0, 0, std('#e7dccb', 0.9))
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(2.95, 1.52),
    new THREE.MeshBasicMaterial({ map: usageTexture(), toneMapped: false }),
  )
  face.position.z = 0.045
  group.add(face)
  box(group, 0.08, 0.7, 0.08, -1.2, -0.7, 0, std(WOOD_LEG, 0.75))
  box(group, 0.08, 0.7, 0.08, 1.2, -0.7, 0, std(WOOD_LEG, 0.75))
}

function addPlants(parent) {
  const potMat = std('#c46a4a', 0.85)
  const leafA = std('#6d8f5e', 0.9)
  const leafB = std('#4f7048', 0.9)
  for (const plant of PLANTS) {
    const group = new THREE.Group()
    group.position.set(plant.x, 0, plant.z)
    group.scale.setScalar(plant.s)
    parent.add(group)
    cyl(group, 0.16, 0.13, 0.18, 0, 0.09, 0, potMat, 14)
    const blobs = [
      [0, 0.38, 0, 0.2, leafA],
      [-0.12, 0.5, 0.04, 0.16, leafB],
      [0.12, 0.52, -0.02, 0.15, leafA],
      [0.02, 0.64, 0, 0.12, leafB],
    ]
    for (const [x, y, z, r, mat] of blobs) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), mat)
      leaf.position.set(x, y, z)
      leaf.castShadow = true
      leaf.receiveShadow = true
      group.add(leaf)
    }
  }
}

function addPinboard(parent) {
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.8, 0.04),
    std('#c6a36a', 0.95),
  )
  board.position.set(CORNER.x0 + 0.16, 1.05, -7.55)
  board.rotation.y = Math.PI / 2
  parent.add(board)
  const notes = ['#f7f4ee', '#f3d7c6', '#e4efe4']
  notes.forEach((color, index) => {
    const note = box(parent, 0.18, 0.22, 0.02, CORNER.x0 + 0.2, 1.12, -7.85 + index * 0.28, std(color, 0.9), false)
    note.rotation.y = Math.PI / 2
  })
}

function addTable(parent) {
  const wood = std(WOOD_TOP, 0.78)
  const { x, z } = REST_TABLE
  box(parent, 1.2, 0.06, 0.7, x, 0.34, z, wood)
  for (const [dx, dz] of [[-0.45, -0.25], [0.45, -0.25], [-0.45, 0.25], [0.45, 0.25]]) {
    box(parent, 0.05, 0.32, 0.05, x + dx, 0.16, z + dz, std(WOOD_LEG, 0.75))
  }
  cyl(parent, 0.05, 0.045, 0.08, x - 0.28, 0.41, z - 0.05, std('#f4f1ea', 0.55), 12, true)
  cyl(parent, 0.045, 0.04, 0.07, x + 0.28, 0.4, z + 0.08, std('#3c4f73', 0.55), 12, true)
}

function addMeeting(parent) {
  const wood = std(WOOD_TOP, 0.75)
  const { x, z } = MEETING_TABLE
  box(parent, 2.05, 0.08, 1.05, x, 0.74, z, wood)
  for (const [dx, dz] of [[-0.82, -0.36], [0.82, -0.36], [-0.82, 0.36], [0.82, 0.36]]) {
    box(parent, 0.06, 0.7, 0.06, x + dx, 0.35, z + dz, std(WOOD_LEG, 0.72))
  }
  for (const seat of MEETING_SEATS) addChair(parent, seat.x, seat.z, seat.yaw, '#3e534c', true)
}

function addSmallMeeting(parent) {
  const wood = std(WOOD_TOP, 0.75)
  cyl(parent, 0.55, 0.55, 0.07, 3.6, 0.7, 0.7, wood, 16, true)
  cyl(parent, 0.05, 0.06, 0.64, 3.6, 0.32, 0.7, std(WOOD_LEG, 0.72), 8, true)
  const seats = [
    [3.6, -0.1, 0],
    [3.6, 1.5, Math.PI],
    [2.8, 0.7, Math.PI / 2],
    [4.4, 0.7, -Math.PI / 2],
  ]
  for (const [x, z, yaw] of seats) addChair(parent, x, z, yaw, '#8d6a4a', true)
}

function addLargeMeeting(parent) {
  const wood = std('#c4a574', 0.72)
  box(parent, 3.15, 0.08, 1.35, 7.3, 0.74, -6.5, wood, true)
  for (const [dx, dz] of [[-1.3, -0.48], [1.3, -0.48], [-1.3, 0.48], [1.3, 0.48]]) {
    box(parent, 0.07, 0.7, 0.07, 7.3 + dx, 0.35, -6.5 + dz, std(WOOD_LEG, 0.72), true)
  }
  const seats = [
    [5.45, -6.5, Math.PI / 2],
    [9.15, -6.5, -Math.PI / 2],
  ]
  for (const x of [6.3, 7.0, 7.6, 8.2]) {
    seats.push([x, -7.35, 0], [x, -5.65, Math.PI])
  }
  for (const [x, z, yaw] of seats) addChair(parent, x, z, yaw, '#3e534c', true)
}

function addVacantOffice(parent) {
  const wood = std('#e7d3b0', 0.7)
  box(parent, 1.7, 0.06, 0.7, 2.3, 0.74, -8.05, wood, true)
  for (const [dx, dz] of [[-0.7, -0.25], [0.7, -0.25], [-0.7, 0.25], [0.7, 0.25]]) {
    box(parent, 0.05, 0.7, 0.05, 2.3 + dx, 0.35, -8.05 + dz, std('#2c2926', 0.55), true)
  }
  addChair(parent, 2.3, -7.35, Math.PI, '#1c1e20', true)
  const lamp = new THREE.Group()
  lamp.position.set(3.55, 0, -8.7)
  parent.add(lamp)
  cyl(lamp, 0.12, 0.16, 0.04, 0, 0.04, 0, std('#c9845a', 0.7), 10, true)
  cyl(lamp, 0.025, 0.025, 1.15, 0, 0.6, 0, std('#5c4636', 0.6), 6, false)
  const shade = std('#ffe7c2', 0.4)
  shade.emissive = new THREE.Color('#ffc56a')
  shade.emissiveIntensity = 0.7
  const shadeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.16, 12), shade)
  shadeMesh.position.y = 1.2
  lamp.add(shadeMesh)
  const bulb = new THREE.PointLight('#ffc56a', 0.45, 3.5, 2)
  bulb.position.set(3.55, 1.05, -8.7)
  parent.add(bulb)
  box(parent, 1.15, 0.7, 0.04, 2.2, 1.15, -9.15, std('#f7f4ee', 0.9), false)
  box(parent, 0.9, 0.02, 0.01, 2.2, 1.15, -9.12, std('#3c4f73', 0.5), false)
}

function addCoffeeRoom(parent) {
  const wood = std('#c9845a', 0.72)
  const cream = std('#f6efe4', 0.8)
  const bar = new THREE.Group()
  bar.position.set(12.25, 0, 1.7)
  bar.rotation.y = -Math.PI / 2
  parent.add(bar)
  box(bar, 2.15, 0.78, 0.46, 0, 0.39, 0, std('#8d4e32', 0.84), true)
  box(bar, 2.25, 0.08, 0.54, 0, 0.82, 0, cream, true)
  box(bar, 0.28, 0.22, 0.22, -0.55, 0.98, 0.02, std('#3e3430', 0.55), true)
  box(bar, 0.1, 0.1, 0.1, -0.55, 1.14, 0, std('#d7d2cc', 0.45), false)
  const fridge = new THREE.Group()
  fridge.position.set(12.35, 0, 3.55)
  parent.add(fridge)
  box(fridge, 0.62, 1.35, 0.5, 0, 0.68, 0, std('#f4f7f6', 0.7), true)
  box(fridge, 0.5, 0.02, 0.42, 0, 0.95, 0.02, std('#d5ddd9', 0.6), false)
  box(fridge, 0.04, 0.28, 0.04, 0.22, 1.15, 0.26, std('#8d9492', 0.4), false)
  box(fridge, 0.04, 0.22, 0.04, 0.22, 0.55, 0.26, std('#8d9492', 0.4), false)

  const glow = std('#ffd2a8', 0.4)
  glow.emissive = new THREE.Color('#ff9a4a')
  glow.emissiveIntensity = 0.85
  box(bar, 0.08, 0.04, 0.06, -0.42, 1.02, 0.08, glow, false)
  for (const [cx, cup] of [[-0.15, '#f7f4ee'], [0.15, '#f3e7d8'], [0.55, '#6b3e2a']]) {
    cyl(bar, 0.045, 0.035, 0.07, cx, 0.9, 0.05, std(cup, 0.55), 10, true)
  }

  const tables = [[9.7, 1.2], [10.3, 4.15]]
  for (const [x, z] of tables) {
    cyl(parent, 0.32, 0.32, 0.06, x, 0.7, z, wood, 16, true)
    cyl(parent, 0.04, 0.05, 0.66, x, 0.33, z, std(WOOD_LEG, 0.7), 8, true)
    cyl(parent, 0.04, 0.032, 0.06, x + 0.08, 0.78, z, cream, 10, true)
    addChair(parent, x - 0.62, z, Math.PI / 2, '#a6846c', true)
    addChair(parent, x + 0.62, z, -Math.PI / 2, '#6e4f45', true)
  }

  const lampMat = std('#ffe0bf', 0.35)
  lampMat.emissive = new THREE.Color('#ffb15a')
  lampMat.emissiveIntensity = 1.1
  for (const [x, z] of [[9.7, 1.2], [10.3, 4.15], [12.05, 1.7]]) {
    cyl(parent, 0.012, 0.012, 0.55, x, 1.55, z, std('#5c4636', 0.6), 6, false)
    const shade = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), lampMat)
    shade.position.set(x, 1.22, z)
    shade.scale.y = 0.7
    parent.add(shade)
    const bulb = new THREE.PointLight('#ffb06a', 0.55, 3.2, 2)
    bulb.position.set(x, 1.15, z)
    parent.add(bulb)
  }
}

function addShelfUnit(parent, x, z, yaw) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  group.rotation.y = yaw
  parent.add(group)
  const wood = std('#8d684c', 0.75)
  box(group, 1.5, 0.06, 0.32, 0, 0.42, 0, wood)
  box(group, 1.5, 0.06, 0.32, 0, 0.86, 0, wood)
  box(group, 1.5, 0.06, 0.32, 0, 1.28, 0, wood)
  box(group, 0.06, 1.4, 0.32, -0.72, 0.7, 0, wood)
  box(group, 0.06, 1.4, 0.32, 0.72, 0.7, 0, wood)
  const colors = ['#3c4f73', '#e09a4e', '#2f6f6a', '#d46a4c', '#6b4c9a', '#8e949e', '#3e8f6e']
  colors.forEach((color, index) => {
    const shelf = index < 4 ? 0.58 : 1.02
    box(group, 0.08, 0.22, 0.2, -0.5 + (index % 4) * 0.28, shelf, 0, std(color, 0.8))
  })
}

function addLibrary(parent) {
  addShelfUnit(parent, 11.15, -8.55, 0)
  addShelfUnit(parent, 12.7, -8.55, 0)
  const wood = std(WOOD_TOP, 0.78)
  box(parent, 1.35, 0.07, 0.7, 11.9, 0.72, -6.55, wood)
  for (const [dx, dz] of [[-0.5, -0.24], [0.5, -0.24], [-0.5, 0.24], [0.5, 0.24]]) {
    box(parent, 0.06, 0.68, 0.06, 11.9 + dx, 0.34, -6.55 + dz, std(WOOD_LEG, 0.72))
  }
  box(parent, 0.24, 0.04, 0.18, 11.55, 0.78, -6.55, std('#f4f1ea', 0.9))
  box(parent, 0.2, 0.04, 0.14, 12.25, 0.78, -6.4, std('#3c4f73', 0.85))
}

function addPantry(parent) {
  const counter = std('#efe6d6', 0.82)
  box(parent, 0.55, 0.08, 1.7, -11.35, 0.86, 8.15, counter)
  box(parent, 0.48, 0.7, 1.6, -11.5, 0.4, 8.15, std('#c46a4a', 0.9))
  cyl(parent, 0.06, 0.05, 0.09, -11.15, 0.95, 7.6, std('#f7f4ee', 0.5), 12, true)
  cyl(parent, 0.055, 0.05, 0.08, -11.15, 0.94, 8.15, std('#3c4f73', 0.55), 12, true)
  cyl(parent, 0.05, 0.045, 0.07, -11.15, 0.93, 8.65, std('#e09a4e', 0.55), 12, true)
}

function addReception(parent) {
  const wood = std(WOOD_TOP, 0.78)
  box(parent, 1.15, 0.08, 0.42, -10.35, 0.86, 7.55, wood)
  box(parent, 1.15, 0.72, 0.36, -10.35, 0.4, 7.65, std('#3e534c', 0.9))
  box(parent, 0.24, 0.04, 0.16, -10.55, 0.94, 7.45, std('#f7f4ee', 0.85))
}

export function buildOffice(roster) {
  const byId = new Map(roster.map((bot) => [bot.id, bot]))
  const group = new THREE.Group()
  const mats = {
    floor: std(WOOD, 0.95),
    desk: std(WOOD_TOP, 0.78),
    deskLeg: std(WOOD_LEG, 0.74),
    metal: std('#8d9492', 0.45, { metalness: 0.12 }),
    bezel: std('#1c1e20', 0.55),
    keys: std('#2c2e30', 0.7),
    frame: std('#2a312f', 0.62),
    mullion: std('#6d655c', 0.72),
    wall: std('#f4f0e8', 0.97),
    plinth: std('#cfc6ba', 0.98),
    ground: std('#c5cfca', 1),
    board: std('#f7f4ee', 0.92),
    glass: new THREE.MeshStandardMaterial({
      color: '#e7f1ef',
      roughness: 0.08,
      metalness: 0,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    frost: new THREE.MeshStandardMaterial({
      color: '#f7fbfa',
      roughness: 0.45,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    window: new THREE.MeshStandardMaterial({
      color: '#d5e4ec',
      roughness: 0.05,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  }

  const width = BOUNDS.x1 - BOUNDS.x0
  const depth = BOUNDS.z1 - BOUNDS.z0
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), mats.ground)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.39
  ground.receiveShadow = true
  group.add(ground)

  box(group, width + 1.3, 0.28, depth + 1.3, 0, -0.24, 0, mats.plinth)

  const floor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, depth), mats.floor)
  floor.position.y = -0.05
  floor.receiveShadow = true
  floor.castShadow = false
  group.add(floor)

  for (const zone of ZONES) {
    const carpet = new THREE.Mesh(
      new THREE.BoxGeometry(zone.w, 0.018, zone.d),
      std(zone.color, 0.98),
    )
    carpet.position.set(zone.x + zone.w / 2, 0.012, zone.z + zone.d / 2)
    carpet.receiveShadow = true
    carpet.castShadow = false
    group.add(carpet)
  }

  addCarpetLabel(group, 'REPORTS TO MUSK', -0.4, -6.7, 5.4)
  addCarpetLabel(group, 'MEETING M', 6.6, 4.95, 2.3)
  addCarpetLabel(group, 'MEETING S', 3.6, 2.15, 1.8)
  addCarpetLabel(group, 'MEETING L', 7.3, -8.35, 2.6)
  addCarpetLabel(group, 'VACANT', 2.3, -8.55, 2.2)
  addCarpetLabel(group, 'KITCHEN', 10.7, 4.85, 2.4)
  addCarpetLabel(group, 'PRINTERS', 14.7, 4.7, 2.1)
  addCarpetLabel(group, 'REC', 11.2, 8.35, 2.2)
  addCarpetLabel(group, 'DESKS', -4.2, 2.5, 3.1)
  addCarpetLabel(group, 'LOBBY', -9.5, 7.7, 2.3)
  addCarpetLabel(group, 'REST', -0.3, 7.55, 2.3)
  addCarpetLabel(group, 'LIBRARY', 12.0, -7.7, 2.2)
  addCarpetLabel(group, 'SERVERS', 15.2, -4.7, 2.2)
  addCarpetLabel(group, 'SECURITY', 15.05, -2.55, 2.3)
  addCarpetLabel(group, 'SNACKS', -9.1, -2.15, 2.6)

  const wallH = 1.08
  box(group, 0.14, wallH, depth, BOUNDS.x0, wallH / 2, 0, mats.wall)
  box(group, 0.14, wallH, depth, BOUNDS.x1, wallH / 2, 0, mats.wall)
  box(group, width, 0.56, 0.14, 0, 0.28, BOUNDS.z1, mats.wall)
  addWindows(group, mats)

  const sky = new THREE.Mesh(new THREE.PlaneGeometry(80, 28), new THREE.MeshBasicMaterial({ map: skyTexture(), toneMapped: false }))
  sky.position.set(0, 6, -16)
  group.add(sky)

  addCornerOffice(group, mats)
  addMeeting(group)
  addSmallMeeting(group)
  addLargeMeeting(group)
  addVacantOffice(group)
  addCoffeeRoom(group)
  addRestRoom(group)
  addRecRoom(group)
  addBalcony(group)
  addLibrary(group)
  addPantry(group)
  addReception(group)
  addPinboard(group)

  const screens = []
  const desks = new Map()
  for (const spec of DESKS) {
    const bot = byId.get(spec.id)
    desks.set(spec.id, workstation(group, spec, bot, mats, screens))
  }

  const lounge = new Map()
  const sofaGroups = new Map()
  let chairIndex = 0
  for (const seat of LOUNGE) {
    lounge.set(seat.bot, { x: seat.x, z: seat.z, yaw: seat.yaw, low: seat.seat === 'cushion' })
    if (seat.seat === 'sofa') {
      if (!sofaGroups.has(seat.sofa)) sofaGroups.set(seat.sofa, [])
      sofaGroups.get(seat.sofa).push(seat)
    } else if (seat.seat === 'chair') {
      addChair(group, seat.x, seat.z, seat.yaw, LOUNGE_CHAIR_COLORS[chairIndex % LOUNGE_CHAIR_COLORS.length], true)
      chairIndex += 1
    } else {
      addCushion(group, seat)
    }
  }
  for (const [name, seats] of sofaGroups) addSofa(group, seats, SOFA_COLORS[name])

  addTable(group)
  addPlants(group)

  const research = []
  addResearch(group, research)
  const clock = clockCanvas()
  clock.draw(new Date())
  const clockMat = new THREE.MeshBasicMaterial({ map: clock.tex, toneMapped: false })
  const clockMesh = new THREE.Mesh(new THREE.CircleGeometry(0.28, 28), clockMat)
  clockMesh.position.set(-11.7, 1.42, 8.4)
  group.add(clockMesh)
  const lobbyPost = cyl(group, 0.04, 0.05, 1.15, -11.7, 0.55, 8.4, mats.frame, 8)
  lobbyPost.castShadow = true

  const digital = digitalClockTexture()
  digital.draw('9:00 AM', 'OFFICE TIME')
  const board = new THREE.Group()
  board.position.set(-9.85, 1.28, 8.4)
  group.add(board)
  box(board, 1.45, 0.52, 0.06, 0, 0, 0, std('#24312e', 0.6))
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(1.3, 0.4),
    new THREE.MeshBasicMaterial({ map: digital.tex, toneMapped: false }),
  )
  face.position.z = 0.04
  board.add(face)

  addStoryWalls(group)
  addSnackBars(group)
  const copier = addPrintersRoom(group)
  addCupProps(group)

  const leds = []
  addServers(group, leds)
  const watch = addSecurityRoom(group)
  addUsage(group)
  for (const sign of SIGNS) addSign(group, sign, mats.frame, mats.board)

  return {
    group,
    lounge,
    desks,
    screens,
    research,
    leds,
    beacon: leds.beacon,
    watch,
    clock,
    digital,
    copier,
    clockAt: 0,
    clockLabel: '',
  }
}

function addStoryWalls(parent) {
  const plaster = new Map()
  const paint = (hex) => {
    if (!plaster.has(hex)) plaster.set(hex, std(hex, 0.92))
    return plaster.get(hex)
  }
  const wood = std('#6a4b38', 0.75)
  const finialMat = std('#e2b340', 0.45, { metalness: 0.2 })
  const rugMat = std('#f4e2c4', 0.95)
  const glassMat = new THREE.MeshStandardMaterial({
    color: '#e7f6f4',
    roughness: 0.06,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  for (const portal of PORTALS) {
    if (portal.dir !== 'h' && portal.dir !== 'v') continue
    const gap = 0.9
    const wallMat = portal.glass ? glassMat : paint(portal.color)
    if (portal.dir === 'h') {
      hSeg(parent, portal.from, portal.x - gap, portal.z, wallMat, wood, finialMat)
      hSeg(parent, portal.x + gap, portal.to, portal.z, wallMat, wood, finialMat)
      doorway(parent, portal.x, portal.z, 0, wood, finialMat)
      box(parent, 1.5, 0.02, 0.7, portal.x, 0.03, portal.z, rugMat, false)
    } else {
      vSeg(parent, portal.from, portal.z - gap, portal.x, wallMat, wood, finialMat)
      vSeg(parent, portal.z + gap, portal.to, portal.x, wallMat, wood, finialMat)
      doorway(parent, portal.x, portal.z, Math.PI / 2, wood, finialMat)
      box(parent, 0.7, 0.02, 1.5, portal.x, 0.03, portal.z, rugMat, false)
    }
  }
}

function hSeg(parent, x0, x1, z, mat, wood) {
  if (x1 - x0 < 0.35) return
  const mid = (x0 + x1) / 2
  const len = x1 - x0
  box(parent, len, 1.22, 0.12, mid, 0.61, z, mat, true)
  box(parent, len, 0.08, 0.16, mid, 1.2, z, wood, false)
  box(parent, 0.14, 1.28, 0.16, x0, 0.64, z, wood, true)
  box(parent, 0.14, 1.28, 0.16, x1, 0.64, z, wood, true)
}

function vSeg(parent, z0, z1, x, mat, wood) {
  if (z1 - z0 < 0.35) return
  const mid = (z0 + z1) / 2
  const len = z1 - z0
  box(parent, 0.12, 1.22, len, x, 0.61, mid, mat, true)
  box(parent, 0.16, 0.08, len, x, 1.2, mid, wood, false)
  box(parent, 0.16, 1.28, 0.14, x, 0.64, z0, wood, true)
  box(parent, 0.16, 1.28, 0.14, x, 0.64, z1, wood, true)
}

function doorway(parent, x, z, rot, wood, finial) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  group.rotation.y = rot
  parent.add(group)
  for (const side of [-0.95, 0.95]) {
    const post = cyl(group, 0.07, 0.08, 1.35, side, 0.67, 0, wood, 8)
    post.castShadow = true
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), finial)
    ball.position.set(side, 1.4, 0)
    group.add(ball)
  }
  box(group, 2.05, 0.12, 0.16, 0, 1.32, 0, wood, false)
}

function addSnackBars(parent) {
  const counter = std('#f3e2c4', 0.78)
  const base = std('#c46a4a', 0.86)
  const stool = std('#3e534c', 0.8)
  const fruit = std('#de5d4a', 0.55)
  const tin = std('#e2b340', 0.5)
  const cracker = std('#f7f1e4', 0.7)
  const spots = SNACK_BARS.map((bar) => [bar.x, bar.z, bar.yaw])
  for (const [x, z, yaw] of spots) {
    const group = new THREE.Group()
    group.position.set(x, 0, z)
    group.rotation.y = yaw
    parent.add(group)
    box(group, 1.8, 0.86, 0.42, 0, 0.43, 0, base, true)
    box(group, 1.9, 0.08, 0.5, 0, 0.9, 0, counter, true)
    box(group, 0.16, 0.1, 0.12, -0.55, 0.98, 0, cracker, false)
    box(group, 0.14, 0.12, 0.1, -0.28, 1.0, 0.02, tin, false)
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), fruit)
    bowl.scale.y = 0.55
    bowl.position.set(0.15, 1.0, 0)
    group.add(bowl)
    cyl(group, 0.03, 0.022, 0.06, 0.5, 0.98, 0, std('#f4efe6', 0.55), 8, false)
    for (const sx of [-0.55, 0.1, 0.7]) {
      cyl(group, 0.12, 0.12, 0.06, sx, 0.42, -0.62, stool, 10, true)
      cyl(group, 0.04, 0.05, 0.36, sx, 0.2, -0.62, woodSafe(), 8, true)
    }
  }
}

function woodSafe() {
  return std('#8d684c', 0.75)
}

function addRecRoom(parent) {
  const felt = std('#3f8f72', 0.72)
  const line = std('#f7f4ee', 0.9)
  const table = new THREE.Group()
  table.position.set(7.85, 0, 7.45)
  parent.add(table)
  box(table, 2.35, 0.08, 1.22, 0, 0.74, 0, felt, true)
  box(table, 2.45, 0.1, 0.08, 0, 0.7, 0.62, std('#6b4c38', 0.75), true)
  box(table, 2.45, 0.1, 0.08, 0, 0.7, -0.62, std('#6b4c38', 0.75), true)
  box(table, 0.08, 0.1, 1.28, -1.18, 0.7, 0, std('#6b4c38', 0.75), true)
  box(table, 0.08, 0.1, 1.28, 1.18, 0.7, 0, std('#6b4c38', 0.75), true)
  for (const lx of [-0.9, 0.9]) {
    for (const lz of [-0.45, 0.45]) box(table, 0.06, 0.66, 0.06, lx, 0.33, lz, std('#8d684c', 0.75), true)
  }
  box(table, 0.02, 0.01, 1.05, 0, 0.785, 0, line, false)
  box(table, 1.7, 0.01, 0.02, 0, 0.785, 0, line, false)
  box(table, 0.04, 0.16, 1.05, 0, 0.9, 0, std('#f4efe6', 0.85), false)
  box(table, 0.16, 0.02, 0.28, -0.85, 0.8, 0.28, std('#d4533c', 0.6), false)
  box(table, 0.16, 0.02, 0.28, 0.85, 0.8, -0.22, std('#3c5f8a', 0.6), false)
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), std('#fffaf3', 0.4))
  ball.position.set(0.2, 0.84, 0.15)
  table.add(ball)

  const screenTex = new THREE.CanvasTexture(arcadeFace())
  screenTex.colorSpace = THREE.SRGBColorSpace
  const glow = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false })
  const cabinets = [[15.55, 6.7], [15.55, 7.55], [15.55, 8.4]]
  cabinets.forEach(([x, z], index) => {
    const cab = new THREE.Group()
    cab.position.set(x, 0, z)
    cab.rotation.y = -Math.PI / 2
    parent.add(cab)
    const body = std(index === 1 ? '#3a2a55' : '#2c3148', 0.6)
    box(cab, 0.62, 1.35, 0.48, 0, 0.68, 0, body, true)
    box(cab, 0.5, 0.08, 0.42, 0, 1.28, 0.08, std('#1c1824', 0.5), true)
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.42), glow)
    screen.position.set(0, 0.95, 0.25)
    cab.add(screen)
    cyl(cab, 0.025, 0.03, 0.08, -0.1, 0.62, 0.22, std('#e2b340', 0.45), 8, false)
    box(cab, 0.08, 0.02, 0.05, 0.08, 0.58, 0.22, std('#d4533c', 0.55), false)
  })
}

function arcadeFace() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 80
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#1a1030'
  ctx.fillRect(0, 0, 64, 80)
  const pixels = ['#7cf0d2', '#f2d15a', '#ef6d8a', '#8eb6ff']
  for (let i = 0; i < 18; i += 1) {
    ctx.fillStyle = pixels[i % pixels.length]
    ctx.fillRect(6 + (i * 7) % 48, 8 + (i * 11) % 58, 8, 8)
  }
  return canvas
}

function addBalcony(parent) {
  const wood = std('#6a4b38', 0.75)
  hSeg(parent, -13, 10.2, 9.2, std('#f4f0e8', 0.92), wood)
  const bench = new THREE.Group()
  bench.position.set(11.7, 0, 10.55)
  parent.add(bench)
  box(bench, 1.15, 0.08, 0.42, 0, 0.42, 0, std('#c9845a', 0.75), true)
  for (const lx of [-0.42, 0.42]) box(bench, 0.06, 0.38, 0.36, lx, 0.2, 0, wood, true)
  cyl(parent, 0.28, 0.28, 0.06, 14.35, 0.7, 10.85, std('#f3e2c4', 0.75), 14, true)
  cyl(parent, 0.04, 0.05, 0.66, 14.35, 0.33, 10.85, wood, 8, true)
  addChair(parent, 13.75, 10.85, Math.PI / 2, '#6e4f45', true)
  addChair(parent, 14.95, 10.85, -Math.PI / 2, '#3e5a50', true)
  const rail = std('#6a4b38', 0.7)
  for (let x = 10.5; x <= 16.3; x += 0.7) cyl(parent, 0.04, 0.045, 0.85, x, 0.42, 12.05, rail, 6, false)
  box(parent, 6.2, 0.06, 0.06, 13.4, 0.78, 12.05, rail, false)
  for (let z = 9.5; z <= 11.8; z += 0.7) cyl(parent, 0.04, 0.045, 0.85, 10.35, 0.42, z, rail, 6, false)
  box(parent, 0.06, 0.06, 2.5, 10.35, 0.78, 10.7, rail, false)
}

function addRestRoom(parent) {
  const lampMat = std('#ffe7cf', 0.4)
  lampMat.emissive = new THREE.Color('#ffc48a')
  lampMat.emissiveIntensity = 0.7
  for (const [x, z] of [[-2.4, 7.45], [2.1, 7.55]]) {
    cyl(parent, 0.012, 0.012, 0.5, x, 1.5, z, std('#6a5344', 0.6), 6, false)
    const shade = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), lampMat)
    shade.position.set(x, 1.18, z)
    shade.scale.y = 0.65
    parent.add(shade)
    const bulb = new THREE.PointLight('#ffc48a', 0.32, 3.4, 2)
    bulb.position.set(x, 1.1, z)
    parent.add(bulb)
  }
  const tv = new THREE.Group()
  tv.position.set(3.85, 0, 8.05)
  tv.rotation.y = -Math.PI / 2
  parent.add(tv)
  box(tv, 0.9, 0.08, 0.28, 0, 0.32, 0, std('#6a4b38', 0.75), true)
  box(tv, 0.72, 0.46, 0.06, 0, 0.72, 0, std('#1c1824', 0.55), true)
  const screen = std('#8eb6ff', 0.4)
  screen.emissive = new THREE.Color('#6aa4ff')
  screen.emissiveIntensity = 0.55
  box(tv, 0.58, 0.32, 0.02, 0, 0.72, 0.04, screen, false)
  const juke = new THREE.Group()
  juke.position.set(-4.75, 0, 8.45)
  parent.add(juke)
  box(juke, 0.48, 1.15, 0.4, 0, 0.58, 0, std('#f3e2c4', 0.7), true)
  box(juke, 0.36, 0.42, 0.04, 0, 0.85, 0.21, std('#3a2a55', 0.5), true)
  const tubes = ['#ef6d8a', '#7cf0d2', '#f2d15a', '#8eb6ff']
  tubes.forEach((color, index) => {
    const lamp = std(color, 0.35)
    lamp.emissive = new THREE.Color(color)
    lamp.emissiveIntensity = 0.9
    box(juke, 0.05, 0.28, 0.03, -0.12 + index * 0.08, 0.86, 0.24, lamp, false)
  })
}

function addPrintersRoom(parent) {
  const copier = addCopier(parent)
  const mate = new THREE.Group()
  mate.position.set(COPIER.x, 0, 2.7)
  mate.rotation.y = -Math.PI / 2
  parent.add(mate)
  box(mate, 0.62, 0.58, 0.42, 0, 0.42, 0, std('#ece7df', 0.75), true)
  box(mate, 0.5, 0.06, 0.36, 0, 0.74, 0, std('#3e534c', 0.65), true)
  box(mate, 0.28, 0.16, 0.22, 0.55, 0.2, 0, std('#f7f1e6', 0.8), true)
  for (const [px, pz, tall] of [[13.55, 0.55, 0.28], [13.55, 0.85, 0.18], [14.55, 4.45, 0.22]]) {
    box(parent, 0.32, 0.04, 0.24, px, 0.16 + tall, pz, std('#fffaf3', 0.9), false)
    box(parent, 0.34, tall, 0.26, px, tall / 2, pz, std('#d9c7a4', 0.85), true)
  }
  return copier
}

function addCopier(parent) {
  const group = new THREE.Group()
  group.position.set(COPIER.x, 0, COPIER.z)
  group.rotation.y = -Math.PI / 2
  parent.add(group)
  const body = std('#f7f1e6', 0.72)
  const trim = std('#3e534c', 0.65)
  box(group, 0.78, 0.72, 0.52, 0, 0.5, 0, body, true)
  box(group, 0.7, 0.08, 0.46, 0, 0.9, 0, trim, true)
  const lampMat = std('#d7f3c8', 0.4)
  lampMat.emissive = new THREE.Color('#8dceb0')
  lampMat.emissiveIntensity = 0.15
  box(group, 0.42, 0.04, 0.08, 0, 0.78, 0.22, lampMat, false)
  box(group, 0.5, 0.04, 0.28, 0, 0.72, -0.32, std('#e7d3b0', 0.8), false)
  const papers = [0, 1, 2].map((index) => {
    const page = box(group, 0.32, 0.012, 0.22, 0, 0.76 + index * 0.012, -0.32, std('#fffaf3', 0.9), false)
    page.visible = false
    return page
  })
  return { lamp: lampMat, papers }
}

function addCupProps(parent) {
  const mug = new THREE.CylinderGeometry(0.035, 0.028, 0.06, 10)
  const mat = std('#f4efe6', 0.55)
  const spots = [[-2.45, 0.42, 6.4], [-1.85, 0.42, 6.7], [-11.05, 0.96, 7.6], [-7.2, 0.98, -2.7]]
  for (const [x, y, z] of spots) {
    const cup = new THREE.Mesh(mug, mat)
    cup.position.set(x, y, z)
    cup.castShadow = true
    parent.add(cup)
  }
}

export function updateOffice(office, time, stateById, clockSample = null, copying = false, breach = false) {
  for (const screen of office.screens) {
    screen.mat.uniforms.uTime.value = time
    const info = stateById.get(screen.id)
    const state = info && typeof info === 'object' ? info.state : info
    const ci = info && typeof info === 'object' ? (info.ci || '') : ''
    const mark = ci === 'green' ? 1 : ci === 'failed' ? 2 : ci === 'pending' ? 3 : 0
    screen.mat.uniforms.uOn.value = state === 'working' || mark > 0 ? 1 : 0
    if (screen.mat.uniforms.uMark) screen.mat.uniforms.uMark.value = mark
  }
  for (const material of office.research) material.uniforms.uTime.value = time
  for (const led of office.leds) {
    const alarm = breach && led.userData.alarm
    const pulse = 0.5 + 0.5 * Math.sin(time * (alarm ? 7.5 : 2.1) + led.userData.phase)
    led.emissive.set(alarm ? '#e23b2f' : (led.userData.warm ? '#e07a3d' : '#7ec8ff'))
    led.emissiveIntensity = alarm ? 0.5 + pulse * 0.95 : 0.12 + pulse * 0.4
  }
  if (office.beacon) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 6.2)
    office.beacon.emissive.set(breach ? '#e23b2f' : '#7ec8ff')
    office.beacon.emissiveIntensity = breach ? 0.7 + pulse * 1.15 : 0.08
  }
  if (office.watch) {
    const pulse = 0.5 + 0.5 * Math.sin(time * (breach ? 6.4 : 1.7))
    office.watch.calm.color.set('#3fba7a')
    office.watch.alert.color.set(breach ? '#e23b2f' : '#3fba7a')
    office.watch.lamp.emissive.set(breach ? '#e23b2f' : '#e2b340')
    office.watch.lamp.emissiveIntensity = breach ? 0.75 + pulse * 1.05 : 0.28
  }
  const label = clockSample?.label
  if (label && label !== office.clockLabel) {
    office.clock.draw(clockSample.date)
    office.digital?.draw(label, clockSample.beat || 'OFFICE TIME')
    office.clockLabel = label
    office.clockAt = time
  } else if (!label && time - office.clockAt > 1) {
    const now = new Date()
    office.clock.draw(now)
    const h = now.getHours()
    const ap = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    const text = `${h12}:${String(now.getMinutes()).padStart(2, '0')} ${ap}`
    office.digital?.draw(text, 'LOBBY CLOCK')
    office.clockLabel = text
    office.clockAt = time
  }
  if (office.copier) {
    const pulse = copying ? 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 8)) : 0.12
    office.copier.lamp.emissiveIntensity = pulse
    const pages = copying ? 1 + Math.floor((time * 1.4) % 3) : 0
    office.copier.papers.forEach((page, index) => {
      page.visible = index < pages
    })
  }
}
