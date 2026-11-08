/** Compact one-floor storybook HQ. Y is up. Yaw 0 faces +Z (south). */

export const BOUNDS = { x0: -13, x1: 13, z0: -9.4, z1: 9.2 }

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
  { id: 'hall', title: 'TO MUSK', sub: 'Report path', carpet: '', x: -5, z: -9.4, w: 9.2, d: 5.6, color: '#ead7b0' },
  { id: 'library', title: 'LIBRARY', sub: '', carpet: 'LIBRARY', x: 4.2, z: -9.4, w: 8.8, d: 5.6, color: '#ddd4c4' },
  { id: 'pantry', title: 'SNACKS', sub: '', carpet: 'SNACKS', x: -13, z: -3.8, w: 8, d: 2.8, color: '#f0cbb8' },
  { id: 'corridor', title: 'CORRIDOR', sub: '', carpet: '', x: -5, z: -3.8, w: 18, d: 2.8, color: '#f3e6cf' },
  { id: 'desk', title: 'DESKS', sub: 'The team', carpet: 'DESKS', x: -13, z: -1, w: 16.4, d: 5, color: '#d5e0d4' },
  { id: 'meeting', title: 'MEETING', sub: 'Standup', carpet: 'MEETING', x: 3.4, z: -1, w: 4.9, d: 5, color: '#d5dbe3' },
  { id: 'coffee', title: 'COFFEE', sub: 'Café', carpet: 'COFFEE', x: 8.3, z: -1, w: 4.7, d: 5, color: '#f3c9a4' },
  { id: 'rest', title: 'LOBBY', sub: 'Arrive', carpet: 'LOBBY', x: -13, z: 4, w: 26, d: 5.2, color: '#f0d8c6' },
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
    z: 3.05,
    yaw: Math.PI,
  })),
]

export const MEETING_TABLE = { x: 5.75, z: 1.5 }
export const MEETING_SEATS = [
  { x: 5.05, z: 0.7, yaw: 0 },
  { x: 5.75, z: 0.7, yaw: 0 },
  { x: 6.45, z: 0.7, yaw: 0 },
  { x: 5.05, z: 2.3, yaw: Math.PI },
  { x: 5.75, z: 2.3, yaw: Math.PI },
  { x: 6.45, z: 2.3, yaw: Math.PI },
  { x: 4.4, z: 1.5, yaw: Math.PI / 2 },
  { x: 7.1, z: 1.5, yaw: -Math.PI / 2 },
]

/** Waiting bots wave just outside the meeting room, on the lobby side of the door. */
export const WAIT_SPOTS = [
  { x: 4.55, z: 4.55, yaw: Math.PI },
  { x: 6.95, z: 4.55, yaw: Math.PI },
]

export const SOFA_COLORS = {
  north: '#3e5a50',
  east: '#a6846c',
  west: '#343c48',
  south: '#8d9074',
}

