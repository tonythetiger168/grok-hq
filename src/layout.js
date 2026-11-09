/** Compact one-floor storybook HQ. Y is up. Yaw 0 faces +Z (south). */

export const BOUNDS = { x0: -13, x1: 16.6, z0: -9.4, z1: 12.2 }

/** musk's glass corner. The door is on the east wall, at the end of the report path. */
export const CORNER = { x0: -13, x1: -5, z0: -9.4, z1: -3.8 }
export const DOOR = { x: -4.55, z: -6.6 }
export const DOOR_GAP = { z0: -7.5, z1: -5.7 }

/** Where a handoff stands inside the suite, facing musk. */
export const VISITORS = [
  { x: -7.15, z: -6.15, yaw: -Math.PI / 2 },
  { x: -7.15, z: -7.15, yaw: -Math.PI / 2 },
]

export const ZONES = [
  { id: 'lead', title: 'MUSK', sub: 'Reports to musk', carpet: '', x: -13, z: -9.4, w: 8, d: 5.6, color: '#d9d0c2' },
  { id: 'hall', title: 'TO MUSK', sub: 'Report path', carpet: '', x: -5, z: -9.4, w: 5.4, d: 5.6, color: '#ead7b0' },
  { id: 'hall', title: 'TO MUSK', sub: 'Report path', carpet: '', x: 0.4, z: -6.2, w: 3.8, d: 2.4, color: '#ead7b0' },
  { id: 'vacant', title: 'VACANT', sub: 'Former office', carpet: 'VACANT', x: 0.4, z: -9.4, w: 3.8, d: 3.2, color: '#efe2c8' },
  { id: 'allhands', title: 'MEETING L', sub: 'All hands', carpet: 'MEETING L', x: 4.2, z: -9.4, w: 6.2, d: 5.6, color: '#d5d0c4' },
  { id: 'library', title: 'LIBRARY', sub: '', carpet: 'LIBRARY', x: 10.4, z: -9.4, w: 3.4, d: 5.6, color: '#ddd4c4' },
  { id: 'servers', title: 'SERVERS', sub: 'Room', carpet: 'SERVERS', x: 13.8, z: -9.4, w: 2.8, d: 5.6, color: '#c5d5e2' },
  { id: 'pantry', title: 'SNACKS', sub: '', carpet: 'SNACKS', x: -13, z: -3.8, w: 8, d: 2.8, color: '#f0cbb8' },
  { id: 'corridor', title: 'CORRIDOR', sub: '', carpet: '', x: -5, z: -3.8, w: 21.6, d: 2.8, color: '#f3e6cf' },
  { id: 'huddle', title: 'MEETING S', sub: 'Huddle', carpet: 'MEETING S', x: 2.6, z: -1, w: 2, d: 3.6, color: '#e4ddd4' },
  { id: 'desk', title: 'DESKS', sub: 'The team', carpet: 'DESKS', x: -13, z: -1, w: 17.6, d: 6.6, color: '#d5e0d4' },
  { id: 'meeting', title: 'MEETING M', sub: 'Standup', carpet: 'MEETING M', x: 4.6, z: -1, w: 4, d: 6.6, color: '#d5dbe3' },
  { id: 'coffee', title: 'COFFEE', sub: 'Café', carpet: 'COFFEE', x: 8.6, z: -1, w: 4.4, d: 6.6, color: '#f3c9a4' },
  { id: 'printers', title: 'PRINTERS', sub: 'Copy', carpet: 'PRINTERS', x: 13, z: -1, w: 3.6, d: 6.6, color: '#e4e7ea' },
  { id: 'rec', title: 'REC', sub: 'Play', carpet: 'REC', x: 4.6, z: 5.6, w: 12, d: 3.6, color: '#e3d4f2' },
  { id: 'balcony', title: 'BALCONY', sub: 'Outside', carpet: '', x: 10.2, z: 9.2, w: 6.4, d: 3, color: '#d5e6c8' },
  { id: 'rest', title: 'LOBBY', sub: 'Arrive', carpet: 'LOBBY', x: -13, z: 5.6, w: 7.8, d: 3.6, color: '#f0d8c6' },
  { id: 'lounge', title: 'REST', sub: 'Sit', carpet: 'REST', x: -5.2, z: 5.6, w: 9.8, d: 3.6, color: '#e7d5c8' },
]

