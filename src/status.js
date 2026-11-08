import { ROSTER } from './roster.js'
import { MEETING_SEATS } from './layout.js'
import { blankBots, canonicalName, normalizeState, sanitizeTask } from './status-model.js'
import { CI_STATES, PR_STATES, cleanOpsEnum, factFromOps, sanitizePlan } from './ops-summary.js'
import {
  beatAt,
  beatTitle,
  clockDate,
  formatOfficeTime,
  officeMinute,
  parseClock,
  parseWork,
  simTForMinute,
  workdayAt,
} from './day.js'
import { ackFor } from './lines.js'

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
  if (url.searchParams.get('day') === '1' || hash === 'day') return false
  if (url.searchParams.get('ops') === '1' || hash === 'ops') return false
  return (
    url.searchParams.get('simulate') === '1' ||
    url.searchParams.has('demo') ||
    hash === 'demo' ||
    hash === 'simulate'
  )
}

export function wantsDay(href = location.href) {
  const url = new URL(href, 'http://local')
  const hash = url.hash.replace('#', '')
  if (url.searchParams.get('day') === '0') return false
  if (url.searchParams.get('ops') === '1' || hash === 'ops') return false
  return url.searchParams.get('day') === '1' || hash === 'day'
}

export function wantsOps(href = location.href) {
  const url = new URL(href, 'http://local')
  const hash = url.hash.replace('#', '')
  if (url.searchParams.get('ops') === '0') return false
  return url.searchParams.get('ops') === '1' || hash === 'ops'
}

/** Place live rows in the office. One done bot reports; working bots can stand up. */
export function arrangeOps(rows) {
  const team = rows.filter((row) => row.id !== 'musk')
  const working = team.filter((row) => row.state === 'working')
  const standup = working.length >= 2
  const reporter = team.find((row) => row.state === 'done') || null
  const active = team.some((row) => row.state !== 'idle')
  let meet = 0
  return rows.map((row) => {
    const fact = factFromOps(row.pr, row.ci)
    if (row.id === 'musk') {
      if (!active) return { ...row, state: 'idle', place: 'rest', fact: 'plan' }
      const reportFact = reporter ? factFromOps(reporter.pr, reporter.ci) : 'plan'
      return {
        ...row,
        state: 'working',
        place: 'musk-desk',
        fact: reportFact,
        task: reporter ? 'Deciding on a report' : 'Reading plan, PR, and CI',
      }
    }
    if (reporter && row.id === reporter.id) {
      return {
        ...row,
        place: 'handoff',
        fact,
        returnPlace: 'desk',
        task: row.task || 'Reporting plan, PR, and CI',
      }
    }
    if (row.state === 'done') {
      return { ...row, place: 'desk', fact, task: row.task || 'Waiting to report to musk' }
    }
    if (standup && row.state === 'working' && meet < 4) {
      const meetIndex = meet
      meet += 1
      return { ...row, place: 'meeting', meetIndex, fact, task: row.task || 'Standup on the live work' }
    }
    if (row.state === 'idle') return { ...row, place: 'rest', fact }
    if (row.state === 'error') return { ...row, place: 'wait-desk', fact, task: row.task || 'Stuck' }
    if (row.state === 'waiting') return { ...row, fact, task: row.task || 'Waiting' }
    return { ...row, place: 'desk', fact, task: row.task || 'Working the live status' }
  })
}

export function dayStartFromUrl(href = location.href) {
  const url = new URL(href, 'http://local')
  return parseClock(url.searchParams.get('at'))
}

function orderPhase(t) {
  if (t < 3.2) return 'ack'
  if (t < 18) return 'work'
  if (t < 36) return 'report'
  if (t < 54) return 'follow'
  return 'gone'
}

function heardTask(bot, fact) {
  if (fact === 'ci-failed') return 'Using the chat: looking at failed CI'
  if (fact === 'ci-green') return 'Using the chat: CI is green, next step'
  if (fact === 'pr-open') return 'Using the chat: reviewing the open PR'
  if (fact === 'pr-closed') return 'Using the chat: PR is closed, next step'
  return 'Using the chat: next plan step'
}