/** Idle seats in the entrance lobby. */
export const LOUNGE = [
  { bot: 'grok-bot', x: -11.2, z: 4.85, yaw: 0, seat: 'sofa', sofa: 'north' },
  { bot: 'helios-forge', x: -9.6, z: 4.85, yaw: 0, seat: 'sofa', sofa: 'north' },
  { bot: 'aevum', x: -8.0, z: 4.85, yaw: 0, seat: 'sofa', sofa: 'north' },
  { bot: 'zaolang', x: -1.6, z: 4.85, yaw: 0, seat: 'sofa', sofa: 'north' },
  { bot: 'julang', x: 0, z: 4.85, yaw: 0, seat: 'sofa', sofa: 'north' },
  { bot: 'minisim', x: 1.6, z: 4.85, yaw: 0, seat: 'sofa', sofa: 'north' },
  { bot: 'quant', x: 3.2, z: 4.85, yaw: 0, seat: 'sofa', sofa: 'north' },
  { bot: 'linkup', x: 11.15, z: 4.85, yaw: 0, seat: 'sofa', sofa: 'north' },
  { bot: 'wavelive', x: 12.05, z: 4.85, yaw: 0, seat: 'sofa', sofa: 'north' },

  { bot: 'duckdb', x: -9.2, z: 8.35, yaw: Math.PI, seat: 'sofa', sofa: 'south' },
  { bot: 'vectorbt', x: -7.6, z: 8.35, yaw: Math.PI, seat: 'sofa', sofa: 'south' },
  { bot: 'skfolio', x: -6.0, z: 8.35, yaw: Math.PI, seat: 'sofa', sofa: 'south' },
  { bot: 'ccxt', x: 5.2, z: 8.35, yaw: Math.PI, seat: 'sofa', sofa: 'south' },
  { bot: 'cryptofeed', x: 6.8, z: 8.35, yaw: Math.PI, seat: 'sofa', sofa: 'south' },

  { bot: 'dr-eggbot', x: -12.15, z: 6.3, yaw: Math.PI / 2, seat: 'sofa', sofa: 'west' },
  { bot: 'freqtrade', x: -12.15, z: 7.7, yaw: Math.PI / 2, seat: 'sofa', sofa: 'west' },
  { bot: 'apscheduler', x: 12.15, z: 6.15, yaw: -Math.PI / 2, seat: 'sofa', sofa: 'east' },
  { bot: 'quantstats', x: 12.15, z: 7.55, yaw: -Math.PI / 2, seat: 'sofa', sofa: 'east' },

  { bot: 'musk', x: -3.5, z: 6.55, yaw: 0.5, seat: 'chair' },
  { bot: 'agent-display', x: -0.5, z: 7.35, yaw: 2.1, seat: 'chair' },
  { bot: 'lightweight-charts', x: -2.15, z: 7.85, yaw: -0.3, seat: 'chair' },
]

export const LOUNGE_CHAIR_COLORS = ['#3e5a50', '#6e4f45', '#343c48', '#a6846c', '#3e5a50', '#6e4f45', '#8d9074']

export const REST_TABLE = { x: -2.15, z: 6.55 }

export const PLANTS = [
  { x: -12.35, z: -8.7, s: 0.85 },
  { x: 12.35, z: -8.7, s: 0.75 },
  { x: -0.4, z: -8.85, s: 0.6 },
  { x: -12.4, z: 8.55, s: 0.7 },
  { x: 12.35, z: 8.5, s: 0.7 },
  { x: -12.45, z: 0.15, s: 0.55 },
]

export const LIBRARY_SPOTS = [
  { x: 7.7, z: -5.7, yaw: 0 },
  { x: 9.3, z: -5.7, yaw: 0 },
  { x: 8.5, z: -7.15, yaw: Math.PI },
]

/** Coffee-room seats. The lobby counter stays a greeting nook. */
export const PANTRY_SPOTS = [
  { x: 11.45, z: 1.15, yaw: Math.PI / 2, pose: 'stand' },
  { x: 11.45, z: 2.15, yaw: Math.PI / 2, pose: 'stand' },
  { x: 9.7, z: 1.55, yaw: Math.PI, pose: 'sit' },
]