const TEAM = [
  ['grok-bot', ''],
  ['dr-eggbot', 'studio'],
  ['helios-forge', ''],
  ['aevum', ''],
  ['zaolang', ''],
  ['julang', ''],
  ['minisim', ''],
  ['quant', ''],
  ['linkup', 'files'],
  ['wavelive', 'files'],
]

const STUDY = [
  'vectorbt',
  'agent-display',
  'apscheduler',
  'duckdb',
  'skfolio',
  'ccxt',
  'cryptofeed',
  'freqtrade',
  'quantstats',
  'lightweight-charts',
]

const DESK_X = [-11.7, -10.22, -8.74, -7.26, -5.78, -4.3, -2.82, -1.34, 0.14, 1.62]

export const DESKS = [
  { id: 'musk', x: -9.7, z: -6.6, yaw: Math.PI / 2 },
  ...TEAM.map(([id, extras], index) => ({
    id,
    x: DESK_X[index],
    z: 0.4,
    yaw: 0,
    ...(extras ? { extras } : {}),
  })),
  ...STUDY.map((id, index) => ({
    id,
    x: DESK_X[index],
    z: 4.25,
    yaw: Math.PI,
  })),
]

export const MEETING_TABLE = { x: 6.6, z: 3.6 }
export const MEETING_SEATS = [
  { x: 5.9, z: 2.75, yaw: 0 },
  { x: 6.6, z: 2.75, yaw: 0 },
  { x: 7.3, z: 2.75, yaw: 0 },
  { x: 5.9, z: 4.45, yaw: Math.PI },
  { x: 6.6, z: 4.45, yaw: Math.PI },
  { x: 7.3, z: 4.45, yaw: Math.PI },
  { x: 5.3, z: 3.6, yaw: Math.PI / 2 },
  { x: 7.9, z: 3.6, yaw: -Math.PI / 2 },
]

/** Waiting bots wave just outside the meeting room, on the desk side of the door. */
export const WAIT_SPOTS = [
  { x: 3.9, z: 1.15, yaw: Math.PI / 2 },
  { x: 3.9, z: 1.9, yaw: Math.PI / 2 },
]

export const SOFA_COLORS = {
  north: '#3e5a50',
  east: '#a6846c',
  west: '#343c48',
  south: '#8d9074',
}

/** Idle seats. A few greet in the lobby nook; the rest sit in the Rest room. */
export const LOUNGE = [
  { bot: 'grok-bot', x: -12.25, z: 6.5, yaw: 0, seat: 'sofa', sofa: 'north' },
  { bot: 'helios-forge', x: -11.4, z: 6.5, yaw: 0, seat: 'sofa', sofa: 'north' },
  { bot: 'aevum', x: -10.55, z: 6.5, yaw: 0, seat: 'sofa', sofa: 'north' },
  { bot: 'musk', x: -8.2, z: 7.15, yaw: 0.4, seat: 'chair' },
  { bot: 'agent-display', x: -7.3, z: 8.15, yaw: 2.2, seat: 'chair' },
  { bot: 'lightweight-charts', x: -8.7, z: 8.25, yaw: -0.4, seat: 'chair' },

  { bot: 'zaolang', x: -4.35, z: 6.5, yaw: 0, seat: 'sofa', sofa: 'west' },
  { bot: 'julang', x: -3.25, z: 6.5, yaw: 0, seat: 'sofa', sofa: 'west' },
  { bot: 'minisim', x: -2.15, z: 6.5, yaw: 0, seat: 'sofa', sofa: 'west' },
  { bot: 'quant', x: 1.15, z: 6.5, yaw: 0, seat: 'sofa', sofa: 'east' },
  { bot: 'linkup', x: 2.35, z: 6.5, yaw: 0, seat: 'sofa', sofa: 'east' },
  { bot: 'wavelive', x: 3.55, z: 6.5, yaw: 0, seat: 'sofa', sofa: 'east' },

  { bot: 'duckdb', x: -4.0, z: 8.4, yaw: Math.PI, seat: 'sofa', sofa: 'south' },
  { bot: 'vectorbt', x: -2.6, z: 8.4, yaw: Math.PI, seat: 'sofa', sofa: 'south' },
  { bot: 'skfolio', x: -1.2, z: 8.4, yaw: Math.PI, seat: 'sofa', sofa: 'south' },
  { bot: 'ccxt', x: 0.5, z: 8.4, yaw: Math.PI, seat: 'sofa', sofa: 'south' },
  { bot: 'cryptofeed', x: 1.9, z: 8.4, yaw: Math.PI, seat: 'sofa', sofa: 'south' },
  { bot: 'freqtrade', x: 3.3, z: 8.4, yaw: Math.PI, seat: 'sofa', sofa: 'south' },

  { bot: 'dr-eggbot', x: -0.15, z: 7.45, yaw: 0.2, seat: 'chair' },
  { bot: 'apscheduler', x: 1.15, z: 7.45, yaw: -0.4, seat: 'chair' },
  { bot: 'quantstats', x: 0.5, z: 7.95, yaw: 2.4, seat: 'chair' },
]

