/** Shared status shape for the dev stub and the browser. */

import { ROSTER } from './roster.js'

export const STATES = ['idle', 'working', 'waiting', 'error', 'done']

export function sanitizeTask(task) {
  if (typeof task !== 'string') return ''
  return task.replace(/\s+/g, ' ').trim().slice(0, 140)
}

export function normalizeState(state) {
  return STATES.includes(state) ? state : null
}

export function blankBots() {
  return ROSTER.map((bot) => ({ name: bot.name, state: 'idle', task: '' }))
}

const byLower = new Map(ROSTER.map((bot) => [bot.name.toLowerCase(), bot.name]))

export function canonicalName(name) {
  if (typeof name !== 'string') return null
  return byLower.get(name.trim().toLowerCase()) || null
}

/**
 * Merge a POST or file payload onto a full roster.
 * Unknown names and bad states are reported, not applied.
 */
export function mergeStatus(current, payload) {
  const bots = current.map((bot) => ({ ...bot }))
  const index = new Map(bots.map((bot, i) => [bot.name, i]))
  const errors = []

  if (payload && payload.reset === true) {
    return { bots: blankBots(), errors }
  }

  const incoming = Array.isArray(payload?.bots)
    ? payload.bots
    : payload && typeof payload.name === 'string'
      ? [payload]
      : null

  if (!incoming) {
    errors.push('Expected { bots: [...] }, { name, state, task }, or { reset: true }.')
    return { bots, errors }
  }

  for (const raw of incoming) {
    if (!raw || typeof raw !== 'object') {
      errors.push('Skipped an entry that was not an object.')
      continue
    }
    const name = canonicalName(raw.name)
    if (!name) {
      errors.push(`Unknown bot "${String(raw.name ?? '')}".`)
      continue
    }
    const state = normalizeState(raw.state)
    if (!state) {
      errors.push(`Bad state for ${name}. Use ${STATES.join(', ')}.`)
      continue
    }
    const slot = index.get(name)
    bots[slot] = { name, state, task: sanitizeTask(raw.task) }
  }

  return { bots, errors }
}