export function createStatus() {
  let mode = 'off'
  let simT = 0
  let bucket = -1
  let source = 'default'
  let error = ''
  let live = blankBots()
  let opsNote = ''
  const listeners = new Set()
  const orders = new Map()
  const intel = new Map()

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
      const pr = cleanOpsEnum(row.pr, PR_STATES)
      const ci = cleanOpsEnum(row.ci, CI_STATES)
      return {
        ...bot,
        state: row.state,
        place: placeFor(row.state, bot.id, index),
        meetIndex: 0,
        task: row.task || '',
        origin: source,
        plan: row.plan || '',
        pr,
        ci,
        fact: factFromOps(pr, ci),
        prTitle: row.prTitle || '',
        prSource: row.prSource || '',
        ciSource: row.ciSource || '',
      }
    })
  }

  function baseRows() {
    if (mode === 'day') return workdayAt(officeMinute(simT), intel)
    if (mode === 'sim') return simulated()
    const rows = liveView()
    return mode === 'ops' ? arrangeOps(rows) : rows
  }

  function applyLocal(rows) {
    let reporter = null
    for (const [id, order] of orders) {
      if (order.phase === 'report' && (!reporter || order.t < reporter.t)) reporter = id
    }
    const scheduleHandoff = rows.some((row) => row.place === 'handoff' && !orders.has(row.id))
    return rows.map((row) => {
      const order = orders.get(row.id)
      if (order) {
        const bot = ROSTER.find((item) => item.id === row.id)
        if (order.phase === 'ack') {
          return { ...row, state: 'working', task: order.text, fact: order.fact, follow: order.follow, bark: order.ack }
        }
        if (order.phase === 'work') {
          return {
            ...row,
            state: 'working',
            place: order.workPlace,
            spot: order.spot,
            task: order.text,
            fact: order.fact,
            follow: order.follow,
            cup: order.workPlace === 'snack' ? 'sip' : 'none',
            bark: '',
          }
        }
        if (order.phase === 'report') {
          if (row.id === 'musk') {
            return { ...row, state: 'working', place: 'musk-desk', task: order.text, fact: order.fact }
          }
          if (scheduleHandoff || reporter !== row.id) {
            return { ...row, state: 'working', place: order.workPlace, task: 'Waiting to report to musk', fact: order.fact, follow: order.follow }
          }
          return {
            ...row,
            state: 'done',
            place: 'handoff',
            task: order.text,
            fact: order.fact,
            ci: order.ci,
            follow: order.follow,
            returnPlace: order.workPlace === 'handoff' ? 'desk' : order.workPlace,
            bark: '',
          }
        }
        if (order.phase === 'follow') {
          return {
            ...row,
            state: 'working',
            place: 'desk',
            task: order.followTask,
            fact: order.fact,
            follow: order.follow,
            bark: '',
          }
        }
        return row
      }
      const info = mode === 'day' ? null : intel.get(row.id)
      if (!info || row.place === 'handoff' || row.id === 'musk') return row
      return {
        ...row,
        state: 'working',
        place: info.fact === 'pr-open' ? 'library' : 'desk',
        fact: info.fact,
        task: heardTask(botSafe(row), info.fact),
      }
    })
  }

  function botSafe(row) {
    return ROSTER.find((item) => item.id === row.id) || row
  }

  function snapshot() {
    const day = mode === 'day'
    const ops = mode === 'ops'
    const simulating = mode === 'sim'
    const minute = day ? officeMinute(simT) : 0
    const beat = day ? beatAt(minute) : ''
    const bots = applyLocal(baseRows())
    const active = bots.some((bot) => bot.state !== 'idle')
    let badge = 'ALL IDLE'
    if (day) badge = 'WORKDAY'
    else if (ops) badge = 'OPERATIONS'
    else if (mode === 'sim') badge = 'SIMULATION'
    else if (active) badge = 'LIVE'
    let note = 'No status loaded yet.'
    if (day) note = 'Workday plays in this browser only. Nothing is saved.'
    else if (mode === 'sim') note = 'Playing in this browser only. Nothing is saved.'
    else if (ops) note = opsNote || 'Operations reads status and GitHub. This tab does not write either.'
    else if (error) note = error
    else if (source === 'api') note = 'Reading the dev status API.'
    else if (source === 'file') note = 'Reading status.json.'
    return {
      simulating,
      day,
      ops,
      mode,
      source,
      error,
      badge,
      note,
      clock: day ? formatOfficeTime(minute) : '',
      beat,
      beatLabel: day ? beatTitle(beat) : '',
      minute,
      bots,
    }
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
      next[index.get(name)] = {
        name,
        state,
        task: sanitizeTask(raw?.task),
        plan: sanitizePlan(raw?.plan),
        pr: cleanOpsEnum(raw?.pr, PR_STATES),
        ci: cleanOpsEnum(raw?.ci, CI_STATES),
        prTitle: sanitizePlan(raw?.prTitle),
        prSource: raw?.prSource === 'github' || raw?.prSource === 'status' ? raw.prSource : '',
        ciSource: raw?.ciSource === 'github' || raw?.ciSource === 'status' ? raw.ciSource : '',
      }
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
    setMode(next, minute = null) {
      mode = next === 'day' || next === 'sim' || next === 'ops' ? next : 'off'
      simT = mode === 'day' && minute != null ? simTForMinute(minute) : 0
      bucket = -1
      emit()
    },
    setSimulating(on) {
      mode = on ? 'sim' : 'off'
      simT = 0
      bucket = -1
      emit()
    },
    isSimulating() {
      return mode === 'sim'
    },
    clockSample() {
      if (mode !== 'day') return null
      const minute = officeMinute(simT)
      return {
        date: clockDate(minute),
        label: formatOfficeTime(minute),
        beat: beatTitle(beatAt(minute)),
      }
    },
    canAssign(id) {
      const row = snapshot().bots.find((bot) => bot.id === id)
      if (!row || row.id === 'musk') return row?.state === 'idle' && !orders.has(id)
      return row.state === 'idle' && !orders.has(id)
    },
    assign(id, text) {
      const parsed = parseWork(text)
      if (!parsed) return { ok: false, reason: 'empty' }
      const row = snapshot().bots.find((bot) => bot.id === id)
      if (!row) return { ok: false, reason: 'missing' }
      if (row.state !== 'idle' || orders.has(id)) return { ok: false, reason: 'busy' }
      const bot = ROSTER.find((item) => item.id === id)
      const followTask = parsed.fact === 'ci-failed'
        ? 'Fixing the failed CI'
        : parsed.fact === 'pr-open'
          ? 'Reviewing the open PR'
          : parsed.fact === 'pr-closed'
            ? 'Next plan step after the closed PR'
            : 'Next plan step'
      orders.set(id, {
        ...parsed,
        t: 0,
        phase: 'ack',
        spot: 0,
        ack: ackFor({ def: bot, name: bot.name }, parsed),
        followTask,
      })
      emit()
      return { ok: true }
    },
    hear(id, fact) {
      if (!id || id === 'musk' || !fact || orders.has(id)) return
      intel.set(id, { fact, ttl: 26 })
      emit()
    },
    tick(dt) {
      let changed = false
      for (const [id, order] of orders) {
        order.t += dt
        const phase = orderPhase(order.t)
        if (phase !== order.phase) {
          order.phase = phase
          changed = true
          if (phase === 'gone') orders.delete(id)
        }
      }
      for (const [id, info] of intel) {
        info.ttl -= dt
        if (info.ttl <= 0) {
          intel.delete(id)
          changed = true
        }
      }
      if (mode === 'off' || mode === 'ops') {
        if (changed) emit()
        return
      }
      simT += dt
      const next = mode === 'day' ? Math.floor(officeMinute(simT)) : Math.floor(simT / SHIFT_SECONDS)
      if (next !== bucket) {
        bucket = next
        changed = true
      }
      if (changed) emit()
    },
    async poll() {
      try {
        let response
        let nextSource
        if (mode === 'ops') {
          response = await fetch('/api/ops', { cache: 'no-store' })
          nextSource = 'ops'
          if (!response.ok) {
            response = await fetch('/api/status', { cache: 'no-store' })
            nextSource = 'api'
          }
        } else {
          response = await fetch('/api/status', { cache: 'no-store' })
          nextSource = 'api'
        }
        if (!response.ok) {
          response = await fetch('/status.json', { cache: 'no-store' })
          nextSource = 'file'
        }
        if (!response.ok) throw new Error(`Status responded ${response.status}`)
        const data = await response.json()
        applyPayload(data)
        source = nextSource
        error = ''
        opsNote = typeof data?.note === 'string' ? data.note : ''
        if (mode === 'ops' && !opsNote) {
          opsNote = 'GitHub could not be read. PR and CI come only from status fields.'
        }
      } catch {
        error = 'Status could not be read. Showing idle unless a simulation is running.'
        if (mode === 'ops') opsNote = error
      }
      if (mode === 'off' || mode === 'ops') emit()
    },
  }
}