export const LOUNGE_CHAIR_COLORS = ['#3e5a50', '#6e4f45', '#343c48', '#a6846c', '#3e5a50', '#6e4f45', '#8d9074']

export const REST_TABLE = { x: -8.4, z: 7.55 }

export const PLANTS = [
  { x: -12.35, z: -8.7, s: 0.85 },
  { x: 12.35, z: -8.7, s: 0.75 },
  { x: -0.4, z: -8.85, s: 0.6 },
  { x: -12.45, z: 8.45, s: 0.55 },
  { x: -4.55, z: 7.35, s: 0.6 },
  { x: 4.2, z: 6.75, s: 0.5 },
  { x: 11.15, z: 11.35, s: 0.55 },
  { x: 15.7, z: 11.25, s: 0.6 },
  { x: -12.45, z: 0.15, s: 0.55 },
]

export const LIBRARY_SPOTS = [
  { x: 11.4, z: -6.4, yaw: 0 },
  { x: 12.5, z: -6.4, yaw: 0 },
  { x: 11.9, z: -7.5, yaw: Math.PI },
]

export const SERVER_SPOTS = [
  { x: 14.45, z: -7.6, yaw: Math.PI / 2, pose: 'stand' },
  { x: 14.45, z: -6.2, yaw: Math.PI / 2, pose: 'stand' },
]

/** Seats inside the Rest room. Wind-down walks here. */
export const REST_SPOTS = [
  { x: -4.35, z: 6.5, yaw: 0, pose: 'sit' },
  { x: 2.35, z: 6.5, yaw: 0, pose: 'sit' },
  { x: -2.6, z: 8.4, yaw: Math.PI, pose: 'sit' },
  { x: 1.9, z: 8.4, yaw: Math.PI, pose: 'sit' },
]

/** Coffee-room seats. The lobby counter stays a greeting nook. */
export const PANTRY_SPOTS = [
  { x: 11.45, z: 1.15, yaw: Math.PI / 2, pose: 'stand' },
  { x: 11.45, z: 2.15, yaw: Math.PI / 2, pose: 'stand' },
  { x: 9.7, z: 1.55, yaw: Math.PI, pose: 'sit' },
]

/** Break spots in the rec room: two at ping-pong, two at the arcade. */
export const BALCONY_SPOTS = [
  { x: 11.5, z: 10.5, yaw: 0.6, pose: 'sit' },
  { x: 14.2, z: 10.7, yaw: -0.8, pose: 'sit' },
]

export const REC_SPOTS = [
  { x: 6.15, z: 7.45, yaw: Math.PI / 2, pose: 'stand' },
  { x: 9.55, z: 7.45, yaw: -Math.PI / 2, pose: 'stand' },
  { x: 14.55, z: 6.75, yaw: Math.PI / 2, pose: 'stand' },
  { x: 14.55, z: 8.15, yaw: Math.PI / 2, pose: 'stand' },
]

export const COPY_SPOTS = [
  { x: 14.15, z: 1.55, yaw: Math.PI / 2, pose: 'stand' },
  { x: 14.15, z: 2.55, yaw: Math.PI / 2, pose: 'stand' },
]

