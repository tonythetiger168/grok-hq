/** Floor-plan coordinates in meters. Y is up. Yaw 0 faces +Z (south). */

export const BOUNDS = { x0: -22.2, x1: 22.2, z0: -18.2, z1: 18.2 }

/** musk's glass suite. The door is on the east wall. */
export const CORNER = { x0: -21.6, x1: -11.4, z0: -17.6, z1: -8.4 }
export const DOOR = { x: -10.95, z: -11.8 }
export const DOOR_GAP = { z0: -12.8, z1: -10.8 }

/** Where a handoff stands inside the suite, facing musk. */
export const VISITORS = [
  { x: -13.05, z: -11.35, yaw: -Math.PI / 2 },
  { x: -13.05, z: -12.45, yaw: -Math.PI / 2 },
]

export const ZONES = [
  { id: 'lead', title: 'MUSK', sub: 'Reports to musk', carpet: '', x: -21.6, z: -17.6, w: 10.2, d: 9.2, color: '#d7d0c4' },
  { id: 'meeting', title: 'MEETING', sub: 'Standup', carpet: 'MEETING', x: -10.6, z: -17.6, w: 15.0, d: 9.2, color: '#d5dbe3' },
  { id: 'product', title: 'PRODUCT', sub: 'Aevum · Helios', carpet: 'PRODUCT', x: 5.2, z: -17.6, w: 16.4, d: 9.2, color: '#c9d4c7' },
  { id: 'assistant', title: 'ASSISTANT', sub: 'Grok Bot', carpet: 'ASSISTANT', x: -21.6, z: -7.6, w: 10.2, d: 8.4, color: '#d4dbdc' },
  { id: 'rest', title: 'REST', sub: 'Idle', carpet: 'REST', x: -10.6, z: -7.6, w: 18.4, d: 8.4, color: '#ead6c8' },
  { id: 'library', title: 'LIBRARY', sub: '', carpet: 'LIBRARY', x: 8.6, z: -7.6, w: 13.0, d: 8.4, color: '#ddd4c4' },
  { id: 'pantry', title: 'PANTRY', sub: '', carpet: 'PANTRY', x: -21.6, z: 1.6, w: 8.2, d: 7.2, color: '#e7d3c4' },
  { id: 'markets', title: 'MARKETS', sub: 'Quant', carpet: 'MARKETS / QUANT', x: -12.6, z: 1.6, w: 12.2, d: 7.2, color: '#e7d7b8' },
  { id: 'reviews', title: 'REVIEWS', sub: '', carpet: 'REVIEWS', x: 0.4, z: 1.6, w: 10.2, d: 7.2, color: '#e6d4c9' },
  { id: 'reception', title: 'RECEPTION', sub: '', carpet: 'RECEPTION', x: 11.4, z: 1.6, w: 10.2, d: 7.2, color: '#efe6d8' },
  { id: 'servers', title: 'SERVERS', sub: '', carpet: 'SERVERS', x: -21.6, z: 9.6, w: 8.2, d: 8.0, color: '#cfd3d4' },
  { id: 'opensource', title: 'OPEN-SOURCE', sub: 'Study', carpet: 'OPEN-SOURCE STUDY', x: -12.6, z: 9.6, w: 34.2, d: 8.0, color: '#d8d7e3' },
]

