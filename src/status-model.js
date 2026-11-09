/** Shared status shape for the dev stub and the browser. */

import { ROSTER } from './roster.js'
import { CI_STATES, PR_STATES, cleanOpsEnum, sanitizePlan } from './ops-summary.js'

export const STATES = ['idle', 'working', 'waiting', 'error', 'done']
export { CI_STATES, PR_STATES }

export function sanitizeTask(task) {
  if (typeof task !== 'string') return ''
  return task.replace(/\s+/g, ' ').trim().slice(0, 140)
}

export function normalizeState(state) {
  return STATES.includes(state) ? state : null
}

export function blankBots() {
  return ROSTER.map((bot) => ({
    name: bot.name,
    state: 'idle',
    task: '',
    plan: '',
    pr: '',
    ci: '',
  }))
}

export function canonicalName(name) {
  if (typeof name !== 'string') return null
  const key = name.trim().toLowerCase()
  const bot = ROSTER.find((item) => item.name.toLowerCase() === key)
  return bot?.name || null
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
    if (raw.pr !== undefined && raw.pr !== '' && !cleanOpsEnum(raw.pr, PR_STATES)) {
      errors.push(`Bad pr for ${name}. Use ${PR_STATES.join(', ')}.`)
      continue
    }
    if (raw.ci !== undefined && raw.ci !== '' && !cleanOpsEnum(raw.ci, CI_STATES)) {
      errors.push(`Bad ci for ${name}. Use ${CI_STATES.join(', ')}.`)
      continue
    }
    const slot = index.get(name)
    const prev = bots[slot]
    bots[slot] = {
      name,
      state,
      task: sanitizeTask(raw.task),
      plan: raw.plan === undefined ? (prev.plan || '') : sanitizePlan(raw.plan),
      pr: raw.pr === undefined ? (prev.pr || '') : cleanOpsEnum(raw.pr, PR_STATES),
      ci: raw.ci === undefined ? (prev.ci || '') : cleanOpsEnum(raw.ci, CI_STATES),
    }
  }

  return { bots, errors }
}