/** Storybook grab-and-go bars off the corridor. */
export const SNACK_SPOTS = [
  { x: -10.7, z: -2.15, yaw: Math.PI / 2, pose: 'sit' },
  { x: -10.7, z: -2.85, yaw: Math.PI / 2, pose: 'sit' },
  { x: -9.7, z: -1.7, yaw: Math.PI, pose: 'stand' },
  { x: -7.7, z: -2.15, yaw: 0, pose: 'sit' },
  { x: -6.9, z: -2.55, yaw: Math.PI, pose: 'stand' },
]

export const SNACK_BARS = [
  { x: -11.15, z: -2.45, yaw: Math.PI / 2 },
  { x: -7.55, z: -3.05, yaw: 0 },
]

export const COPIER = { x: 15.45, z: 1.55 }

/**
 * Doorways between storybook rooms. dir h = wall runs along x at z.
 * from/to are the wall ends. lead↔hall is the glass door (no extra wall).
 */
export const PORTALS = [
  { a: 'lead', b: 'hall', x: DOOR.x, z: DOOR.z, dir: 'none' },
  { a: 'vacant', b: 'hall', x: 2.2, z: -6.2, dir: 'h', from: 0.4, to: 4.2, color: '#f0e2c4', glass: true },
  { a: 'vacant', b: 'allhands', x: 4.2, z: -7.8, dir: 'v', from: -9.4, to: -6.2, color: '#e7dcc4', glass: true },
  { a: 'hall', b: 'allhands', x: 4.2, z: -5.0, dir: 'v', from: -6.2, to: -3.8, color: '#ead7b0' },
  { a: 'allhands', b: 'library', x: 10.4, z: -6.6, dir: 'v', from: -9.4, to: -3.8, color: '#ddd4c4' },
  { a: 'hall', b: 'corridor', x: -0.4, z: -3.8, dir: 'h', from: -5, to: 4.2, color: '#f6e2b8' },
  { a: 'allhands', b: 'corridor', x: 7.2, z: -3.8, dir: 'h', from: 4.2, to: 10.4, color: '#d9d3c4' },
  { a: 'library', b: 'corridor', x: 12.1, z: -3.8, dir: 'h', from: 10.4, to: 13.8, color: '#e4d7c0' },
  { a: 'library', b: 'servers', x: 13.8, z: -6.6, dir: 'v', from: -9.4, to: -3.8, color: '#c5d5e2' },
  { a: 'servers', b: 'corridor', x: 15.2, z: -3.8, dir: 'h', from: 13.8, to: 16.6, color: '#b7c9d6' },
  { a: 'huddle', b: 'desk', x: 2.6, z: 0.7, dir: 'v', from: -1, to: 2.6, color: '#e4ddd4' },
  { a: 'huddle', b: 'desk', x: 3.6, z: 2.6, dir: 'h', from: 2.6, to: 4.6, color: '#e4ddd4' },
  { a: 'pantry', b: 'corridor', x: -5, z: -2.4, dir: 'v', from: -3.8, to: -1, color: '#f3c4b0' },
  { a: 'pantry', b: 'desk', x: -9, z: -1, dir: 'h', from: -13, to: -5, color: '#f0d0bc' },
  { a: 'corridor', b: 'desk', x: -1.2, z: -1, dir: 'h', from: -5, to: 2.6, color: '#f8e6c8' },
  { a: 'corridor', b: 'huddle', x: 3.6, z: -1, dir: 'h', from: 2.6, to: 4.6, color: '#e7ddd2' },
  { a: 'corridor', b: 'meeting', x: 6.6, z: -1, dir: 'h', from: 4.6, to: 8.6, color: '#d5e4f2', glass: true },
  { a: 'corridor', b: 'coffee', x: 10.8, z: -1, dir: 'h', from: 8.6, to: 13, color: '#f6d7b8' },
  { a: 'meeting', b: 'coffee', x: 8.6, z: 2.2, dir: 'v', from: -1, to: 5.6, color: '#f3dcc8', glass: true },
  { a: 'huddle', b: 'meeting', x: 4.6, z: 0.8, dir: 'v', from: -1, to: 2.6, color: '#d7e4d4', glass: true },
  { a: 'desk', b: 'meeting', x: 4.6, z: 4.1, dir: 'v', from: 2.6, to: 5.6, color: '#d7e4d4', glass: true },
  { a: 'lounge', b: 'rec', x: 4.6, z: 7.4, dir: 'v', from: 5.6, to: 9.2, color: '#e4d0f0' },
  { a: 'desk', b: 'rest', x: -9.2, z: 5.6, dir: 'h', from: -13, to: -5.2, color: '#f6d0b0' },
  { a: 'desk', b: 'lounge', x: -0.5, z: 5.6, dir: 'h', from: -5.2, to: 4.6, color: '#ead4c4' },
  { a: 'rest', b: 'lounge', x: -5.2, z: 7.5, dir: 'v', from: 5.6, to: 9.2, color: '#f0d2c0' },
  { a: 'coffee', b: 'printers', x: 13, z: 2.2, dir: 'v', from: -1, to: 5.6, color: '#e7e4de' },
  { a: 'corridor', b: 'printers', x: 14.8, z: -1, dir: 'h', from: 13, to: 16.6, color: '#e4e8ea' },
  { a: 'meeting', b: 'rec', x: 6.6, z: 5.6, dir: 'h', from: 4.6, to: 8.6, color: '#d9c8ee', glass: true },
  { a: 'coffee', b: 'rec', x: 10.8, z: 5.6, dir: 'h', from: 8.6, to: 13, color: '#e6d4f4' },
  { a: 'printers', b: 'rec', x: 14.8, z: 5.6, dir: 'h', from: 13, to: 16.6, color: '#ddd0ee' },
  { a: 'rec', b: 'balcony', x: 13.2, z: 9.2, dir: 'h', from: 10.2, to: 16.6, color: '#d5e8dc', glass: true },
]