export const COPY_SPOTS = [
  { x: 11.15, z: -2.35, yaw: Math.PI / 2 },
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

export const COPIER = { x: 12.05, z: -2.35 }

/**
 * Doorways between storybook rooms. dir h = wall runs along x at z.
 * from/to are the wall ends. lead↔hall is the glass door (no extra wall).
 */
export const PORTALS = [
  { a: 'lead', b: 'hall', x: DOOR.x, z: DOOR.z, dir: 'none' },
  { a: 'hall', b: 'library', x: 4.2, z: -6.4, dir: 'v', from: -9.4, to: -3.8, color: '#e7dcc4' },
  { a: 'hall', b: 'corridor', x: -0.4, z: -3.8, dir: 'h', from: -5, to: 4.2, color: '#f6e2b8' },
  { a: 'library', b: 'corridor', x: 9.1, z: -3.8, dir: 'h', from: 4.2, to: 13, color: '#e4d7c0' },
  { a: 'pantry', b: 'corridor', x: -5, z: -2.4, dir: 'v', from: -3.8, to: -1, color: '#f3c4b0' },
  { a: 'pantry', b: 'desk', x: -9, z: -1, dir: 'h', from: -13, to: -5, color: '#f0d0bc' },
  { a: 'corridor', b: 'desk', x: -1.2, z: -1, dir: 'h', from: -5, to: 3.4, color: '#f8e6c8' },
  { a: 'corridor', b: 'meeting', x: 5.75, z: -1, dir: 'h', from: 3.4, to: 8.3, color: '#d5e4f2' },
  { a: 'corridor', b: 'coffee', x: 10.6, z: -1, dir: 'h', from: 8.3, to: 13, color: '#f6d7b8' },
  { a: 'meeting', b: 'coffee', x: 8.3, z: 2.05, dir: 'v', from: -1, to: 4, color: '#f3dcc8' },
  { a: 'desk', b: 'meeting', x: 3.4, z: 1.5, dir: 'v', from: -1, to: 4, color: '#d7e4d4' },
  { a: 'desk', b: 'rest', x: -6.2, z: 4, dir: 'h', from: -13, to: 3.4, color: '#f6d0b0' },
  { a: 'meeting', b: 'rest', x: 5.75, z: 4, dir: 'h', from: 3.4, to: 8.3, color: '#f3d7c4' },
  { a: 'coffee', b: 'rest', x: 9.45, z: 4, dir: 'h', from: 8.3, to: 13, color: '#f6c9a8' },
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
  { title: 'LOBBY', sub: 'Arrive', x: -10.4, z: 5.35 },
  { title: 'MEETING', sub: 'Standup', x: 4.15, z: 3.35 },
  { title: 'COFFEE', sub: 'Café', x: 11.35, z: 3.35 },
  { title: 'DESKS', sub: 'The team', x: 2.15, z: 2.15 },
  { title: 'LIBRARY', sub: '', x: 5.15, z: -5.2 },
  { title: 'SNACKS', sub: '', x: -12.15, z: -1.7 },
]

const deskShot = { pos: [-4, 11, 8], target: [-4, 0.4, 1.6] }

export const PRESETS = {
  all: { pos: [0, 26, 24], target: [0, 0.2, -0.4] },
  lead: { pos: [-1.5, 8, -1.2], target: [-9.2, 0.6, -6.6] },
  hall: { pos: [0, 8, 1], target: [-0.4, 0.4, -6.6] },
  assistant: deskShot,
  product: deskShot,
  markets: deskShot,
  reviews: deskShot,
  opensource: { pos: [-4, 10, 9], target: [-4, 0.35, 3] },
  meeting: { pos: [5.75, 7.2, 6.6], target: [5.75, 0.4, 1.5] },
  coffee: { pos: [10.5, 6.2, 6.4], target: [10.7, 0.45, 1.55] },
  rest: { pos: [0, 10, 14], target: [0, 0.35, 6.4] },
  library: { pos: [8.4, 7.5, 0.4], target: [8.6, 0.5, -6.4] },
  pantry: { pos: [-7, 7, 1.5], target: [-9.2, 0.45, -2.5] },
  reception: { pos: [8, 6.5, 1.2], target: [12, 0.5, -2.3] },
  servers: { pos: [7, 6, -2], target: [5.2, 0.6, -7.2] },
  usage: { pos: [8, 4, 8.5], target: [12.2, 0.9, 6.8] },
  desk: deskShot,
  corridor: { pos: [2, 8, 2], target: [3, 0.4, -2.4] },
}

export const ZONE_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'rest', label: 'Lobby' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'desk', label: 'Desks' },
  { id: 'library', label: 'Library' },
  { id: 'pantry', label: 'Snacks' },
  { id: 'reception', label: 'Copier' },
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