const OSS_IDS = [
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

export const DESKS = [
  { id: 'musk', x: -16.6, z: -12.7, yaw: Math.PI },
  { id: 'grok-bot', x: -18.4, z: -3.5, yaw: 0 },
  { id: 'dr-eggbot', x: -14.8, z: -3.5, yaw: 0, extras: 'studio' },
  { id: 'helios-forge', x: 7.0, z: -12.4, yaw: Math.PI },
  { id: 'aevum', x: 10.2, z: -12.4, yaw: Math.PI },
  { id: 'zaolang', x: 13.4, z: -12.4, yaw: Math.PI },
  { id: 'julang', x: 16.6, z: -12.4, yaw: Math.PI },
  { id: 'minisim', x: 19.6, z: -12.4, yaw: Math.PI },
  { id: 'quant', x: -6.6, z: 5.5, yaw: Math.PI },
  { id: 'linkup', x: 3.0, z: 4.8, yaw: Math.PI, extras: 'files' },
  { id: 'wavelive', x: 6.8, z: 4.8, yaw: Math.PI, extras: 'files' },
  ...OSS_IDS.map((id, index) => ({
    id,
    x: -10.2 + index * 3.25,
    z: 14.15,
    yaw: Math.PI,
  })),
]

export const MEETING_TABLE = { x: -3.4, z: -13.0 }
export const MEETING_SEATS = [
  { x: -4.5, z: -14.15, yaw: 0 },
  { x: -3.4, z: -14.15, yaw: 0 },
  { x: -2.3, z: -14.15, yaw: 0 },
  { x: -4.5, z: -11.85, yaw: Math.PI },
  { x: -3.4, z: -11.85, yaw: Math.PI },
  { x: -2.3, z: -11.85, yaw: Math.PI },
  { x: -5.25, z: -13.0, yaw: Math.PI / 2 },
  { x: -1.55, z: -13.0, yaw: -Math.PI / 2 },
]

/** Waiting bots can wave here, just outside the meeting room. */
export const WAIT_SPOTS = [
  { x: -4.6, z: -8.05, yaw: 0 },
  { x: -2.2, z: -8.05, yaw: 0 },
]

export const SOFA_COLORS = {
  north: '#3e5a50',
  east: '#a6846c',
  west: '#343c48',
  south: '#8d9074',
}

/** Idle seats in the rest area. */
export const LOUNGE = [
  { bot: 'grok-bot', x: -7.5, z: -6.25, yaw: 0, seat: 'sofa', sofa: 'north' },
  { bot: 'helios-forge', x: -5.9, z: -6.25, yaw: 0, seat: 'sofa', sofa: 'north' },
  { bot: 'aevum', x: -4.3, z: -6.25, yaw: 0, seat: 'sofa', sofa: 'north' },

  { bot: 'zaolang', x: 6.3, z: -5.5, yaw: -Math.PI / 2, seat: 'sofa', sofa: 'east' },
  { bot: 'julang', x: 6.3, z: -3.9, yaw: -Math.PI / 2, seat: 'sofa', sofa: 'east' },
  { bot: 'duckdb', x: 6.3, z: -2.3, yaw: -Math.PI / 2, seat: 'sofa', sofa: 'east' },

  { bot: 'quant', x: -9.15, z: -5.1, yaw: Math.PI / 2, seat: 'sofa', sofa: 'west' },
  { bot: 'linkup', x: -9.15, z: -3.5, yaw: Math.PI / 2, seat: 'sofa', sofa: 'west' },
  { bot: 'dr-eggbot', x: -9.15, z: -1.9, yaw: Math.PI / 2, seat: 'sofa', sofa: 'west' },

  { bot: 'minisim', x: -3.5, z: -0.45, yaw: Math.PI, seat: 'sofa', sofa: 'south' },
  { bot: 'wavelive', x: -1.9, z: -0.45, yaw: Math.PI, seat: 'sofa', sofa: 'south' },
  { bot: 'vectorbt', x: -0.3, z: -0.45, yaw: Math.PI, seat: 'sofa', sofa: 'south' },

  { bot: 'musk', x: -7.7, z: -1.55, yaw: 0.5, seat: 'chair' },
  { bot: 'agent-display', x: -5.5, z: -1.25, yaw: 1.1, seat: 'chair' },
  { bot: 'apscheduler', x: 0.9, z: -1.35, yaw: -2.5, seat: 'chair' },
  { bot: 'skfolio', x: 2.7, z: -1.65, yaw: -2.2, seat: 'chair' },
  { bot: 'ccxt', x: 4.55, z: -3.45, yaw: -1.15, seat: 'chair' },
  { bot: 'cryptofeed', x: 4.35, z: -5.15, yaw: -0.35, seat: 'chair' },
  { bot: 'freqtrade', x: -6.5, z: -3.7, yaw: 0.7, seat: 'chair' },

  { bot: 'quantstats', x: -0.9, z: -3.55, yaw: 0.2, seat: 'cushion' },
  { bot: 'lightweight-charts', x: 1.5, z: -4.55, yaw: -0.2, seat: 'cushion' },
]

export const LOUNGE_CHAIR_COLORS = ['#3e5a50', '#6e4f45', '#343c48', '#a6846c', '#3e5a50', '#6e4f45', '#8d9074']

export const REST_TABLE = { x: -3.15, z: -3.25 }

export const PLANTS = [
  { x: -20.5, z: -16.4, s: 1.05 },
  { x: -20.4, z: -1.3, s: 0.9 },
  { x: 6.6, z: -1.15, s: 0.95 },
  { x: 20.4, z: -16.5, s: 0.8 },
  { x: 20.2, z: -1.4, s: 1 },
  { x: -20.3, z: 7.4, s: 0.75 },
  { x: 20.3, z: 7.2, s: 0.85 },
  { x: -19.6, z: 16.2, s: 0.8 },
  { x: 20.2, z: 16.3, s: 0.85 },
  { x: 2.2, z: -16.4, s: 0.7 },
]

export const SIGNS = [
  { title: 'MUSK', sub: 'Reports to musk', x: -10.3, z: -8.15 },
  { title: 'MEETING', sub: 'Standup', x: 2.6, z: -8.15 },
  { title: 'PRODUCT', sub: 'Aevum · Helios', x: 13.2, z: -8.15 },
  { title: 'ASSISTANT', sub: 'Grok Bot', x: -16.6, z: 0.35 },
  { title: 'REST', sub: 'Idle', x: -1.2, z: 0.35 },
  { title: 'LIBRARY', sub: '', x: 15.2, z: 0.35 },
  { title: 'PANTRY', sub: '', x: -17.4, z: 8.35 },
  { title: 'MARKETS', sub: 'Quant', x: -6.4, z: 8.35 },
  { title: 'REVIEWS', sub: '', x: 5.2, z: 8.35 },
  { title: 'RECEPTION', sub: '', x: 16.4, z: 8.35 },
  { title: 'SERVERS', sub: '', x: -17.6, z: 17.15 },
  { title: 'OPEN-SOURCE', sub: 'Study', x: 4.5, z: 11.05 },
]

export const PRESETS = {
  all: { pos: [2, 38, 40], target: [0, 0.3, -1] },
  lead: { pos: [-8.5, 8.5, -3.5], target: [-16.4, 0.7, -13] },
  assistant: { pos: [-12, 8, 3], target: [-16.6, 0.5, -3.4] },
  product: { pos: [13, 10, -3], target: [13.2, 0.45, -12.6] },
  meeting: { pos: [-3.4, 9, -5], target: [-3.4, 0.5, -13] },
  rest: { pos: [-2, 9, 5], target: [-2.2, 0.4, -3.6] },
  library: { pos: [15, 8, 3.5], target: [15, 0.6, -4] },
  pantry: { pos: [-14, 7, 8], target: [-18.5, 0.5, 4.6] },
  markets: { pos: [-6, 8, 10], target: [-6.6, 0.7, 4] },
  reviews: { pos: [5, 8, 11], target: [4.8, 0.5, 4.6] },
  reception: { pos: [16.5, 7, 12], target: [16.4, 0.6, 5] },
  opensource: { pos: [4, 11, 24], target: [4, 0.4, 13.5] },
  servers: { pos: [-14, 8, 18], target: [-18, 0.6, 13] },
  usage: { pos: [16.6, 2.3, 11.4], target: [16.6, 0.95, 6.2] },
}

export const ZONE_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'lead', label: 'musk' },
  { id: 'assistant', label: 'Assistant' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'rest', label: 'Rest' },
  { id: 'library', label: 'Library' },
  { id: 'product', label: 'Product' },
  { id: 'markets', label: 'Markets' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'opensource', label: 'Open source' },
  { id: 'reception', label: 'Reception' },
  { id: 'pantry', label: 'Pantry' },
  { id: 'usage', label: 'Usage' },
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
}