const PORTAL_GRAPH = new Map()
for (const portal of PORTALS) {
  const door = { x: portal.x, z: portal.z }
  if (!PORTAL_GRAPH.has(portal.a)) PORTAL_GRAPH.set(portal.a, [])
  if (!PORTAL_GRAPH.has(portal.b)) PORTAL_GRAPH.set(portal.b, [])
  PORTAL_GRAPH.get(portal.a).push({ zone: portal.b, door })
  PORTAL_GRAPH.get(portal.b).push({ zone: portal.a, door })
}

export function zoneAt(x, z) {
  let best = 'rest'
  let bestD = Infinity
  for (const zone of ZONES) {
    const cx = Math.max(zone.x, Math.min(x, zone.x + zone.w))
    const cz = Math.max(zone.z, Math.min(z, zone.z + zone.d))
    const d = (x - cx) ** 2 + (z - cz) ** 2
    if (d < bestD) {
      bestD = d
      best = zone.id
    }
  }
  return best
}

export function routeThrough(ax, az, bx, bz) {
  const start = zoneAt(ax, az)
  const goal = zoneAt(bx, bz)
  if (start === goal) return []
  const prev = new Map([[start, null]])
  const queue = [start]
  while (queue.length) {
    const current = queue.shift()
    if (current === goal) break
    for (const edge of PORTAL_GRAPH.get(current) || []) {
      if (prev.has(edge.zone)) continue
      prev.set(edge.zone, { from: current, door: edge.door })
      queue.push(edge.zone)
    }
  }
  if (!prev.has(goal)) return []
  const doors = []
  let cursor = goal
  while (prev.get(cursor)) {
    doors.push(prev.get(cursor).door)
    cursor = prev.get(cursor).from
  }
  doors.reverse()
  return doors
}

export const SIGNS = [
  { title: 'LOBBY', sub: 'Arrive', x: -12.15, z: 7.55 },
  { title: 'REST', sub: 'Sit', x: 0.2, z: 7.05 },
  { title: 'VACANT', sub: 'Former office', x: 2.3, z: -8.7 },
  { title: 'MEETING S', sub: 'Huddle', x: 3.55, z: 1.7 },
  { title: 'MEETING M', sub: 'Standup', x: 5.35, z: 4.85 },
  { title: 'MEETING L', sub: 'All hands', x: 6.2, z: -8.5 },
  { title: 'KITCHEN', sub: 'Café', x: 9.4, z: 4.7 },
  { title: 'PRINTERS', sub: 'Copy', x: 14.2, z: 4.55 },
  { title: 'REC', sub: 'Play', x: 11.4, z: 8.45 },
  { title: 'DESKS', sub: 'The team', x: 2.4, z: 2.4 },
  { title: 'LIBRARY', sub: '', x: 11.6, z: -8.5 },
  { title: 'SERVERS', sub: 'Room', x: 14.55, z: -4.85 },
  { title: 'SNACKS', sub: '', x: -12.15, z: -1.7 },
]

