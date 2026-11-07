import { ROSTER } from './roster.js'
import { MEETING_SEATS } from './layout.js'
import { blankBots, canonicalName, normalizeState, sanitizeTask } from './status-model.js'

const SHIFT_SECONDS = 8

function slotState(slot) {
  if (slot >= 16) return 'idle'
  if (slot >= 8) return 'working'
  if (slot >= 5) return 'waiting'
  if (slot >= 3) return 'error'
  if (slot >= 1) return 'done'
  return 'idle'
}

export function placeFor(state, id, index = 0) {
  if (id === 'musk') return state === 'idle' ? 'rest' : 'musk-desk'
  if (state === 'idle') return 'rest'
  if (state === 'waiting') return index % 2 === 0 ? 'wait-meeting' : 'wait-desk'
  if (state === 'error') return 'wait-desk'
  return 'desk'
}

function simTask(bot, state, place) {
  if (place === 'handoff') return 'Simulated · handing work to musk'
  if (place === 'meeting') return 'Simulated · standup in the meeting room'
  if (state === 'working' && bot.id === 'musk') return 'Simulated · reviewing handoffs'
  if (state === 'working') return `Simulated · ${bot.sim}`
  if (state === 'waiting') return 'Simulated · waiting for you'
  if (state === 'error') return 'Simulated · blocked on a question'
  if (state === 'done') return 'Simulated · finished a pass'
  return ''
}

export function wantsSimulation(href = location.href) {
  const url = new URL(href, 'http://local')
  const hash = url.hash.replace('#', '')
  if (url.searchParams.get('simulate') === '0') return false
  return (
    url.searchParams.get('simulate') === '1' ||
    url.searchParams.has('demo') ||
    hash === 'demo' ||
    hash === 'simulate'
  )
}

export function createStatus() {
  let simulating = false
  let simT = 0
  let bucket = 0
  let source = 'default'
  let error = ''
  let live = blankBots()
  const listeners = new Set()

  function simulated() {
    const n = ROSTER.length
    const shift = Math.floor(simT / SHIFT_SECONDS) % n
    const standup = (simT % 24) < 8
    const rows = ROSTER.map((bot, index) => {
      const slot = (index - shift + n * 8) % n
      const state = bot.id === 'musk' ? (slot >= 18 ? 'idle' : 'working') : slotState(slot)
      let place = placeFor(state, bot.id, index)
      if (state === 'done' && bot.id !== 'musk') place = 'handoff'
      return { ...bot, state, place, meetIndex: 0, task: '', origin: 'simulation' }
    })
    if (standup) {
      let meet = 0
      for (const row of rows) {
        if (row.state === 'working' && row.id !== 'musk' && meet < Math.min(6, MEETING_SEATS.length)) {
          row.place = 'meeting'
          row.meetIndex = meet
          meet += 1
        }
      }
    }
    for (const row of rows) row.task = simTask(row, row.state, row.place)
    return rows
  }

  function liveView() {
    const map = new Map(live.map((bot) => [bot.name, bot]))
    return ROSTER.map((bot, index) => {
      const row = map.get(bot.name) || { state: 'idle', task: '' }
      const state = row.state
      const place = placeFor(state, bot.id, index)
      return { ...bot, state, place, meetIndex: 0, task: row.task || '', origin: source }
    })
  }

  function snapshot() {
    const bots = simulating ? simulated() : liveView()
    const active = bots.some((bot) => bot.state !== 'idle')
    let badge = 'ALL IDLE'
    if (simulating) badge = 'SIMULATION'
    else if (active) badge = 'LIVE'
    let note = 'No status loaded yet.'
    if (simulating) note = 'Playing in this browser only. Nothing is saved.'
    else if (error) note = error
    else if (source === 'api') note = 'Reading the dev status API.'
    else if (source === 'file') note = 'Reading status.json.'
    return { simulating, source, error, badge, note, bots }
  }

  function emit() {
    const snap = snapshot()
    for (const listener of listeners) listener(snap)
  }

  function applyPayload(data) {
    const next = blankBots()
    const index = new Map(next.map((bot, i) => [bot.name, i]))
    const list = Array.isArray(data?.bots) ? data.bots : []
    for (const raw of list) {
      const name = canonicalName(raw?.name)
      const state = normalizeState(raw?.state)
      if (!name || !state) continue
      next[index.get(name)] = { name, state, task: sanitizeTask(raw?.task) }
    }
    live = next
  }

  return {
    on(listener) {
      listeners.add(listener)
      listener(snapshot())
      return () => listeners.delete(listener)
    },
    snapshot,
    setSimulating(on) {
      simulating = on
      if (on) {
        simT = 0
        bucket = 0
      }
      emit()
    },
    isSimulating() {
      return simulating
    },
    tick(dt) {
      if (!simulating) return
      simT += dt
      const next = Math.floor(simT / SHIFT_SECONDS)
      if (next !== bucket) {
        bucket = next
        emit()
      }
    },
    async poll() {
      try {
        let response = await fetch('/api/status', { cache: 'no-store' })
        let nextSource = 'api'
        if (!response.ok) {
          response = await fetch('/status.json', { cache: 'no-store' })
          nextSource = 'file'
        }
        if (!response.ok) throw new Error(`Status responded ${response.status}`)
        const data = await response.json()
        applyPayload(data)
        source = nextSource
        error = ''
      } catch {
        error = 'Status could not be read. Showing idle unless a simulation is running.'
      }
      if (!simulating) emit()
    },
  }
}