const deskShot = { pos: [-4, 11, 8], target: [-4, 0.4, 1.6] }

export const PRESETS = {
  all: { pos: [1.6, 32, 30], target: [1.2, 0.2, 0.4] },
  lead: { pos: [-1.5, 8, -1.2], target: [-9.2, 0.6, -6.6] },
  hall: { pos: [0, 8, 1], target: [-0.4, 0.4, -6.6] },
  assistant: deskShot,
  product: deskShot,
  markets: deskShot,
  reviews: deskShot,
  opensource: { pos: [-4, 10, 9], target: [-4, 0.35, 3] },
  meeting: { pos: [6.6, 8, 8.2], target: [6.6, 0.4, 3.6] },
  coffee: { pos: [10.7, 8, 10], target: [10.8, 0.45, 4.2] },
  printers: { pos: [14.7, 8, 9], target: [14.8, 0.45, 2.4] },
  rec: { pos: [10.5, 13, 15.5], target: [11.2, 0.2, 7.6] },
  balcony: { pos: [13.2, 6.5, 14.2], target: [13.2, 0.4, 10.6] },
  rest: { pos: [-9.4, 9.5, 11.2], target: [-9.6, 0.2, 7.6] },
  lounge: { pos: [-0.2, 9.2, 11.4], target: [-0.3, 0.2, 7.5] },
  library: { pos: [13.2, 7.5, 1], target: [13.4, 0.5, -6.6] },
  vacant: { pos: [2.2, 6.5, -2.5], target: [2.3, 0.5, -7.8] },
  huddle: { pos: [3.6, 6, 4.2], target: [3.6, 0.4, 0.8] },
  allhands: { pos: [7.2, 8, -1], target: [7.3, 0.4, -6.6] },
  pantry: { pos: [-7, 7, 1.5], target: [-9.2, 0.45, -2.5] },
  reception: { pos: [14.6, 6.2, 6.5], target: [14.8, 0.45, 1.6] },
  servers: { pos: [15.1, 6.2, -2.2], target: [15.3, 0.7, -6.8] },
  usage: { pos: [8, 4, 8.5], target: [12.2, 0.9, 6.8] },
  desk: deskShot,
  corridor: { pos: [2, 8, 2], target: [3, 0.4, -2.4] },
}

export const ZONE_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'rest', label: 'Lobby' },
  { id: 'lounge', label: 'Rest' },
  { id: 'huddle', label: 'Meet S' },
  { id: 'meeting', label: 'Meet M' },
  { id: 'allhands', label: 'Meet L' },
  { id: 'vacant', label: 'Vacant' },
  { id: 'coffee', label: 'Kitchen' },
  { id: 'printers', label: 'Printers' },
  { id: 'rec', label: 'Rec' },
  { id: 'balcony', label: 'Balcony' },
  { id: 'desk', label: 'Desks' },
  { id: 'library', label: 'Library' },
  { id: 'servers', label: 'Servers' },
  { id: 'pantry', label: 'Snacks' },
  { id: 'lead', label: 'musk' },
]

export function assertLayout(roster) {
  const ids = new Set(roster.map((bot) => bot.id))
  const loungeIds = LOUNGE.map((seat) => seat.bot)
  const deskIds = DESKS.map((desk) => desk.id)
  if (new Set(loungeIds).size !== loungeIds.length) throw new Error('Duplicate rest seat')
  if (new Set(deskIds).size !== deskIds.length) throw new Error('Duplicate desk')
  if (loungeIds.length !== ids.size || deskIds.length !== ids.size) {
    throw new Error(`Layout count rest ${loungeIds.length} desks ${deskIds.length} roster ${ids.size}`)
  }
  for (const id of ids) {
    if (!loungeIds.includes(id)) throw new Error(`Missing rest seat for ${id}`)
    if (!deskIds.includes(id)) throw new Error(`Missing desk for ${id}`)
  }
  if (!deskIds.includes('musk')) throw new Error('musk needs the suite desk')
  const width = BOUNDS.x1 - BOUNDS.x0
  const depth = BOUNDS.z1 - BOUNDS.z0
  if (width > 30 || depth > 22) throw new Error('The floor should stay one compact story')
}
